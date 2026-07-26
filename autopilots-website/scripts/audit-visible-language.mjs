import fs from "node:fs";
import path from "node:path";

const locale = process.argv[2] ?? "fr";
const root = path.resolve("dist", locale);
const dutchPattern =
  /\b(?:afspraak|afspraken|klant|klanten|klantcontact|kwalificeert|behoefte|opvolging|gepland|binnen|blijft|liggen|bekijk|bestel|wordt|worden|krijgt|krijgen|heeft|hebben|jullie|jouw|onze|samenwerken|dagelijkse|praktijk|medewerker|medewerkers|menselijke|overdracht|kennisbank|hoofdinoud|noodzakelijke|toestaan|alleen|aanlevering|inrichten|inrichting|vervolgactie|vragen|vraag|antwoord|proces|producten|branches|bedrijven)\b/giu;

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory()
      ? filesIn(target)
      : entry.name === "index.html"
        ? [target]
        : [];
  });
}

function visibleText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

const findings = [];
for (const file of filesIn(root)) {
  const text = visibleText(fs.readFileSync(file, "utf8")).replace(
    /\bNederlands\b/g,
    "",
  );
  const matches = [...text.matchAll(dutchPattern)];
  if (!matches.length) continue;
  const snippets = [
    ...new Set(
      matches.map((match) => {
        const start = Math.max(0, (match.index ?? 0) - 45);
        return text.slice(start, start + 130).trim();
      }),
    ),
  ];
  findings.push({
    route: `/${path.relative(path.resolve("dist"), file).replace(/index\.html$/, "")}`,
    snippets,
  });
}

if (findings.length) {
  console.error(JSON.stringify(findings, null, 2));
  process.exitCode = 1;
} else {
  console.log(
    `OK: ${filesIn(root).length} ${locale.toUpperCase()}-pagina's zonder herkenbare Nederlandse zichtbare tekst.`,
  );
}
