import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const mode = process.argv[2];
const root = process.cwd();

if (!["source", "dist"].includes(mode)) {
  throw new Error(
    "Gebruik: node scripts/check-ad-funnel-release.mjs source|dist",
  );
}

const files =
  mode === "source"
    ? [
        "src/components/campaign/CampaignLeadForm.astro",
        "src/i18n/campaign.ts",
        "src/layouts/CampaignLayout.astro",
        "src/pages/lp/autobedrijven/ai-medewerker/index.astro",
        "src/pages/lp/autobedrijven/ai-medewerker/ervaring/index.astro",
      ]
    : [
        "dist/lp/autobedrijven/ai-medewerker/index.html",
        "dist/lp/autobedrijven/ai-medewerker/ervaring/index.html",
      ];

const contents = await Promise.all(
  files.map(async (file) => {
    try {
      return await readFile(resolve(root, file), "utf8");
    } catch {
      throw new Error(`Advertentiefunnel geblokkeerd: ${file} ontbreekt.`);
    }
  }),
);

const combined = contents.join("\n");
const requiredMarkers = [
  "SLIMME AI-SCAN VOOR AUTOBEDRIJVEN",
  "Ontdek hoeveel klantcontact een AI-medewerker",
  "direct kan overnemen.",
  "Beantwoord vijf korte vragen.",
  "jouw persoonlijke impactberekening",
  "Stuur mij de AI-test, mijn berekening en praktische opvolging over AI voor autobedrijven.",
  "1715813002902335",
  "ap_funnel_session_id",
  "/api/funnel-event",
];
const forbiddenMarkers = [
  "Open mijn persoonlijke test",
  "PERSOONLIJKE TOEGANG",
  "Ontvang direct de praktijktest en berekening",
];

for (const marker of requiredMarkers) {
  if (!combined.includes(marker)) {
    throw new Error(
      `Advertentiefunnel geblokkeerd: verplichte release-marker ontbreekt: “${marker}”.`,
    );
  }
}

for (const marker of forbiddenMarkers) {
  if (combined.includes(marker)) {
    throw new Error(
      `Advertentiefunnel geblokkeerd: verouderde tekst gevonden: “${marker}”.`,
    );
  }
}

console.log(`Advertentiefunnel ${mode} gecontroleerd: release toegestaan.`);
