import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "chromium-mobile",
      use: { ...devices["iPhone 13"], browserName: "chromium" },
    },
  ],
  webServer: {
    command:
      "ASTRO_TELEMETRY_DISABLED=1 pnpm run build && ASTRO_TELEMETRY_DISABLED=1 pnpm exec astro preview --host 127.0.0.1 --port 4321",
    url: "http://127.0.0.1:4321/nl/",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
