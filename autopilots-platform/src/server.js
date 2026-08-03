import crypto from "node:crypto";
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DemoStore } from "./demo-store.js";
import { SupabaseAuthGateway } from "./auth/supabase.js";
import { SupabaseSessionStore } from "./auth/session-store.js";
import { fetchAutoreviewsSnapshot } from "./adapters/autoreviews.js";
import { fetchPortfolioHealth, fetchProductHealth } from "./adapters/product-health.js";
import { loadRuntimeConfig } from "./config.js";
import { MonitoringScheduler } from "./monitoring/scheduler.js";
import { OperatingSystemStore, osCatalog } from "./os-store.js";
import { routeAllowed } from "./policy.js";
import { createPostgresConnection, FoundationRepository } from "./persistence/postgres.js";
import { SupabaseControlPlaneRepository } from "./persistence/supabase-control-plane.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");
const runtimeConfig = loadRuntimeConfig();
const authGateway = runtimeConfig.authProvider === "supabase" ? new SupabaseAuthGateway({
  url: runtimeConfig.supabaseUrl,
  publishableKey: runtimeConfig.supabasePublishableKey
}) : null;
const managedSessionStore = runtimeConfig.authProvider === "supabase" ? new SupabaseSessionStore({
  url: runtimeConfig.supabaseUrl,
  serviceRoleKey: runtimeConfig.supabaseServiceRoleKey
}) : null;
const managedSessionHealth = managedSessionStore ? await managedSessionStore.health() : null;
const controlPlaneRepository = runtimeConfig.authProvider === "supabase" ? new SupabaseControlPlaneRepository({
  url: runtimeConfig.supabaseUrl,
  serviceRoleKey: runtimeConfig.supabaseServiceRoleKey
}) : null;
const database = runtimeConfig.databaseUrl ? await createPostgresConnection({
  databaseUrl: runtimeConfig.databaseUrl,
  max: runtimeConfig.databasePoolMax
}) : null;
const foundationRepository = database ? new FoundationRepository(database) : null;
const databaseHealth = foundationRepository ? await foundationRepository.health() : null;
const store = new DemoStore();
const osStore = new OperatingSystemStore();
const sessions = new Map();
const loginAttempts = new Map();
const port = runtimeConfig.port;
const host = runtimeConfig.host;
const sessionTtlMs = 8 * 60 * 60 * 1000;
const managedSessionTtlMs = 55 * 60 * 1000;
const loginWindowMs = 15 * 60 * 1000;
const loginLimit = 8;
const companyCatalog = osCatalog.brands.map((brand) => ({
  id: brand.slug,
  operatingBrandId: brand.id,
  legalEntityId: brand.legalEntityId,
  name: brand.name,
  code: brand.code,
  status: brand.status === "active" ? "active" : "setup"
}));
const monitoringScheduler = new MonitoringScheduler({
  enabled: runtimeConfig.monitoringSchedulerEnabled,
  intervalMs: runtimeConfig.monitoringIntervalMs,
  leaseSeconds: runtimeConfig.monitoringLeaseSeconds,
  staleAfterSeconds: runtimeConfig.monitoringStaleAfterSeconds,
  authorityPrincipalId: runtimeConfig.monitoringAuthorityPrincipalId,
  brandSlugs: companyCatalog.map((company) => company.id),
  repository: controlPlaneRepository,
  probe: fetchProductHealth,
  runImmediately: runtimeConfig.monitoringRunImmediately
});

const demoUsers = [
  {
    id: "usr_customer_demo",
    email: "demo@curacao-auto.example",
    code: process.env.DEMO_CUSTOMER_CODE || "autopilots-demo",
    role: "customer",
    organizationId: "org_curacao_auto",
    name: "Curaçao Auto Center",
    companyIds: ["autopilots"]
  },
  {
    id: "usr_internal_demo",
    email: "operator@autopilots.example",
    code: process.env.DEMO_INTERNAL_CODE || "autopilots-internal",
    role: "internal",
    organizationId: "org_curacao_auto",
    name: "Autopilots Operator",
    companyIds: ["autopilots", "autoreviews", "autoplanner", "roofplanner"]
  }
];

