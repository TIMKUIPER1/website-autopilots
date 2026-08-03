import { execFileSync } from "node:child_process";
import { assertBackupEvidence, AUTOPILOTS_BACKUP_PROJECT_REF, evaluateBackupInventory } from "../src/operations/backup-evidence.js";

let payload;
try {
  const output = execFileSync("supabase", ["backups", "list", "--project-ref", AUTOPILOTS_BACKUP_PROJECT_REF, "-o", "json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  payload = JSON.parse(output);
} catch {
  console.error(JSON.stringify({ ok: false, code: "BACKUP_INVENTORY_UNAVAILABLE" }));
  process.exit(1);
}

try {
  const evidence = assertBackupEvidence(evaluateBackupInventory(payload));
  console.log(JSON.stringify({ ok: true, ...evidence }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ ok: false, code: error.code || "BACKUP_EVIDENCE_FAILED", message: error.message }));
  process.exit(1);
}
