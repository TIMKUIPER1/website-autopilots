import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, normalize, relative, resolve } from "node:path";

const root = resolve("dist");
const htmlFiles = [];
const walk = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name === "index.html" || entry.name === "404.html") htmlFiles.push(path);
  }
};
walk(root);

const errors = [];
const checked = new Set();
const seenTitles = new Map();
const seenCanonicals = new Map();
const publicBuildTerms = /\b(lorem ipsum|TODO|placeholder|previewpagina|demo content|interne notitie)\b/i;

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const page = `/${relative(root, file).replaceAll("\\", "/").replace(/index\.html$/, "")}`;
  const h1Count = (html.match(/<h1(?:\s|>)/g) || []).length;
  const redirect = html.includes("http-equiv=\"refresh\"");
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (h1Count !== 1 && !redirect) errors.push(`${page}: verwacht 1 H1, gevonden ${h1Count}`);
  if (!title && !redirect) errors.push(`${page}: title ontbreekt`);
  if (!/<meta name="description" content="[^"]+"/.test(html) && !redirect) errors.push(`${page}: meta description ontbreekt`);
  const noindex = html.includes('content="noindex');
  if (!canonical && !redirect && !noindex) errors.push(`${page}: canonical ontbreekt`);
  if (!redirect && !noindex) {
    if (title && seenTitles.has(title)) errors.push(`${page}: dubbele title met ${seenTitles.get(title)}`);
    if (canonical && seenCanonicals.has(canonical)) errors.push(`${page}: dubbele canonical met ${seenCanonicals.get(canonical)}`);
    if (title) seenTitles.set(title, page);
    if (canonical) seenCanonicals.set(canonical, page);
  }
  const visibleText = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ");
  if (publicBuildTerms.test(visibleText)) errors.push(`${page}: publieke bouwterm gevonden`);
  if (!redirect && !/<html[^>]+lang="[^"]+"/.test(html)) errors.push(`${page}: html-lang ontbreekt`);
  if (/tabindex="[1-9]/.test(html)) errors.push(`${page}: positieve tabindex gevonden`);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) errors.push(`${page}: dubbele id ${[...new Set(duplicateIds)].join(", ")}`);
  for (const tag of html.match(/<img\b[^>]*>/g) || []) if (!/\balt="[^"]*"/.test(tag)) errors.push(`${page}: afbeelding zonder alt`);
  for (const tag of html.match(/<iframe\b[^>]*>/g) || []) if (!/\btitle="[^"]+"/.test(tag)) errors.push(`${page}: iframe zonder titel`);
  for (const tag of html.match(/<a\b[^>]*target="_blank"[^>]*>/g) || []) if (!/\brel="[^"]*noopener/.test(tag)) errors.push(`${page}: externe nieuwe tab zonder noopener`);

  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const href = match[1].replaceAll("&#38;", "&amp;").replaceAll("&amp;", "&");
    if (!href || /^(https?:|mailto:|tel:|javascript:)/.test(href)) continue;
    if (href.startsWith("#")) {
      const id = decodeURIComponent(href.slice(1));
      if (id && !html.includes(`id="${id}"`)) errors.push(`${page}: kapot anker ${href}`);
      continue;
    }
    const key = `${page} -> ${href}`;
    if (checked.has(key)) continue;
    checked.add(key);
    const clean = href.split("#")[0].split("?")[0];
    const sourceUrl = new URL(page, "https://auto-pilots.io");
    const targetUrl = new URL(clean, sourceUrl);
    let target = join(root, decodeURIComponent(targetUrl.pathname));
    if (targetUrl.pathname.endsWith("/")) target = join(target, "index.html");
    else if (!extname(target)) target = join(target, "index.html");
    if (!existsSync(normalize(target))) errors.push(`${page}: kapotte link ${href}`);
    else if (href.includes("#")) {
      const id = decodeURIComponent(href.split("#")[1] || "");
      if (id && !readFileSync(normalize(target), "utf8").includes(`id="${id}"`)) errors.push(`${page}: kapot anker ${href}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`OK: ${htmlFiles.length} HTML-pagina's, ${checked.size} interne links, metadata en H1-structuur gecontroleerd.`);
