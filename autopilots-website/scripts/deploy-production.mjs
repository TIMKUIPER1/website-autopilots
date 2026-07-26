import { execFileSync } from "node:child_process";

const run = (...args) =>
  execFileSync("git", args, {
    cwd: "..",
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();

const branch = run("branch", "--show-current");
const dirty = run("status", "--porcelain");
run("fetch", "origin", "main");
const head = run("rev-parse", "HEAD");
const remoteMain = run("rev-parse", "origin/main");

const errors = [];
if (branch !== "main")
  errors.push(`actieve branch is ${branch || "detached"}, niet main`);
if (dirty) errors.push("de werkmap bevat niet-gecommitteerde wijzigingen");
if (head !== remoteMain)
  errors.push("de lokale commit is niet exact gelijk aan origin/main");
if (process.env.AUTOPILOTS_BREAK_GLASS_APPROVED !== "YES")
  errors.push("expliciete break-glass-goedkeuring ontbreekt");

if (errors.length) {
  console.error(
    [
      "LOKALE PRODUCTIEDEPLOY GEBLOKKEERD.",
      "Normale productiepublicatie hoort uitsluitend via de goedgekeurde GitHub/Netlify-pipeline te lopen.",
      ...errors.map((error) => `- ${error}`),
    ].join("\n"),
  );
  process.exit(1);
}

console.log(
  `Break-glass-deploy toegestaan voor exact origin/main op commit ${head}.`,
);
execFileSync(
  "npx",
  [
    "netlify-cli",
    "deploy",
    "--prod",
    "--dir=dist",
    "--message",
    `Approved break-glass release ${head}`,
  ],
  { stdio: "inherit" },
);
