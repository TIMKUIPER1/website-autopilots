import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const lines = readFileSync("public/_redirects", "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));
const rules = lines.map((line) => {
  const [from, to, status] = line.split(/\s+/);
  return { from, to, status };
});
const errors = [];
const exact = new Map(
  rules
    .filter((rule) => !rule.from.includes("*"))
    .map((rule) => [rule.from.replace(/\/$/, ""), rule]),
);

for (const rule of rules) {
  const from = rule.from.replace(/\/$/, "");
  const to = rule.to.replace(/\/$/, "");
  if (from === to) errors.push(`Self-loop: ${rule.from} -> ${rule.to}`);
  if (!/^(301|302|307|308)!?$/.test(rule.status ?? ""))
    errors.push(`Ongeldige status: ${rule.from}`);
  const chained = exact.get(to);
  if (chained)
    errors.push(`Redirectchain: ${rule.from} -> ${rule.to} -> ${chained.to}`);
  if (rule.to.startsWith("/nl/") && !rule.to.includes(":splat")) {
    const target = join("dist", rule.to, "index.html");
    if (!existsSync(target)) errors.push(`Doel ontbreekt in build: ${rule.to}`);
  }
}

const core = {
  "/producten": "/nl/producten/",
  "/voor-wie": "/nl/voor-wie/",
  "/proces": "/nl/proces/",
  "/crew": "/nl/crew/",
  "/afspraak": "/nl/afspraak/",
  "/bestel-direct": "/nl/bestel-direct/",
  "/kennisbank": "/nl/kennisbank/",
};
for (const [from, to] of Object.entries(core))
  if (exact.get(from)?.to !== to) errors.push(`Kernredirect onjuist: ${from}`);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `${rules.length} redirects gecontroleerd: geen self-loops, chains of ontbrekende exacte doelen.`,
);
