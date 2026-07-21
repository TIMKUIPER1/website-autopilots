import fs from "node:fs";
import path from "node:path";

const locales = ["en", "de", "es", "it", "fr"];
const dist = path.resolve("dist");
const files = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const target = path.join(dir, entry.name);
  return entry.isDirectory() ? files(target) : entry.name === "index.html" ? [target] : [];
});
const count = (html, pattern) => (html.match(pattern) ?? []).length;
const signature = (html) => ({
  sections: count(html, /<section\b/g),
  headings: count(html, /<h[12]\b/g),
  articles: count(html, /<article\b/g),
  details: count(html, /<details\b/g),
  buttons: count(html, /<button\b/g),
  interactive: count(html, /\bdata-(?:agent|branch|niche|product|process|demo|crew)-/g),
});

const failures = [];
for (const locale of locales) {
  for (const file of files(path.join(dist, locale))) {
    const html = fs.readFileSync(file, "utf8");
    const alternate = html.match(/<link rel="alternate" hreflang="nl-NL" href="https:\/\/auto-pilots\.io(\/nl\/[^"?]*)"/i)?.[1];
    if (!alternate) continue;
    const nlFile = path.join(dist, alternate.replace(/^\//, ""), "index.html");
    if (!fs.existsSync(nlFile)) continue;
    const actual = signature(html);
    const expected = signature(fs.readFileSync(nlFile, "utf8"));
    if (JSON.stringify(actual) !== JSON.stringify(expected)) failures.push({ route: `/${path.relative(dist, file).replace(/index\.html$/, "")}`, source: alternate, actual, expected });
  }
}

if (failures.length) {
  console.error(JSON.stringify({ mismatches: failures.length, failures }, null, 2));
  process.exitCode = 1;
} else {
  console.log("OK: alle buitenlandse routes hebben dezelfde structurele opbouw als Nederlands.");
}