const customerRoutes = new Set([
  "/", "/demo", "/requirements", "/voorstel", "/documenten", "/afrekenen",
  "/betaling-geslaagd", "/onboarding", "/secure-data-room", "/integraties", "/testen", "/activiteit"
]);
const internalRoutes = new Set([
  "/control-center", "/control-center/portfolio", "/control-center/tasks", "/control-center/agents", "/control-center/approvals",
  "/control-center/access", "/control-center/security", "/control-center/audit", "/control-center/implementaties/impl_001"
]);
const assets = new Set(["/workspace.html", "/workspace.js", "/workspace.css", "/app.css", "/ap-logo.svg"]);
const sessionCookieName = runtimeConfig.authProvider === "supabase" ? "ap_session" : "ap_demo_session";

class HttpError extends Error {
  constructor(status, message, code = undefined) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (url.pathname === "/health" && req.method === "GET") {
      return json(res, 200, {
        ok: true,
        service: "autopilots-platform",
        mode: runtimeConfig.mode,
        demoMode: runtimeConfig.mode === "demo",
        auth: runtimeConfig.authProvider === "demo" ? "server_demo_session" : runtimeConfig.authProvider,
        persistence: managedSessionHealth?.durable
          ? "supabase_durable_sessions"
          : databaseHealth?.foundation_installed ? "postgres_foundation" : "memory_demo",
        monitoring: monitoringScheduler.status(),
        externalWritesEnabled: runtimeConfig.externalWritesEnabled
      });
    }

    if (url.pathname === "/api/v1/session/capabilities" && req.method === "GET") {
      return json(res, 200, { provider: runtimeConfig.authProvider, magicLink: runtimeConfig.authProvider === "supabase" });
    }
    if (url.pathname === "/api/v1/session/login" && req.method === "POST") return await login(req, res);
    if (url.pathname === "/api/v1/session/exchange" && req.method === "POST") return await exchangeManagedSession(req, res);
    if (url.pathname === "/api/v1/session/mfa/prepare" && req.method === "POST") return await prepareManagedMfa(req, res);
    if (url.pathname === "/api/v1/session/mfa/verify" && req.method === "POST") return await verifyManagedMfa(req, res);
    if (url.pathname === "/api/v1/session/logout" && req.method === "POST") return await logout(req, res);
    if (url.pathname === "/api/v1/session" && req.method === "GET") {
      const session = await requireSession(req);
      return json(res, 200, { user: publicUser(session) });
    }

    if (url.pathname === "/api/v1/os/portfolio" && req.method === "GET") {
      const session = await requireSession(req);
      return json(res, 200, controlPlaneRepository
        ? await controlPlaneRepository.portfolio(session.id, session.organizationId)
        : osStore.portfolio(session));
    }

    if (url.pathname === "/api/v1/approvals" && req.method === "GET") {
      if (!controlPlaneRepository) throw new HttpError(404, "Managed approvals zijn niet actief");
      const session = await requireSession(req);
      requireInternal(session);
      return json(res, 200, await controlPlaneRepository.approvalQueue(session.id, session.organizationId));
    }

    if (url.pathname === "/api/v1/operations/queue" && req.method === "GET") {
      if (!controlPlaneRepository) throw new HttpError(404, "Managed operations zijn niet actief");
      const session = await requireSession(req);
      requireInternal(session);
      return json(res, 200, await controlPlaneRepository.operationsQueue(session.id, session.organizationId));
    }

    if (url.pathname === "/api/v1/operations/runbooks" && req.method === "GET") {
      if (!controlPlaneRepository) throw new HttpError(404, "Managed foutrunbooks zijn niet actief");
      const session = await requireSession(req);
      requireInternal(session);
      return json(res, 200, await controlPlaneRepository.errorRunbooks(session.id, session.organizationId));
    }

