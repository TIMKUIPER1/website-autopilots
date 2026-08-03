import assert from "node:assert/strict";
import test from "node:test";
import { assertBackupEvidence, evaluateBackupInventory } from "../src/operations/backup-evidence.js";

const now = new Date("2026-08-03T12:00:00.000Z");

test("fresh physical backup becomes bounded evidence, never restore proof", () => {
  const evidence = evaluateBackupInventory({
    region: "eu-central-1", walg_enabled: true, pitr_enabled: false,
    backups: [
      { inserted_at: "2026-08-02T23:04:34.755Z", status: "COMPLETED", is_physical_backup: true },
      { inserted_at: "2026-08-01T23:06:41.120Z", status: "COMPLETED", is_physical_backup: true }
    ]
  }, { now });
  assert.equal(evidence.fresh, true);
  assert.equal(evidence.physicalBackupCount, 2);
  assert.equal(evidence.pitrEnabled, false);
  assert.equal(evidence.restoreRehearsed, false);
  assert.equal(evidence.productionReady, false);
  assert.equal(assertBackupEvidence(evidence), evidence);
});

test("missing, failed, stale or wrong-region backup evidence fails closed", () => {
  for (const payload of [
    { region: "eu-central-1", walg_enabled: true, backups: [] },
    { region: "eu-central-1", walg_enabled: true, backups: [{ inserted_at: "2026-08-02T23:00:00Z", status: "FAILED", is_physical_backup: true }] },
    { region: "eu-central-1", walg_enabled: true, backups: [{ inserted_at: "2026-07-30T00:00:00Z", status: "COMPLETED", is_physical_backup: true }] },
    { region: "us-east-1", walg_enabled: true, backups: [{ inserted_at: "2026-08-03T00:00:00Z", status: "COMPLETED", is_physical_backup: true }] }
  ]) {
    assert.throws(() => assertBackupEvidence(evaluateBackupInventory(payload, { now })), { code: "BACKUP_EVIDENCE_FAILED" });
  }
});
