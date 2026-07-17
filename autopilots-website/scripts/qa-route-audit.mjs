import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = process.env.QA_DIST
  ? path.resolve(process.env.QA_DIST)
  : path.join(root, "dist");
const outDir = path.join(root, "docs", "qa");
const localeNames = new Set(["nl", "en", "es", "de", "it", "fr"]);

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
const strip = (value = "") =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
const attr = (tag, name) =>
  tag.match(new RegExp(`${name}=["']([^"']*)["']`, "i"))?.[1] ?? "";
const meta = (html, key, value) =>
  html.match(
    new RegExp(
      `<meta[^>]+${key}=["']${value}["'][^>]+content=["']([^"']*)["'][^>]*>`,
      "i",
    ),
  )?.[1] ??
  html.match(
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+${key}=["']${value}["'][^>]*>`,
      "i",
    ),
  )?.[1] ??
  "";
const routeFor = (file) => {
  const rel = path.relative(dist, file).split(path.sep).join("/");
  if (rel === "index.html") return "/";
  if (rel === "404.html") return "/404.html";
  return `/${rel.replace(/index\.html$/, "")}`;
};
const familyFor = (route) => {
  const parts = route.split("/").filter(Boolean);
  const localized = localeNames.has(parts[0]);
  const bits = localized ? parts.slice(1) : parts;
  const first = bits[0] ?? "home";
  if (
    [
      "producten",
      "products",
      "productos",
      "produkte",
      "prodotti",
      "produits",
    ].includes(first)
  )
    return bits.length > 1 ? "product-detail" : "product-index";
  if (
    [
      "voor-wie",
      "industries",
      "sectores",
      "secteurs",
      "branchen",
      "settori",
    ].includes(first)
  )
    return bits.length > 1 ? "niche-detail" : "niche-index";
  if (
    [
      "kennisbank",
      "knowledge",
      "conocimientos",
      "wissen",
      "conoscenza",
      "connaissances",
    ].includes(first)
  )
    return bits.length > 1 ? "knowledge-detail" : "knowledge-index";
  if (first === "lp") return "campaign";
  if (first === "voorstel") return "proposal";
  if (
    [
      "afspraak",
      "book-a-call",
      "cita",
      "termin",
      "appuntamento",
      "rendez-vous",
    ].includes(first)
  )
    return "appointment";
  if (
    [
      "bestel-direct",
      "order",
      "pedido",
      "direkt-bestellen",
      "ordina",
      "commander",
    ].includes(first)
  )
    return "order";
  return first;
};
const purposeFor = (family) =>
  ({
    home: "Taalkeuze of homepage",
    "product-index": "Productoriëntatie",
    "product-detail": "Productconversie",
    "niche-index": "Brancheoriëntatie",
    "niche-detail": "Brancheconversie",
    "knowledge-index": "Kennisnavigatie",
    "knowledge-detail": "Organisch bereik en uitleg",
    campaign: "Advertentiefunnel",
    proposal: "Voorstel en directe aankoop",
    appointment: "Afspraakconversie",
    order: "Directe aankoop",
  })[family] ?? "Informatie en navigatie";
const priorityFor = (family) =>
  [
    "home",
    "product-index",
    "product-detail",
    "niche-index",
    "niche-detail",
    "appointment",
    "order",
    "campaign",
    "proposal",
  ].includes(family)
    ? "Hoog"
    : family.startsWith("knowledge")
      ? "Midden"
      : "Laag";