    if (url.pathname === "/api/v1/operations/alert-policy" && req.method === "GET") {
      if (!controlPlaneRepository) throw new HttpError(404, "Managed alertbeleid is niet actief");
      const session = await requireSession(req);
      requireInternal(session);
      return json(res, 200, await controlPlaneRepository.alertPolicySnapshot(session.id, session.organizationId));
    }

    if (url.pathname === "/api/v1/monitoring/history" && req.method === "GET") {
      if (!controlPlaneRepository) throw new HttpError(404, "Managed monitoringhistorie is niet actief");
      const session = await requireSession(req);
      requireInternal(session);
      return json(res, 200, await controlPlaneRepository.monitoringHistory(session.id, session.organizationId));
    }

    if (url.pathname === "/api/v1/security/posture" && req.method === "GET") {
      if (!controlPlaneRepository) throw new HttpError(404, "Managed beveiligingsstatus is niet actief");
      const session = await requireSession(req);
      requireInternal(session);
      return json(res, 200, await controlPlaneRepository.securityPosture(
        session.id, session.organizationId, session.sessionId || null
      ));
    }

    if (url.pathname === "/api/v1/audit/timeline" && req.method === "GET") {
      if (!controlPlaneRepository) throw new HttpError(404, "Managed auditspoor is niet actief");
      const session = await requireSession(req);
      requireInternal(session);
      return json(res, 200, await controlPlaneRepository.auditTimeline(session.id, session.organizationId));
    }

    if (url.pathname.startsWith("/api/v1/agents/brands/") && req.method === "GET") {
      if (!controlPlaneRepository) throw new HttpError(404, "Managed agentregistry is niet actief");
      const slug = decodeURIComponent(url.pathname.slice("/api/v1/agents/brands/".length));
      if (!slug || slug.includes("/")) throw new HttpError(404, "Operating brand niet gevonden");
      const session = await requireSession(req);
      requireInternal(session);
      return json(res, 200, await controlPlaneRepository.agentRegistry(session.id, slug));
    }

    if (url.pathname === "/api/v1/brand-launch/requests" && req.method === "GET") {
      if (!controlPlaneRepository) throw new HttpError(404, "Managed softwarelaunches zijn niet actief");
      const session = await requireSession(req);
      requireInternal(session);
      return json(res, 200, await controlPlaneRepository.brandLaunchRequests(session.id, session.organizationId));
    }

    if (url.pathname === "/api/v1/brand-launch/requests" && req.method === "POST") {
      if (!controlPlaneRepository) throw new HttpError(404, "Managed softwarelaunches zijn niet actief");
      const session = await requireSession(req);
      requireInternal(session);
      requireManagedMfa(session);
      const body = await parseBody(req);
      const result = await controlPlaneRepository.stageBrandLaunchRequest(
        session.id, session.organizationId, body, String(req.headers["idempotency-key"] || "")
      );
      return json(res, result.replayed ? 200 : 201, result);
    }

    if (url.pathname.startsWith("/api/v1/brand-launch/requests/")
      && url.pathname.endsWith("/decision") && req.method === "POST") {
      if (!controlPlaneRepository) throw new HttpError(404, "Managed softwarelaunches zijn niet actief");
      const requestId = decodeURIComponent(url.pathname.slice(
        "/api/v1/brand-launch/requests/".length,
        -"/decision".length
      ));
      if (!requestId || requestId.includes("/")) throw new HttpError(404, "Nieuw softwareverzoek niet gevonden");
      const session = await requireSession(req);
      requireInternal(session);
      requireManagedMfa(session);
      const body = await parseBody(req);
      return json(res, 200, await controlPlaneRepository.decideBrandLaunchRequest(
        session.id, session.organizationId, requestId, String(body.decision || ""),
        Number(body.contextVersion), String(req.headers["idempotency-key"] || "")
      ));
    }

