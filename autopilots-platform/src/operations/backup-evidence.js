export const AUTOPILOTS_BACKUP_PROJECT_REF = "wurycoodzcybaxcgqxps";

export function evaluateBackupInventory(payload, { now = new Date(), maxAgeHours = 36 } = {}) {
  const backups = Array.isArray(payload?.backups) ? payload.backups : [];
  const completed = backups
    .filter((backup) => backup?.status === "COMPLETED" && backup?.is_physical_backup === true && Number.isFinite(Date.parse(backup.inserted_at)))
    .sort((a, b) => Date.parse(b.inserted_at) - Date.parse(a.inserted_at));
  const latest = completed[0] || null;
  const ageHours = latest ? Math.max(0, (now.getTime() - Date.parse(latest.inserted_at)) / 3_600_000) : null;
  const fresh = ageHours !== null && ageHours <= maxAgeHours;
  return Object.freeze({
    contract: "autopilots.backup-evidence.v1",
    projectRef: AUTOPILOTS_BACKUP_PROJECT_REF,
    region: String(payload?.region || "unknown"),
    physicalBackupCount: completed.length,
    latestCompletedAt: latest?.inserted_at || null,
    latestAgeHours: ageHours === null ? null : Number(ageHours.toFixed(2)),
    maxAgeHours,
    fresh,
    walgEnabled: payload?.walg_enabled === true,
    pitrEnabled: payload?.pitr_enabled === true,
    restoreRehearsed: false,
    productionReady: false
  });
}

export function assertBackupEvidence(evidence) {
  const failures = [];
  if (evidence.contract !== "autopilots.backup-evidence.v1") failures.push("ongeldig evidencecontract");
  if (evidence.projectRef !== AUTOPILOTS_BACKUP_PROJECT_REF) failures.push("verkeerd Supabase-project");
  if (evidence.region !== "eu-central-1") failures.push("onverwachte backupregio");
  if (!evidence.walgEnabled) failures.push("fysieke backupopslag is niet actief");
  if (evidence.physicalBackupCount < 1) failures.push("geen voltooide fysieke backup");
  if (!evidence.fresh) failures.push("nieuwste backup is te oud");
  if (failures.length) throw Object.assign(new Error(`Backupbewijs faalt: ${failures.join(", ")}`), { code: "BACKUP_EVIDENCE_FAILED" });
  return evidence;
}