const files = walk(dist).filter((file) => file.endsWith(".html"));
const routes = files
  .map((file) => {
    const html = fs.readFileSync(file, "utf8");
    const route = routeFor(file);
    const tags = (pattern) =>
      [...html.matchAll(pattern)].map((match) => match[0]);
    const headings = tags(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi);
    const imgs = tags(/<img\b[^>]*>/gi);
    const inputs = tags(/<(?:input|select|textarea)\b[^>]*>/gi).filter(
      (tag) => !/type=["'](?:hidden|submit|button)["']/i.test(tag),
    );
    const iframes = tags(/<iframe\b[^>]*>/gi);
    const jsonLdBlocks = [
      ...html.matchAll(
        /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
      ),
    ].map((match) => match[1]);
    const invalidJsonLd = jsonLdBlocks.filter((block) => {
      try {
        JSON.parse(block);
        return false;
      } catch {
        return true;
      }
    }).length;
    const ids = tags(/\bid=["'][^"']+["']/gi).map((tag) => attr(tag, "id"));
    const duplicateIds = [
      ...new Set(ids.filter((id, index) => id && ids.indexOf(id) !== index)),
    ];
    const title = strip(
      html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "",
    );
    const description = meta(html, "name", "description");
    const robots = meta(html, "name", "robots");
    const canonical =
      html.match(
        /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i,
      )?.[1] ??
      html.match(
        /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i,
      )?.[1] ??
      "";
    const lang = html.match(/<html[^>]+lang=["']([^"']+)["']/i)?.[1] ?? "";
    const family = familyFor(route);
    const issues = [];
    if (!title) issues.push("missing-title");
    if (!description) issues.push("missing-description");
    if (!canonical) issues.push("missing-canonical");
    if (headings.length !== 1) issues.push(`h1-count-${headings.length}`);
    if (imgs.some((tag) => !/\balt=["'][^"']*["']/i.test(tag)))
      issues.push("image-without-alt");
    if (iframes.some((tag) => !attr(tag, "title")))
      issues.push("iframe-without-title");
    if (duplicateIds.length) issues.push("duplicate-ids");
    if (invalidJsonLd) issues.push("invalid-json-ld");
    return {
      route,
      family,
      purpose: purposeFor(family),
      locale: localeNames.has(route.split("/")[1])
        ? route.split("/")[1]
        : lang || "nl",
      template: localeNames.has(route.split("/")[1])
        ? "LocalizedRoutePage/LocalizedHome"
        : "Dedicated Astro page",
      indexability: /noindex/i.test(robots) ? "noindex" : "index",
      priority: priorityFor(family),
      status: issues.length ? "Review" : "Automated pass",
      evidence: issues.join(", ") || "Metadata, canonical en H1 aanwezig",
      title,
      description,
      descriptionLength: description.length,
      canonical,
      h1: headings.map(strip),
      h1Count: headings.length,
      wordCount: strip(html.match(/<body[\s\S]*?<\/body>/i)?.[0] ?? html)
        .split(/\s+/)
        .filter(Boolean).length,
      mainWordCount: strip(html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? "")
        .split(/\s+/)
        .filter(Boolean).length,
      forms: (html.match(/<form\b/gi) ?? []).length,
      iframes: iframes.length,
      images: imgs.length,
      missingAlt: imgs.filter((tag) => !/\balt=["'][^"']*["']/i.test(tag))
        .length,
      inputs: inputs.length,
      labels: (html.match(/<label\b/gi) ?? []).length,
      jsonLd: jsonLdBlocks.length,
      invalidJsonLd,
      hreflang: (html.match(/hreflang=/gi) ?? []).length,
      duplicateIds,
    };
  })
  .sort((a, b) => a.route.localeCompare(b.route));

const summary = {
  generatedAt: new Date().toISOString(),
  total: routes.length,
  byFamily: Object.fromEntries(
    [...new Set(routes.map((r) => r.family))].map((family) => [
      family,
      routes.filter((r) => r.family === family).length,
    ]),
  ),
  indexable: routes.filter((r) => r.indexability === "index").length,
  noindex: routes.filter((r) => r.indexability === "noindex").length,
  withForms: routes.filter((r) => r.forms).length,
  withIframes: routes.filter((r) => r.iframes).length,
  missingAltRoutes: routes.filter((r) => r.missingAlt).length,
  duplicateIdRoutes: routes.filter((r) => r.duplicateIds.length).length,
  h1IssueRoutes: routes.filter((r) => r.h1Count !== 1).length,
  invalidJsonLdRoutes: routes.filter((r) => r.invalidJsonLd).length,
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "route-audit.json"),
  `${JSON.stringify({ summary, routes }, null, 2)}\n`,
);
const esc = (value) =>
  String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
const lines = [
  "# Route inventory",
  "",
  `Gegenereerd: ${summary.generatedAt}`,
  "",
  `Totaal: ${summary.total} HTML-routes · indexeerbaar: ${summary.indexable} · noindex: ${summary.noindex}.`,
  "",
  "| URL | Paginatype | Doel | Taal | Index | Prioriteit | Auditstatus | Bewijs |",
  "|---|---|---|---|---|---|---|---|",
];
for (const row of routes)
  lines.push(
    `| ${esc(row.route)} | ${esc(row.family)} | ${esc(row.purpose)} | ${esc(row.locale)} | ${row.indexability} | ${row.priority} | ${row.status} | ${esc(row.evidence)} |`,
  );
fs.writeFileSync(
  path.join(outDir, "ROUTE_INVENTORY.md"),
  `${lines.join("\n")}\n`,
);
console.log(JSON.stringify(summary, null, 2));