    if (url.pathname.startsWith("/api/v1/onboarding/brands/") && req.method === "GET") {
      if (!controlPlaneRepository) throw new HttpError(404, "Managed onboarding is niet actief");
      const slug = decodeURIComponent(url.pathname.slice("/api/v1/onboarding/brands/".length));
      if (!slug || slug.includes("/")) throw new HttpError(404, "Operating brand niet gevonden");
      const session = await requireSession(req);
      return json(res, 200, await controlPlaneRepository.brandOnboarding(session.id, slug));
    }

    if (url.pathname.startsWith("/api/v1/onboarding/brands/")
      && url.pathname.endsWith("/connector-requests") && req.method === "POST") {
      if (!controlPlaneRepository) throw new HttpError(404, "Managed onboarding is niet actief");
      const slug = decodeURIComponent(url.pathname.slice(
        "/api/v1/onboarding/brands/".length,
        -"/connector-requests".length
      ));
      if (!slug || slug.includes("/")) throw new HttpError(404, "Operating brand niet gevonden");
      const session = await requireSession(req);
      requireInternal(session);
      requireManagedMfa(session);
      requireCompany(session, slug);
      const body = await parseBody(req);
      const result = await controlPlaneRepository.stageConnectorRequest(
        session.id, slug, body, String(req.headers["idempotency-key"] || "")
      );
      return json(res, result.replayed ? 200 : 201, result);
    }

    if (url.pathname.startsWith("/api/v1/onboarding/brands/")
      && url.pathname.endsWith("/decision") && url.pathname.includes("/connector-requests/")
      && req.method === "POST") {
      if (!controlPlaneRepository) throw new HttpError(404, "Managed onboarding is niet actief");
      const decisionPath = url.pathname.slice(
        "/api/v1/onboarding/brands/".length,
        -"/decision".length
      );
      const decisionParts = decisionPath.split("/connector-requests/");
      if (decisionParts.length !== 2) throw new HttpError(404, "Connectorverzoek niet gevonden");
      const slug = decodeURIComponent(decisionParts[0]);
      const requestId = decodeURIComponent(decisionParts[1]);
      if (!slug || slug.includes("/") || !requestId || requestId.includes("/")) {
        throw new HttpError(404, "Connectorverzoek niet gevonden");
      }
      const session = await requireSession(req);
      requireInternal(session);
      requireManagedMfa(session);
      requireCompany(session, slug);
      const body = await parseBody(req);
      return json(res, 200, await controlPlaneRepository.decideConnectorRequest(
        session.id, slug, requestId, String(body.decision || ""),
        Number(body.contextVersion), String(req.headers["idempotency-key"] || "")
      ));
    }

    if (url.pathname.startsWith("/api/v1/health/brands/") && req.method === "GET") {
      const slug = decodeURIComponent(url.pathname.slice("/api/v1/health/brands/".length));
      if (!slug || slug.includes("/")) throw new HttpError(404, "Operating brand niet gevonden");
      const session = await requireSession(req);
      requireCompany(session, slug);
      return json(res, 200, await fetchProductHealth(slug));
    }

    if (url.pathname === "/api/v1/health/portfolio" && req.method === "GET") {
      const session = await requireSession(req);
      const scopedPortfolio = osStore.portfolio(session);
      return json(res, 200, await fetchPortfolioHealth(scopedPortfolio.brands.map((brand) => brand.slug)));
    }

    if (url.pathname === "/api/v1/incidents" && req.method === "GET") {
      if (!controlPlaneRepository) throw new HttpError(404, "Managed incidentbeheer is niet actief");
      const session = await requireSession(req);
      requireInternal(session);
      return json(res, 200, await controlPlaneRepository.incidents(session.id, session.organizationId));
    }

    if (url.pathname === "/api/v1/access/roster" && req.method === "GET") {
      if (!controlPlaneRepository) throw new HttpError(404, "Managed toegangsbeheer is niet actief");
      const session = await requireSession(req);
      requireInternal(session);
      return json(res, 200, await controlPlaneRepository.accessRoster(session.id, session.organizationId));
    }

