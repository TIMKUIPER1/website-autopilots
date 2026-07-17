import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  "/nl/",
  "/nl/producten/",
  "/nl/voor-wie/autobedrijven/",
  "/nl/proces/",
  "/nl/kennisbank/",
  "/nl/afspraak/",
  "/nl/bestel-direct/",
];
for (const route of routes)
  test(`${route} rendert zonder overflow`, async ({ page }) => {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main h1").first()).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

test("homepage naar afspraak en bestelling", async ({ page }) => {
  await page.goto("/nl/");
  await page.locator('a[href^="/nl/afspraak/"]:visible').first().click();
  await expect(page).toHaveURL(/\/nl\/afspraak\//);
  await expect(page.locator("[data-ghl-embed]")).toBeVisible();
  await page.goto("/nl/bestel-direct/?product=ai-telefoniste");
  await expect(page.locator("[data-order-product]")).toContainText(
    "AI Telefoniste",
  );
  await expect(page.locator("[data-order-niche]")).toHaveCount(21);
});

test("kernpagina voldoet geautomatiseerd aan WCAG", async ({ page }) => {
  await page.goto("/nl/");
  await page.evaluate(() =>
    localStorage.setItem(
      "autopilots_consent_v1",
      JSON.stringify({ analytics: false }),
    ),
  );
  await page.reload();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("alle branchepagina's blijven leesbaar op mobiel", async ({ page }) => {
  const niches = [
    "autobedrijven",
    "dakdekkers",
    "hoveniers",
    "installatietechniek",
    "vastgoedbeheerders",
    "kapperszaken",
    "tandartsen",
    "makelaars",
    "cosmetische-klinieken",
    "verzekeraars",
    "glaszetters",
    "hotels",
    "restaurants",
    "evenementen",
    "kozijnen",
    "zonnepanelen",
    "vloerenleggers",
    "woningcorporaties",
    "non-profit",
    "dierenarts",
    "dierenverzorging",
  ];
  await page.setViewportSize({ width: 390, height: 844 });
  for (const niche of niches) {
    await page.goto(`/nl/voor-wie/${niche}/`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("main h1").first()).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
      niche,
    ).toBeLessThanOrEqual(1);
  }
});
