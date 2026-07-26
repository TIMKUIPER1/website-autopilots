const url = "https://auto-pilots.io/lp/autobedrijven/ai-medewerker/";
const requiredMarkers = [
  "SLIMME AI-SCAN VOOR AUTOBEDRIJVEN",
  "Ontdek hoeveel klantcontact een AI-medewerker",
  "direct kan overnemen.",
  "jouw persoonlijke impactberekening",
  "Stuur mij de AI-test, mijn berekening en praktische opvolging over AI voor autobedrijven.",
  "1715813002902335",
];

let lastError;

for (let attempt = 1; attempt <= 6; attempt += 1) {
  try {
    const response = await fetch(`${url}?release_check=${Date.now()}`, {
      headers: { "cache-control": "no-cache" },
      redirect: "follow",
    });
    const body = await response.text();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const missing = requiredMarkers.filter((marker) => !body.includes(marker));
    if (missing.length > 0) {
      throw new Error(`release-markers ontbreken: ${missing.join(", ")}`);
    }

    console.log(`Live advertentiefunnel gecontroleerd: ${url}`);
    process.exit(0);
  } catch (error) {
    lastError = error;
    if (attempt < 6) {
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
  }
}

throw new Error(
  `Productiecontrole mislukt voor ${url}: ${lastError?.message ?? "onbekende fout"}`,
);
