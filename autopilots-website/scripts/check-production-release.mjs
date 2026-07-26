import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(".");
const repositoryRoot = resolve("..");
const manifest = JSON.parse(
  readFileSync(
    resolve(root, "config/production-release-manifest.json"),
    "utf8",
  ),
);
const mode = process.argv[2] ?? "source";
const errors = [];

if (!["source", "dist"].includes(mode)) {
  throw new Error(
    "Gebruik: node scripts/check-production-release.mjs source|dist",
  );
}

const required =
  mode === "source"
    ? manifest.requiredSourceFiles
    : manifest.requiredBuiltFiles;

for (const file of required) {
  if (!existsSync(resolve(root, file))) errors.push(`${file} ontbreekt`);
}

if (mode === "source") {
  const obsoleteWorkflow = resolve(root, ".github/workflows/quality.yml");
  if (existsSync(obsoleteWorkflow)) {
    errors.push(
      "de kwaliteitsworkflow staat nog in autopilots-website/.github en is daardoor inactief",
    );
  }

  const run = (...args) =>
    execFileSync("git", args, {
      cwd: repositoryRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();

  try {
    const base = String(process.env.RELEASE_BASE_SHA ?? "").trim();
    const releaseHead = String(process.env.RELEASE_HEAD_SHA ?? "HEAD").trim();
    if (base && !/^0+$/.test(base)) {
      run("cat-file", "-e", `${base}^{commit}`);
      run("cat-file", "-e", `${releaseHead}^{commit}`);
      const mergeBase = run("merge-base", base, releaseHead);
      if (mergeBase !== base) {
        errors.push(
          "de release is niet rechtstreeks gebaseerd op de opgegeven actuele basiscommit",
        );
      }

      const changed = run(
        "diff",
        "--name-status",
        "--find-renames",
        `${base}...${releaseHead}`,
      )
        .split("\n")
        .filter(Boolean);
      const deleted = changed
        .filter((line) => line.startsWith("D\t"))
        .map((line) => line.slice(2));
      const protectedDeleted = deleted.filter((file) =>
        manifest.protectedPaths.includes(file),
      );
      if (protectedDeleted.length) {
        errors.push(
          `beschermde releasebestanden verwijderd: ${protectedDeleted.join(", ")}`,
        );
      }
      if (deleted.length > manifest.maximumDeletedFiles) {
        errors.push(
          `${deleted.length} bestanden verwijderd; maximum is ${manifest.maximumDeletedFiles}`,
        );
      }

      const numstat = run("diff", "--numstat", `${base}...${releaseHead}`)
        .split("\n")
        .filter(Boolean);
      const deletedLines = numstat.reduce((total, line) => {
        const value = line.split("\t")[1];
        return total + (/^\d+$/.test(value) ? Number(value) : 0);
      }, 0);
      if (deletedLines > manifest.maximumDeletedLines) {
        errors.push(
          `${deletedLines} regels verwijderd; maximum is ${manifest.maximumDeletedLines}`,
        );
      }
    }
  } catch (error) {
    errors.push(
      `Git-releasecontrole kon niet worden uitgevoerd: ${error.message}`,
    );
  }
}

if (mode === "dist") {
  const releaseFile = resolve(root, "dist/.well-known/autopilots-release.json");
  if (existsSync(releaseFile)) {
    const release = JSON.parse(readFileSync(releaseFile, "utf8"));
    if (!release.commit || release.commit === "unknown") {
      errors.push("de productiebuild bevat geen verifieerbare commit-SHA");
    }
  }
}

if (errors.length) {
  console.error(
    [
      "PRODUCTIERELEASE GEBLOKKEERD:",
      ...errors.map((error) => `- ${error}`),
    ].join("\n"),
  );
  process.exit(1);
}

console.log(
  `OK: ${mode === "source" ? "bron en Git-basis" : "productieartifact"} voldoen aan het releasecontract.`,
);