    if (url.pathname === "/api/v1/access/requests" && req.method === "POST") {
      if (!controlPlaneRepository) throw new HttpError(404, "Managed toegangsbeheer is niet actief");
      const session = await requireSession(req);
      requireInternal(session);
      requireManagedMfa(session);
      const body = await parseBody(req);
      const idempotencyKey = String(req.headers["idempotency-key"] || "");
      const result = await controlPlaneRepository.stageAccessRequest(
        session.id,
        session.organizationId,
        body,
        idempotencyKey
      );
      return json(res, result.replayed ? 200 : 201, result);
    }

    if (url.pathname.startsWith("/api/v1/access/requests/") && url.pathname.endsWith("/decision") && req.method === "POST") {
      if (!controlPlaneRepository) throw new HttpError(404, "Managed toegangsbeheer is niet actief");
      const requestId = decodeURIComponent(url.pathname.slice("/api/v1/access/requests/".length, -"/decision".length));
      if (!requestId || requestId.includes("/")) throw new HttpError(404, "Toegangsverzoek niet gevonden");
      const session = await requireSession(req);
      requireInternal(session);
      requireManagedMfa(session);
      const body = await parseBody(req);
      return json(res, 200, await controlPlaneRepository.decideAccessRequest(
        session.id, session.organizationId, requestId, String(body.decision || ""),
        Number(body.contextVersion), String(req.headers["idempotency-key"] || "")
      ));
    }

    if (url.pathname.startsWith("/api/v1/incidents/brands/") && req.method === "GET") {
      if (!controlPlaneRepository) throw new HttpError(404, "Managed incidentbeheer is niet actief");
      const slug = decodeURIComponent(url.pathname.slice("/api/v1/incidents/brands/".length));
      if (!slug || slug.includes("/")) throw new HttpError(404, "Operating brand niet gevonden");
      const session = await requireSession(req);
      requireInternal(session);
      requireCompany(session, slug);
      return json(res, 200, await controlPlaneRepository.incidents(session.id, session.organizationId, slug));
    }

    if (url.pathname.startsWith("/api/v1/monitoring/probe/brands/") && req.method === "POST") {
      if (!controlPlaneRepository) throw new HttpError(404, "Managed monitoring is niet actief");
      const slug = decodeURIComponent(url.pathname.slice("/api/v1/monitoring/probe/brands/".length));
      if (!slug || slug.includes("/")) throw new HttpError(404, "Operating brand niet gevonden");
      const session = await requireSession(req);
      requireInternal(session);
      requireManagedMfa(session);
      requireCompany(session, slug);
      await parseBody(req);
      const idempotencyKey = String(req.headers["idempotency-key"] || "");
      const health = await fetchProductHealth(slug);
      const evidence = await controlPlaneRepository.recordProductHealth(session.id, health, idempotencyKey);
      const incidents = await controlPlaneRepository.incidents(session.id, session.organizationId, slug);
      return json(res, evidence.replayed ? 200 : 201, { health, evidence, incidents });
    }

    if (url.pathname.startsWith("/api/v1/incidents/") && url.pathname.endsWith("/acknowledge") && req.method === "POST") {
      if (!controlPlaneRepository) throw new HttpError(404, "Managed incidentbeheer is niet actief");
      const incidentId = decodeURIComponent(url.pathname.slice("/api/v1/incidents/".length, -"/acknowledge".length));
      if (!incidentId || incidentId.includes("/")) throw new HttpError(404, "Incident niet gevonden");
      const session = await requireSession(req);
      requireInternal(session);
      requireManagedMfa(session);
      const body = await parseBody(req);
      const idempotencyKey = String(req.headers["idempotency-key"] || "");
      const result = await controlPlaneRepository.acknowledgeIncident(
        session.id,
        incidentId,
        Number(body.contextVersion),
        idempotencyKey
      );
      return json(res, 200, result);
    }

