import crypto from "node:crypto";

const RISKS = new Set(["R0", "R1", "R2", "R3"]);
const ENVIRONMENTS = new Set(["demo", "sandbox", "staging", "production"]);

export class PersistenceError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = "PersistenceError";
    this.code = code;
    this.status = status;
  }
}

export function normalizeCommandRequest(input) {
  const command = {
    brandId: uuid(input?.brandId, "brandId"),
    environmentId: uuid(input?.environmentId, "environmentId"),
    commandType: identifier(input?.commandType, "commandType"),
    riskClass: String(input?.riskClass || ""),
    idempotencyKey: boundedText(input?.idempotencyKey, "idempotencyKey", 8, 200),
    contextVersion: positiveInteger(input?.contextVersion, "contextVersion"),
    payload: plainObject(input?.payload, "payload"),
    reason: boundedText(input?.reason, "reason", 3, 1000),
    evidence: stringArray(input?.evidence, "evidence", 50),
    source: identifier(input?.source || "autopilots_os", "source")
  };
  if (!RISKS.has(command.riskClass)) throw new PersistenceError("INVALID_RISK_CLASS", "Ongeldige risicoklasse.");
  return Object.freeze({ ...command, fingerprint: commandFingerprint(command) });
}

export function normalizeEnvironment(value) {
  const environment = String(value || "").toLowerCase();
  if (!ENVIRONMENTS.has(environment)) throw new PersistenceError("INVALID_ENVIRONMENT", "Ongeldige omgeving.");
  return environment;
}

export function commandFingerprint(command) {
  const canonical = stableStringify({
    brandId: command.brandId,
    environmentId: command.environmentId,
    commandType: command.commandType,
    riskClass: command.riskClass,
    contextVersion: command.contextVersion,
    payload: command.payload
  });
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

export function assertIdempotentReplay(existing, requested) {
  const existingFingerprint = existing.fingerprint || commandFingerprint(existing);
  if (existingFingerprint !== requested.fingerprint) {
    throw new PersistenceError(
      "IDEMPOTENCY_CONFLICT",
      "Dezelfde idempotency key is al gebruikt voor een andere opdracht.",
      409
    );
  }
  return existing;
}

function uuid(value, name) {
  const normalized = String(value || "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)) {
    throw new PersistenceError("INVALID_UUID", `${name} moet een geldige UUID zijn.`);
  }
  return normalized;
}

function identifier(value, name) {
  const normalized = String(value || "").trim();
  if (!/^[a-z][a-z0-9_.-]{1,99}$/i.test(normalized)) {
    throw new PersistenceError("INVALID_IDENTIFIER", `${name} heeft een ongeldig formaat.`);
  }
  return normalized;
}

function boundedText(value, name, min, max) {
  const normalized = String(value || "").trim();
  if (normalized.length < min || normalized.length > max) {
    throw new PersistenceError("INVALID_TEXT", `${name} moet tussen ${min} en ${max} tekens bevatten.`);
  }
  return normalized;
}

function positiveInteger(value, name) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) {
    throw new PersistenceError("INVALID_VERSION", `${name} moet een positief geheel getal zijn.`);
  }
  return number;
}

function plainObject(value, name) {
  if (value === undefined) return {};
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new PersistenceError("INVALID_OBJECT", `${name} moet een object zijn.`);
  }
  return structuredClone(value);
}

function stringArray(value, name, maxItems) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > maxItems || value.some((item) => typeof item !== "string" || !item.trim())) {
    throw new PersistenceError("INVALID_ARRAY", `${name} moet een lijst met maximaal ${maxItems} niet-lege teksten zijn.`);
  }
  return value.map((item) => item.trim());
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
