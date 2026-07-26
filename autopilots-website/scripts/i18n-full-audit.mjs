import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const dist = path.resolve("dist");
const outDir = path.resolve("docs/i18n");
const locales = ["en", "de", "es", "it", "fr"];
const count = (html, pattern) => (html.match(pattern) ?? []).length;
const text = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
const hash = (value) =>
  crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
const ids = (html) =>
  [...html.matchAll(/<section\b[^>]*\bid="([^"]+)"/gi)].map(
    (match) => match[1],
  );
const signature = (html) => ({
  sections: count(html, /<section\b/gi),
  headings: count(html, /<h[1-3]\b/gi),
  articles: count(html, /<article\b/gi),
  details: count(html, /<details\b/gi),
  buttons: count(html, /<button\b/gi),
  forms: count(html, /<form\b/gi),
  inputs: count(html, /<(?:input|select|textarea)\b/gi),
  images: count(html, /<(?:img|svg)\b/gi),
  interactive: count(
    html,
    /\bdata-(?:agent|branch|niche|product|process|demo|crew|explore|roi|pricing)-/gi,
  ),
  sectionIds: ids(html),
});
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    return entry.isDirectory()
      ? walk(target)
      : entry.name === "index.html"
        ? [target]
        : [];
  });
const dutchSignals =
  /\b(?:bekijk|afspraak|bestel|volgende|klantreis|veelgestelde|waarom|onze|jouw|jullie|wordt|worden|kies|producten|kennisbank|voorwaarden|privacyverklaring)\b/gi;
const rows = [];
for (const locale of locales) {
  for (const file of walk(path.join(dist, locale))) {
    const html = fs.readFileSync(file, "utf8");
    const source = html.match(
      /<link rel="alternate" hreflang="nl-NL" href="https:\/\/auto-pilots\.io(\/nl\/[^"?]*)/i,
    )?.[1];
    if (!source) continue;
    const sourceFile = path.join(dist, source.replace(/^\//, ""), "index.html");
    if (!fs.existsSync(sourceFile)) continue;
    const sourceHtml = fs.readFileSync(sourceFile, "utf8");
    const expected = signature(sourceHtml);
    const actual = signature(html);
    const structural = JSON.stringify(actual) === JSON.stringify(expected);
    const visible = text(html);
    const mixed = [...new Set(visible.match(dutchSignals) ?? [])];
    const canonical =
      html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1] ?? "";
    const lang = html.match(/<html[^>]+lang="([^"]+)"/i)?.[1] ?? "";
    const alternates = count(html, /<link rel="alternate" hreflang=/gi);
    const seo =
      Boolean(canonical) &&
      lang.toLowerCase().startsWith(locale) &&
      alternates >= 6;
    const sourceHash = hash(text(sourceHtml));
    const routeName = `/${path
      .relative(dist, file)
      .replace(/index\.html$/, " ")
      .trim()
      .replaceAll(path.sep, "/")}`;
    rows.push({
      locale,
      route: routeName,
      source,
      sourceHash,
      translatedFromHash: sourceHash,
      automationStatus:
        structural && !mixed.length && seo
          ? "auto-translated"
          : "review-required",
      nativeReview: "required",
      legalReview:
        /\/(?:privacy|privacidad|datenschutz|confidentialite|terms|condiciones|bedingungen|condizioni)\//.test(
          routeName,
        )
          ? "required"
          : "not-applicable",
      status:
        structural && !mixed.length && seo ? "complete" : "review-required",
      structural,
      mixedLanguage: mixed,
      seo,
      actual,
      expected,
    });
  }
}
fs.mkdirSync(outDir, { recursive: true });
const summary = Object.fromEntries(
  locales.map((locale) => {
    const items = rows.filter((row) => row.locale === locale);
    return [
      locale,
      {
        routes: items.length,
        complete: items.filter((row) => row.status === "complete").length,
        structuralMismatch: items.filter((row) => !row.structural).length,
        mixedLanguage: items.filter((row) => row.mixedLanguage.length).length,
        seoMismatch: items.filter((row) => !row.seo).length,
      },
    ];
  }),
);
fs.writeFileSync(
  path.join(outDir, "translation-coverage.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      sourceLocale: "nl",
      summary,
      routes: rows,
    },
    null,
    2,
  ),
);
const matrix = [
  "# Full route parity matrix",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "| Locale | Route | Dutch source | Status | Structure | Mixed language | SEO |",
  "|---|---|---|---|---:|---:|---:|",
  ...rows.map(
    (row) =>
      `| ${row.locale.toUpperCase()} | \`${row.route}\` | \`${row.source}\` | ${row.status} | ${row.structural ? "✓" : "✗"} | ${row.mixedLanguage.length ? `✗ ${row.mixedLanguage.join(", ")}` : "✓"} | ${row.seo ? "✓" : "✗"} |`,
  ),
  "",
];
fs.writeFileSync(
  path.join(outDir, "FULL_ROUTE_PARITY_MATRIX.md"),
  matrix.join("\n"),
);
const report = [
  "# Translation coverage report",
  "",
  "Dutch is the source of truth. A route only counts as complete when structure, visible-language scan and locale SEO all pass.",
  "",
  "| Locale | Routes | Complete | Structural mismatches | Mixed-language pages | SEO mismatches |",
  "|---|---:|---:|---:|---:|---:|",
  ...locales.map((locale) => {
    const item = summary[locale];
    return `| ${locale.toUpperCase()} | ${item.routes} | ${item.complete} | ${item.structuralMismatch} | ${item.mixedLanguage} | ${item.seoMismatch} |`;
  }),
  "",
  "## Current blockers",
  "",
  ...rows
    .filter((row) => row.status !== "complete")
    .map(
      (row) =>
        `- ${row.locale.toUpperCase()} \`${row.route}\`: ${[!row.structural && "section/component parity", row.mixedLanguage.length && "mixed Dutch copy", !row.seo && "SEO/hreflang"].filter(Boolean).join(", ")}`,
    ),
  "",
];
fs.writeFileSync(
  path.join(outDir, "TRANSLATION_COVERAGE_REPORT.md"),
  report.join("\n"),
);
console.log(
  JSON.stringify(
    {
      summary,
      totalRoutes: rows.length,
      remaining: rows.filter((row) => row.status !== "complete").length,
    },
    null,
    2,
  ),
);
if (rows.some((row) => row.status !== "complete")) process.exitCode = 1;
