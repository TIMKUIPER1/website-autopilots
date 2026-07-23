import crypto from "node:crypto";
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DemoStore } from "./demo-store.js";
import { fetchAutoreviewsSnapshot } from "./adapters/autoreviews.js";
import { OperatingSystemStore, osCatalog } from "./os-store.js";
import { routeAllowed } from "./policy.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");
const store = new DemoStore();
const osStore = new OperatingSystemStore();
const sessions = new Map();
const loginAttempts = new Map();
const port = Number(process.env.PORT || 4310);
const host = process.env.HOST || "127.0.0.1";
const sessionTtlMs = 8 * 60 * 60 * 1000;
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
    companyIds: ["autopilots", "autoreviews", "autoplanner", "autowebsites", "autosupport"]
  }
];

const customerRoutes = new Set([
  "/", "/demo", "/requirements", "/voorstel", "/documenten", "/afrekenen",
  "/betaling-geslaagd", "/onboarding", "/secure-data-room", "/integraties", "/testen", "/activiteit"
]);
const internalRoutes = new Set([
  "/control-center", "/control-center/portfolio", "/control-center/tasks", "/control-center/agents", "/control-center/approvals",
  "/control-center/implementaties/impl_001"
]);
const assets = new Set(["/workspace.html", "/workspace.js", "/workspace.css", "/app.css", "/ap-logo.svg"]);

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (url.pathname === "/health" && req.method === "GET") {
      return json(res, 200, { ok: true, service: "autopilots-platform", demoMode: true, auth: "server_session" });
    }

    if (url.pathname === "/api/v1/session/login" && req.method === "POST") return login(req, res);
    if (url.pathname === "/api/v1/session/logout" && req.method === "POST") return logout(req, res);
    if (url.pathname === "/api/v1/session" && req.method === "GET") {
      const session = requireSession(req);
      return json(res, 200, { user: publicUser(session) });
    }

    if (url.pathname === "/api/v1/os/portfolio" && req.method === "GET") {
      return json(res, 200, osStore.portfolio(requireSession(req)));
    }

    if (url.pathname.startsWith("/api/v1/os/brands/") && req.method === "GET") {
      const slug = decodeURIComponent(url.pathname.slice("/api/v1/os/brands/".length));
      if (!slug || slug.includes("/")) throw new HttpError(404, "Operating brand niet gevonden");
      const operations = slug === "autoreviews" ? await fetchAutoreviewsSnapshot() : null;
      return json(res, 200, osStore.brandTwin(requireSession(req), slug, operations));
    }

    if (url.pathname === "/api/v1/demo" && req.method === "GET") {
      const session = requireSession(req);
      const company = requireCompany(session, url.searchParams.get("company"));
      if (company.id !== "autopilots") return json(res, 200, emptyCompanySnapshot(session, company));
      return json(res, 200, { ...store.snapshotFor(session), company });
    }

    if (url.pathname === "/api/v1/demo/command" && req.method === "POST") {
      const session = requireSession(req);
      const company = requireCompany(session, url.searchParams.get("company"));
      if (company.id !== "autopilots") throw new HttpError(409, "Deze bedrijfsomgeving heeft nog geen actieve workflow");
      const body = await parseBody(req);
      const idempotencyKey = String(req.headers["idempotency-key"] || "");
      return json(res, 200, store.command(idempotencyKey, body.action, body.payload, session));
    }

    if (url.pathname.startsWith("/api/")) throw new HttpError(405, "Methode of API-route niet toegestaan");
    if (assets.has(url.pathname)) return serveFile(res, path.resolve(root, url.pathname.slice(1)));

    const isApp = url.pathname === "/login" || customerRoutes.has(url.pathname) || internalRoutes.has(url.pathname);
    if (!isApp) throw new HttpError(404, "Pagina niet gevonden");
    if (url.pathname !== "/login") {
      const session = sessionFromRequest(req);
      if (!session) return redirect(res, "/login");
      if (session.role === "internal" && customerRoutes.has(url.pathname)) {
        return redirect(res, "/control-center");
      }
      if (!routeAllowed(session.role, url.pathname)) throw new HttpError(403, "Geen toegang tot deze omgeving");
    }
    return serveFile(res, path.resolve(root, "workspace.html"));
  } catch (error) {
    const status = error instanceof HttpError ? error.status : Number(error?.status) || (error?.code === "ENOENT" ? 404 : 400);
    return json(res, status, { error: status === 404 ? "Pagina niet gevonden" : error.message, demoMode: true });
  }
});

async function login(req, res) {
  const key = requestIp(req);
  const attempts = loginAttempts.get(key) || [];
  const recent = attempts.filter((timestamp) => Date.now() - timestamp < loginWindowMs);
  if (recent.length >= loginLimit) throw new HttpError(429, "Te veel inlogpogingen. Probeer later opnieuw.");

  const body = await parseBody(req);
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
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { ...publicUser(user), expiresAt: Date.now() + sessionTtlMs });
  return json(res, 200, { user: publicUser(user) }, {
    "Set-Cookie": `ap_demo_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.floor(sessionTtlMs / 1000)}`
  });
}

function logout(req, res) {
  const token = cookieValue(req, "ap_demo_session");
  if (token) sessions.delete(token);
  return json(res, 200, { ok: true }, { "Set-Cookie": "ap_demo_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0" });
}

function sessionFromRequest(req) {
  const token = cookieValue(req, "ap_demo_session");
  const session = token ? sessions.get(token) : null;
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session;
}

function requireSession(req) {
  const session = sessionFromRequest(req);
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
    companies: companyCatalog.filter((company) => companyIds.includes(company.id))
  };
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

server.listen(port, host, () => console.log(`Autopilots Platform draait op http://${host}:${port}`));

export const __test = { publicUser, safeEqual };
