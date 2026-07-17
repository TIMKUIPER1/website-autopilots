import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, extname, join, relative, resolve } from "node:path";

const roots = [resolve("public"), resolve("dist")].filter(existsSync);
const findings = [];
const confidentialNames = [
  "voorstel-hasan-embed.html",
  "technical-partnership-proposal",
  "internal-partnership-proposal",
];
const confidentialMarkers = [
  /technical partnership proposal/i,
  /autopilots\s*[x×]\s*hasan/i,
  /\bvertrouwelijk(?:e)?\s+(?:voorstel|document|bijlage)\b/i,
  /\bconfidential\s+(?:proposal|document|attachment)\b/i,
  /\binternal\s+only\b/i,
];
const readableExtensions = new Set([
  ".html",
  ".htm",
  ".txt",
  ".md",
  ".json",
  ".xml",
  ".js",
  ".mjs",
  ".css",
  ".svg",
]);

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(file);
      continue;
    }
    const relativePath = relative(process.cwd(), file).replaceAll("\\", "/");
    const lowerName = basename(file).toLowerCase();
    if (confidentialNames.some((name) => lowerName.includes(name)))
      findings.push(`${relativePath}: vertrouwelijke bestandsnaam`);
    if (!readableExtensions.has(extname(file).toLowerCase())) continue;
    const contents = readFileSync(file, "utf8");
    for (const marker of confidentialMarkers) {
      if (marker.test(contents))
        findings.push(
          `${relativePath}: vertrouwelijke documentmarkering ${marker}`,
        );
    }
    if (
      /\/voorstel[^/]*\.(?:html?|pdf|docx?)$/i.test(`/${relativePath}`) &&
      !relativePath.includes("voorstel/autobedrijven")
    ) {
      findings.push(
        `${relativePath}: voorstelbestand buiten een goedgekeurde voorstelroute`,
      );
    }
  }
}

roots.forEach(walk);

if (findings.length) {
  console.error(findings.join("\n"));
  process.exit(1);
}

console.log(
  `OK: publieke veiligheidscontrole geslaagd voor ${roots.map((root) => relative(process.cwd(), root) || ".").join(" en ")}.`,
);
