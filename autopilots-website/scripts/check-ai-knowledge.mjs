import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = "dist/kennisbank";
const reserved = new Set(["ai", "autopilots"]);
const slugs = readdirSync(root).filter((slug) => !reserved.has(slug) && existsSync(join(root, slug, "index.html")));
const errors = [];
const titles = new Set();
const descriptions = new Set();
const sitemap = readdirSync("dist").filter((name) => name.startsWith("sitemap") && name.endsWith(".xml")).map((name) => readFileSync(join("dist", name), "utf8")).join("\n");

if (slugs.length !== 15) errors.push(`verwacht exact 15 artikelen, gevonden ${slugs.length}`);

for (const slug of slugs) {
  const html = readFileSync(join(root, slug, "index.html"), "utf8");
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? "";
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1] ?? "";
  const canonical = `https://auto-pilots.io/kennisbank/${slug}/`;
  const article = html.match(/<article class="ap-blog-article">([\s\S]*?)<\/article>/)?.[1] ?? "";
  const words = article.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const schemaText = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  let schema = [];
  try { schema = JSON.parse(schemaText ?? "[]"); } catch { errors.push(`${slug}: ongeldige JSON-LD`); }
  const schemaTypes = new Set(schema.map((item) => item["@type"]));

  if (!title || titles.has(title)) errors.push(`${slug}: ontbrekende of dubbele title`);
  if (title.length > 65) errors.push(`${slug}: title langer dan 65 tekens (${title.length})`);
  if (!description || descriptions.has(description)) errors.push(`${slug}: ontbrekende of dubbele description`);
  if (description.length < 115 || description.length > 165) errors.push(`${slug}: description buiten redactionele bandbreedte (${description.length})`);
  if ((html.match(/<h1(?:\s|>)/g) ?? []).length !== 1) errors.push(`${slug}: niet exact één H1`);
  if (!/<h2(?:\s|>)/.test(article) || !/<h3(?:\s|>)/.test(article)) errors.push(`${slug}: H2/H3-structuur ontbreekt`);
  if (words < 700) errors.push(`${slug}: artikelinhoud te dun (${words} woorden in hoofdartikel)`);
  if (!html.includes(`<link rel="canonical" href="${canonical}"`)) errors.push(`${slug}: canonical wijkt af`);
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) errors.push(`${slug}: ontbreekt in sitemap`);
  if (!["BlogPosting", "BreadcrumbList", "FAQPage"].every((type) => schemaTypes.has(type))) errors.push(`${slug}: vereist schema ontbreekt`);
  if (!/href="\/producten\//.test(html) || !/href="\/voor-wie\//.test(html)) errors.push(`${slug}: product- of nichelint ontbreekt`);
  if (!/id="bronnen"/.test(html) || !/target="_blank" rel="noopener noreferrer"/.test(html)) errors.push(`${slug}: bronsectie of veilige externe link ontbreekt`);
  titles.add(title);
  descriptions.add(description);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`OK: ${slugs.length} AI Kennis-artikelen; unieke metadata, H1/H2/H3, canonicals, sitemap, schema, bron- en contextlinks gecontroleerd.`);
