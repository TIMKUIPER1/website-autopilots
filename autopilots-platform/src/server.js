import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PlatformStore } from "./domain/store.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const port = Number(process.env.PORT || 4310);
const host = process.env.HOST || "127.0.0.1";
const store = new PlatformStore(true);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (url.pathname === "/health") return json(res, 200, { ok: true, service: "autopilots-platform", mode: "demo", at: new Date().toISOString() });
    if (url.pathname === "/api/v1/portal" && req.method === "GET") return json(res, 200, store.snapshot(tenant(req)));
    if (url.pathname === "/api/v1/admin/overview" && req.method === "GET") {
      const organizations = store.listOrganizations();
      return json(res, 200, { organizations, implementations: organizations.flatMap((org) => store.listImplementations(org.id)), humanTasks: organizations.flatMap((org) => store.listTasks(org.id)) });
    }
    if (url.pathname.match(/^\/api\/v1\/implementations\/[^/]+\/transition$/) && req.method === "POST") {
      const implementationId = url.pathname.split("/")[4];
      const body = await bodyJson(req);
      return json(res, 200, store.transition({ organizationId: tenant(req), implementationId, to: body.to, reason: body.reason, actor: "demo-user", idempotencyKey: req.headers["idempotency-key"] }));
    }
    return serveStatic(url.pathname, res);
  } catch (error) {
    return json(res, error.message.includes("niet gevonden") ? 404 : 400, { error: error.message, correlationId: crypto.randomUUID() });
  }
});

function tenant(req) { return String(req.headers["x-autopilots-tenant"] || "org_curacao_auto"); }

async function bodyJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  if (Buffer.concat(chunks).length > 100_000) throw new Error("Request is te groot.");
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function serveStatic(pathname, res) {
  const route = pathname === "/" ? "/portal.html" : pathname === "/control-center" ? "/control-center.html" : pathname;
  const file = path.normalize(path.join(publicDir, route));
  if (!file.startsWith(publicDir)) return json(res, 404, { error: "Niet gevonden." });
  try {
    const content = await fs.readFile(file);
    const ext = path.extname(file);
    const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml" };
    res.writeHead(200, securityHeaders(types[ext] || "application/octet-stream"));
    res.end(content);
  } catch { return json(res, 404, { error: "Niet gevonden." }); }
}

function securityHeaders(contentType) {
  return { "Content-Type": contentType, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Referrer-Policy": "no-referrer", "Content-Security-Policy": "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; img-src 'self' data:" };
}

function json(res, status, payload) {
  res.writeHead(status, securityHeaders("application/json; charset=utf-8"));
  res.end(JSON.stringify(payload));
}

server.listen(port, host, () => console.log(`Autopilots Platform draait op http://${host}:${port}`));
