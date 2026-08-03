import crypto from "node:crypto";
import { validateProductSnapshot } from "./product-snapshot.js";

const GATES = Object.freeze(["contract_probe", "privacy_probe", "freshness_probe"]);

export function deriveProductSnapshotEvidence(product, snapshot, { now = Date.now() } = {}) {
  const validation = validateProductSnapshot(snapshot, { expectedProduct: product, now });
  if (!validation.ok) throw evidenceError(validation.errorCode);
  const canonical = canonicalJson(validation.snapshot);
  const evidence = GATES.map((gateKey) => ({
    gateKey,
    result: "passed",
    evidenceSha256: crypto.createHash("sha256")
      .update(`autopilots.product-snapshot-evidence.v1\n${gateKey}\n${canonical}`)
      .digest("hex"),
    sourceCategory: "contract_validator",
    observedAt: validation.snapshot.observedAt
  }));
  return {
    contract: "autopilots.product-snapshot-evidence-candidate.v1",
    product,
    evidence,
    containsRawPayload: false,
    dataConnectionEnabled: false,
    providerAuthorizationEnabled: false,
    externalWritesEnabled: false
  };
}

export function snapshotEvidenceIdempotencyKey(requestKey) {
  const normalized = String(requestKey || "");
  if (!/^[A-Za-z0-9:_-]{8,120}$/.test(normalized)) throw evidenceError("IDEMPOTENCY_KEY_INVALID");
  return `snapshot:${crypto.createHash("sha256").update(normalized).digest("hex").slice(0, 32)}`;
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function evidenceError(code) {
  return Object.assign(new Error("Product snapshot evidence could not be derived."), { code });
}
