import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const baseURL = process.env.BASE_URL || "http://127.0.0.1:4321";
const routes = [
  ["homepage", "/nl/"],
  ["producten", "/nl/producten/"],
  ["voor-wie", "/nl/voor-wie/"],
  ["branche-installatie", "/nl/voor-wie/installatietechniek/"],
  ["product-inbox", "/nl/producten/ai-inboxmedewerker/"],
  ["proces", "/nl/proces/"],
  ["crew", "/nl/crew/"],
  ["kennisbank", "/nl/kennisbank/"],
  ["artikel", "/nl/kennisbank/wat-is-een-ai-medewerker/"],
  ["afspraak", "/nl/afspraak/"],
  ["bestellen", "/nl/bestel-direct/"],
];
const viewports = [
  ["desktop", { width: 1440, height: 1000 }],
  ["mobile", { width: 390, height: 844 }],
];
const output = "docs/ux/screenshots/after";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
for (const [viewportName, viewport] of viewports) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.addInitScript(() =>
    localStorage.setItem(
      "autopilots_consent_v1",
      JSON.stringify({ analytics: false }),
    ),
  );
  for (const [name, route] of routes) {
    await page.goto(`${baseURL}${route}`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: `${output}/${name}-${viewportName}.png`,
      fullPage: true,
    });
  }
  await context.close();
}
await browser.close();