    if (url.pathname.startsWith("/api/v1/os/brands/") && req.method === "GET") {
      const slug = decodeURIComponent(url.pathname.slice("/api/v1/os/brands/".length));
      if (!slug || slug.includes("/")) throw new HttpError(404, "Operating brand niet gevonden");
      const session = await requireSession(req);
      const operations = slug === "autoreviews" ? await fetchAutoreviewsSnapshot() : null;
      if (controlPlaneRepository) {
        const twin = await controlPlaneRepository.brandTwin(session.id, slug);
        return json(res, 200, { ...twin, operations });
      }
      return json(res, 200, osStore.brandTwin(session, slug, operations));
    }

    if (url.pathname === "/api/v1/demo" && req.method === "GET") {
      const session = await requireSession(req);
      if (controlPlaneRepository && session.role === "internal") {
        throw new HttpError(409,
          "De demo-werkruimte is niet beschikbaar voor managed interne sessies.",
          "MANAGED_DEMO_ROUTE_DISABLED");
      }
      const company = requireCompany(session, url.searchParams.get("company"));
      if (company.id !== "autopilots") return json(res, 200, emptyCompanySnapshot(session, company));
      return json(res, 200, { ...store.snapshotFor(session), company, controlPlaneMode: controlPlaneRepository ? "managed" : "demo" });
    }

    if (url.pathname === "/api/v1/demo/command" && req.method === "POST") {
      const session = await requireSession(req);
      requireManagedMfa(session);
      const company = requireCompany(session, url.searchParams.get("company"));
      if (controlPlaneRepository) {
        throw new HttpError(409,
          "Deze demoactie is niet beschikbaar in het managed control plane; gebruik de specifieke duurzame beheerroute.",
          "MANAGED_COMMAND_ROUTE_REQUIRED");
      }
      if (company.id !== "autopilots") throw new HttpError(409, "Deze bedrijfsomgeving heeft nog geen actieve workflow");
      const body = await parseBody(req);
      const idempotencyKey = String(req.headers["idempotency-key"] || "");
      return json(res, 200, store.command(idempotencyKey, body.action, body.payload, session));
    }

    if (url.pathname.startsWith("/api/")) throw new HttpError(405, "Methode of API-route niet toegestaan");
    if (assets.has(url.pathname)) return await serveFile(res, path.resolve(root, url.pathname.slice(1)));

    const isApp = url.pathname === "/login" || url.pathname === "/auth/callback" || customerRoutes.has(url.pathname) || internalRoutes.has(url.pathname);
    if (!isApp) throw new HttpError(404, "Pagina niet gevonden");
    if (url.pathname !== "/login" && url.pathname !== "/auth/callback") {
      const session = await sessionFromRequest(req);
      if (!session) return redirect(res, "/login");
      if (session.role === "internal" && customerRoutes.has(url.pathname)) {
        return redirect(res, "/control-center");
      }
      if (!routeAllowed(session.role, url.pathname)) throw new HttpError(403, "Geen toegang tot deze omgeving");
    }
    return await serveFile(res, path.resolve(root, "workspace.html"));
  } catch (error) {
    const status = error instanceof HttpError ? error.status : Number(error?.status) || (error?.code === "ENOENT" ? 404 : 400);
    return json(res, status, {
      error: status === 404 ? "Pagina niet gevonden" : error.message,
      code: error?.code || undefined,
      demoMode: runtimeConfig.mode === "demo"
    });
  }
});

