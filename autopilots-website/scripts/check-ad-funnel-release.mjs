import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

const mode = process.argv[2];
const root = process.cwd();
const contract = JSON.parse(
  await readFile(resolve(root, "config/autodealer-funnel-lock.json"), "utf8"),
);

if (!["source", "dist"].includes(mode)) {
  throw new Error(
    "Gebruik: node scripts/check-ad-funnel-release.mjs source|dist",
  );
}

if (process.env.CONTEXT === "production") {
  const externalReleaseId = String(
    process.env.AUTOPILOTS_FUNNEL_RELEASE_ID ?? "",
  ).trim();
  if (externalReleaseId !== contract.releaseId) {
    throw new Error(
      `Advertentiefunnel geblokkeerd: Netlify verwacht release “${externalReleaseId || "niet ingesteld"}”, maar de bron bevat “${contract.releaseId}”.`,
    );
  }
}

if (mode === "source") {
  for (const [repositoryPath, expectedHash] of Object.entries(
    contract.sha256,
  )) {
    const projectPrefix = "autopilots-website/";
    if (!repositoryPath.startsWith(projectPrefix)) {
      throw new Error(
        `Advertentiefunnel geblokkeerd: ongeldig contractpad ${repositoryPath}.`,
      );
    }
    const projectPath = repositoryPath.slice(projectPrefix.length);
    let content;
    try {
      content = await readFile(resolve(root, projectPath));
    } catch {
      throw new Error(
        `Advertentiefunnel geblokkeerd: vergrendeld bestand ontbreekt: ${projectPath}.`,
      );
    }
    const actualHash = createHash("sha256").update(content).digest("hex");
    if (actualHash !== expectedHash) {
      throw new Error(
        `Advertentiefunnel geblokkeerd: ${projectPath} wijkt af van contract ${contract.releaseId}.`,
      );
    }
  }
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
  ...contract.requiredMarkers,
  "ap_funnel_session_id",
  "/api/funnel-event",
];
const forbiddenMarkers = contract.forbiddenMarkers;

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
