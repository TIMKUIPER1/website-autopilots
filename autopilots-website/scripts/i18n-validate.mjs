import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
const locales = ["nl", "en", "es", "de", "it", "fr"];
const strict = process.argv.includes("--strict");
const errors = [];
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((item) =>
    item.isDirectory() ? walk(join(dir, item.name)) : [join(dir, item.name)],
  );
for (const locale of locales) {
  const root = join("dist", locale);
  if (!existsSync(root)) {
    errors.push(`Ontbrekende locale-map: ${locale}`);
    continue;
  }
  for (const file of walk(root).filter((file) => file.endsWith(".html"))) {
    const html = readFileSync(file, "utf8");
    if (
      !html.includes(`<html lang="${locale}-`) &&
      !(locale === "en" && html.includes('<html lang="en-GB"'))
    )
      errors.push(`${file}: onjuiste html lang`);
    if (!html.includes('rel="canonical"'))
      errors.push(`${file}: canonical ontbreekt`);
    const noindex = /<meta name="robots" content="noindex(?:,|")/.test(html);
    // Alleen SEO-alternates in <head> vormen een hreflangcluster. De taalkeuze
    // gebruikt hreflang op gewone navigatielinks, maar publiceert daarmee geen
    // vertaling aan zoekmachines.
    const hreflangs = [
      ...html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"/g),
    ].map((match) => match[1]);
    if (
      locale === "nl" &&
      !noindex &&
      (!hreflangs.includes("nl-NL") || !hreflangs.includes("x-default"))
    )
      errors.push(
        `${file}: publiceerbare NL-pagina mist nl-NL of x-default hreflang`,
      );
    if (
      !noindex &&
      (!hreflangs.includes(
        `${locale}-${locale === "en" ? "GB" : locale.toUpperCase()}`,
      ) ||
        !hreflangs.includes("x-default"))
    )
      errors.push(
        `${file}: indexeerbare pagina mist eigen locale of x-default hreflang`,
      );
    if (
      /\b(TRANSLATION_MISSING|LOREM IPSUM)\b/i.test(html) ||
      /\bTODO\s*:/i.test(html)
    )
      errors.push(`${file}: zichtbare placeholder`);
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  "Route-, lang-, canonical-, hreflang- en placeholdercontrole geslaagd.",
);
if (strict) {
  for (const locale of locales) {
    const sitemap = readFileSync(join("dist", `sitemap-${locale}.xml`), "utf8");
    if (!/<url>/.test(sitemap))
      errors.push(`sitemap-${locale}.xml: bevat geen publiceerbare URL's`);
  }
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  console.log(
    "Strikte publicatiecontrole geslaagd: alle locale-sitemaps bevatten publiceerbare routes en noindex-routes blijven uitgesloten.",
  );
}