async function login(req, res) {
  const key = requestIp(req);
  const attempts = loginAttempts.get(key) || [];
  const recent = attempts.filter((timestamp) => Date.now() - timestamp < loginWindowMs);
  if (recent.length >= loginLimit) throw new HttpError(429, "Te veel inlogpogingen. Probeer later opnieuw.");

  const body = await parseBody(req);
  if (runtimeConfig.authProvider === "supabase") {
    const email = String(body.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      recent.push(Date.now());
      loginAttempts.set(key, recent);
      throw new HttpError(400, "Vul een geldig e-mailadres in.");
    }
    await authGateway.sendMagicLink(email, runtimeConfig.authRedirectUrl);
    loginAttempts.delete(key);
    return json(res, 202, { pending: true, message: "Als dit account toegang heeft, ontvangt het een beveiligde inloglink." });
  }
  const user = demoUsers.find((candidate) =>
    candidate.role === body.role &&
    safeEqual(candidate.email.toLowerCase(), String(body.email || "").trim().toLowerCase()) &&
    safeEqual(candidate.code, String(body.code || ""))
  );
  if (!user) {
    recent.push(Date.now());
    loginAttempts.set(key, recent);
    throw new HttpError(401, "De demo-inloggegevens zijn niet correct.");
  }

  loginAttempts.delete(key);
  return await establishSession(res, user, sessionTtlMs);
}

async function exchangeManagedSession(req, res) {
  if (!authGateway) throw new HttpError(404, "Managed identity is niet actief.");
  const body = await parseBody(req);
  const user = await authGateway.verifyAndLoadContext(String(body.accessToken || ""));
  if (user.mfaRequired && user.assuranceLevel !== "aal2") {
    return json(res, 409, { mfaRequired: true, code: "MFA_REQUIRED", message: "Rond tweestapsverificatie af om verder te gaan." });
  }
  return await establishSession(res, user, managedSessionTtlMs);
}

async function prepareManagedMfa(req, res) {
  if (!authGateway) throw new HttpError(404, "Managed identity is niet actief.");
  const body = await parseBody(req);
  const result = await authGateway.prepareMfa(String(body.accessToken || ""), String(body.refreshToken || ""));
  if (result.mode === "complete") return await establishSession(res, result.context, managedSessionTtlMs);
  return json(res, 200, result);
}

async function verifyManagedMfa(req, res) {
  if (!authGateway) throw new HttpError(404, "Managed identity is niet actief.");
  const key = `mfa:${requestIp(req)}`;
  const attempts = (loginAttempts.get(key) || []).filter((timestamp) => Date.now() - timestamp < loginWindowMs);
  if (attempts.length >= loginLimit) throw new HttpError(429, "Te veel MFA-pogingen. Vraag later een nieuwe inloglink aan.");
  const body = await parseBody(req);
  try {
    const user = await authGateway.verifyMfa(
      String(body.accessToken || ""),
      String(body.refreshToken || ""),
      String(body.factorId || ""),
      String(body.code || "")
    );
    loginAttempts.delete(key);
    return await establishSession(res, user, managedSessionTtlMs);
  } catch (error) {
    attempts.push(Date.now());
    loginAttempts.set(key, attempts);
    throw error;
  }
}

async function establishSession(res, user, ttlMs) {
  const token = crypto.randomBytes(32).toString("hex");
  const digest = sessionDigest(token);
  const expiresAt = Date.now() + ttlMs;
  if (managedSessionStore) await managedSessionStore.create(digest, user, expiresAt);
  else sessions.set(digest, { ...publicUser(user), expiresAt });
  return json(res, 200, { user: publicUser(user) }, {
    "Set-Cookie": `${sessionCookieName}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.floor(ttlMs / 1000)}${runtimeConfig.isProduction ? "; Secure" : ""}`
  });
}

async function logout(req, res) {
  const token = cookieValue(req, sessionCookieName);
  if (token) {
    const digest = sessionDigest(token);
    if (managedSessionStore) await managedSessionStore.revoke(digest, "user_logout");
    else sessions.delete(digest);
  }
  return json(res, 200, { ok: true }, { "Set-Cookie": `${sessionCookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${runtimeConfig.isProduction ? "; Secure" : ""}` });
}

async function sessionFromRequest(req) {
  const token = cookieValue(req, sessionCookieName);
  const digest = token ? sessionDigest(token) : "";
  if (managedSessionStore) return digest ? await managedSessionStore.resolve(digest) : null;
  const session = digest ? sessions.get(digest) : null;
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(digest);
    return null;
  }
  return session;
}

