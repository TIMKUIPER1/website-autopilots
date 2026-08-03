import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const customerRoutes = [
  "/", "/demo", "/requirements", "/voorstel", "/documenten", "/afrekenen",
  "/betaling-geslaagd", "/onboarding", "/secure-data-room", "/integraties", "/testen", "/activiteit"
];
const internalRoutes = [
  "/control-center", "/control-center/portfolio", "/control-center/implementaties/impl_001", "/control-center/tasks",
  "/control-center/approvals", "/control-center/agents", "/control-center/access", "/control-center/security"
];

async function login(base, role) {
  const credentials = role === "internal"
    ? { role, email: "operator@autopilots.example", code: "autopilots-internal" }
    : { role, email: "demo@curacao-auto.example", code: "autopilots-demo" };
  const response = await fetch(`${base}/api/v1/session/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });
  assert.equal(response.status, 200);
  return response.headers.get("set-cookie").split(";")[0];
}

test("server dwingt sessies, rollen en securityheaders af", async () => {
  const port = 4600 + Math.floor(Math.random() * 300);
  const child = spawn(process.execPath, ["src/server.js"], {
    cwd: new URL("..", import.meta.url),
    env: { ...process.env, PORT: String(port) },
    stdio: "ignore"
  });
  const base = `http://127.0.0.1:${port}`;
  try {
    for (let attempt = 0; attempt < 50; attempt++) {
      try {
        if ((await fetch(`${base}/health`)).ok) break;
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    assert.equal((await fetch(`${base}/login`)).status, 200);
    assert.equal((await fetch(`${base}/api/v1/demo`)).status, 401);
    assert.equal((await fetch(`${base}/api/v1/session/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: "invalid" })
    })).status, 404);
    assert.equal((await fetch(`${base}/health`)).status, 200);
    const protectedPage = await fetch(`${base}/`, { redirect: "manual" });
    assert.equal(protectedPage.status, 302);
    assert.equal(protectedPage.headers.get("location"), "/login");

    const customerCookie = await login(base, "customer");
    for (const route of customerRoutes) {
      assert.equal((await fetch(base + route, { headers: { Cookie: customerCookie } })).status, 200, route);
    }
    assert.equal(
      (await fetch(`${base}/control-center`, { headers: { Cookie: customerCookie }, redirect: "manual" })).status,
      403
    );
    const customerData = await fetch(`${base}/api/v1/demo`, { headers: { Cookie: customerCookie } }).then((response) => response.json());
    assert.equal("agents" in customerData, false);
    assert.equal(
      (await fetch(`${base}/api/v1/demo?company=autoreviews`, { headers: { Cookie: customerCookie } })).status,
      403
    );

    const forbiddenCommand = await fetch(`${base}/api/v1/demo/command`, {
      method: "POST",
      headers: { Cookie: customerCookie, "Content-Type": "application/json", "Idempotency-Key": "forbidden" },
      body: JSON.stringify({ action: "agent.kill", payload: { id: "agent_1" } })
    });
    assert.equal(forbiddenCommand.status, 403);

    const internalCookie = await login(base, "internal");
    for (const route of internalRoutes) {
      assert.equal((await fetch(base + route, { headers: { Cookie: internalCookie } })).status, 200, route);
    }
    for (const route of customerRoutes) {
      const internalCustomerPage = await fetch(base + route, {
        headers: { Cookie: internalCookie },
        redirect: "manual"
      });
      assert.equal(internalCustomerPage.status, 302, route);
      assert.equal(internalCustomerPage.headers.get("location"), "/control-center", route);
    }
    const internalData = await fetch(`${base}/api/v1/demo`, { headers: { Cookie: internalCookie } }).then((response) => response.json());
    assert.equal(Array.isArray(internalData.approvals), true);
    const internalSession = await fetch(`${base}/api/v1/session`, { headers: { Cookie: internalCookie } }).then((response) => response.json());
    assert.deepEqual(internalSession.user.companies.map((company) => company.id), [
      "autopilots", "autoreviews", "autoplanner", "roofplanner"
    ]);
    const portfolio = await fetch(`${base}/api/v1/os/portfolio`, { headers: { Cookie: internalCookie } }).then((response) => response.json());
    assert.equal(portfolio.scope.type, "portfolio");
    assert.equal(portfolio.brands.length, 4);
    const autoreviewsTwin = await fetch(`${base}/api/v1/os/brands/autoreviews`, { headers: { Cookie: internalCookie } }).then((response) => response.json());
    assert.equal(autoreviewsTwin.brand.id, "brand_autoreviews");
    assert.equal(autoreviewsTwin.finance.revenueCents, null);
    assert.equal((await fetch(`${base}/api/v1/os/portfolio`, { headers: { Cookie: customerCookie } })).status, 403);
    for (const companyId of ["autoreviews", "autoplanner", "roofplanner"]) {
      const companyData = await fetch(`${base}/api/v1/demo?company=${companyId}`, {
        headers: { Cookie: internalCookie }
      }).then((response) => response.json());
      assert.equal(companyData.empty, true, companyId);
      assert.equal(companyData.company.id, companyId);
      assert.equal("organization" in companyData, false, companyId);
    }
    const autoreviewsCommand = await fetch(`${base}/api/v1/demo/command?company=autoreviews`, {
      method: "POST",
      headers: { Cookie: internalCookie, "Content-Type": "application/json", "Idempotency-Key": "company-isolation" },
      body: JSON.stringify({ action: "demo.reset", payload: {} })
    });
    assert.equal(autoreviewsCommand.status, 409);

    const logout = await fetch(`${base}/api/v1/session/logout`, {
      method: "POST",
      headers: { Cookie: internalCookie, "Content-Type": "application/json" },
      body: "{}"
    });
    assert.equal(logout.status, 200);
    assert.equal((await fetch(`${base}/api/v1/session`, { headers: { Cookie: internalCookie } })).status, 401);

    const missing = await fetch(`${base}/bestaat-niet`);
    assert.equal(missing.status, 404);
    const traversal = await fetch(`${base}/%2e%2e/package.json`);
    assert.equal(traversal.status, 404);
    const headers = await fetch(`${base}/login`);
    assert.equal(headers.headers.get("x-frame-options"), "DENY");
    assert.match(headers.headers.get("content-security-policy"), /frame-ancestors 'none'/);
  } finally {
    child.kill("SIGTERM");
  }
});