async function requireSession(req) {
  const session = await sessionFromRequest(req);
  if (!session) throw new HttpError(401, "Niet ingelogd");
  return session;
}

function publicUser(user) {
  const companyIds = user.companyIds || user.companies?.map((company) => company.id) || ["autopilots"];
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    name: user.name,
    companyIds,
    companies: companyCatalog.filter((company) => companyIds.includes(company.id)),
    iamRole: user.iamRole || null,
    assuranceLevel: user.assuranceLevel || (runtimeConfig.authProvider === "demo" ? "demo" : "aal1"),
    mfaRequired: user.mfaRequired === true,
    mfaSatisfied: user.mfaRequired !== true || user.assuranceLevel === "aal2",
    authProvider: user.authProvider || runtimeConfig.authProvider
  };
}

function requireManagedMfa(session) {
  if (session.authProvider === "supabase" && session.mfaRequired && session.assuranceLevel !== "aal2") {
    throw new HttpError(428, "Activeer en bevestig eerst tweestapsverificatie voor acties.");
  }
}

function requireInternal(session) {
  if (session.role !== "internal") throw new HttpError(403, "Alleen interne gebruikers hebben toegang");
}

function requireCompany(session, requestedId) {
  const companyId = String(requestedId || "autopilots");
  const company = companyCatalog.find((candidate) => candidate.id === companyId);
  if (!company || !session.companyIds?.includes(companyId)) throw new HttpError(403, "Geen toegang tot deze bedrijfsomgeving");
  return company;
}

function emptyCompanySnapshot(session, company) {
  return {
    empty: true,
    demoMode: true,
    company,
    controlPlaneMode: controlPlaneRepository ? "managed" : "demo",
    viewer: publicUser(session),
    metrics: { customers: 0, implementations: 0, humanAttention: 0, totalCostCents: 0 },
    source: "isolated_empty_workspace"
  };
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function sessionDigest(token) {
  if (managedSessionStore) return crypto.createHash("sha256").update(token).digest("hex");
  return crypto.createHmac("sha256", runtimeConfig.sessionSecret || "isolated-demo-session").update(token).digest("hex");
}

function cookieValue(req, name) {
  const match = String(req.headers.cookie || "").split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : "";
}

function requestIp(req) {
  return String(req.socket.remoteAddress || "local");
}

async function parseBody(req) {
  if (!String(req.headers["content-type"] || "").startsWith("application/json")) throw new HttpError(415, "Alleen application/json toegestaan");
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 100000) throw new HttpError(413, "Request te groot");
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks);
  try {
    return raw.length ? JSON.parse(raw.toString("utf8")) : {};
  } catch {
    throw new HttpError(400, "Ongeldige JSON");
  }
}

async function serveFile(res, target) {
  if (target !== root && !target.startsWith(root + path.sep)) throw new HttpError(404, "Pagina niet gevonden");
  const content = await fs.readFile(target);
  const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml" };
  res.writeHead(200, headers(types[path.extname(target)] || "application/octet-stream"));
  res.end(content);
}

function redirect(res, location) {
  res.writeHead(302, headers("text/plain; charset=utf-8", { Location: location }));
  res.end("Redirecting");
}

function headers(type, extra = {}) {
  return {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Content-Security-Policy": "default-src 'self';base-uri 'none';form-action 'self';frame-ancestors 'none';object-src 'none';style-src 'self' https://fonts.googleapis.com;font-src https://fonts.gstatic.com;script-src 'self';connect-src 'self';img-src 'self' data:",
    ...extra
  };
}

function json(res, status, data, extra = {}) {
  res.writeHead(status, headers("application/json; charset=utf-8", extra));
  res.end(JSON.stringify(data));
}

server.listen(port, host, () => {
  monitoringScheduler.start();
  console.log(`Autopilots Platform draait op http://${host}:${port}`);
});
server.on("close", () => monitoringScheduler.stop());

export const __test = { publicUser, safeEqual };
