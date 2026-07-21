import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const clean = (value, max = 180) =>
  String(value ?? "")
    .trim()
    .replace(/[\u0000-\u001f]/g, " ")
    .slice(0, max);
export const validEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 160;
export const normalizePhone = (value) => {
  const source = clean(value, 40);
  const digits = source.replace(/\D/g, "");
  return digits ? `${source.startsWith("+") ? "+" : ""}${digits}` : "";
};
export const digest = (value) =>
  createHash("sha256").update(String(value)).digest("hex");
export const safeEqualHex = (left, right) => {
  if (
    !/^[a-f0-9]+$/i.test(left) ||
    !/^[a-f0-9]+$/i.test(right) ||
    left.length !== right.length
  )
    return false;
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
};
export const hmac = (secret, value) =>
  createHmac("sha256", secret).update(value).digest("hex");
export const json = (body, status = 200, correlationId = "") =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...(correlationId ? { "X-Correlation-ID": correlationId } : {}),
    },
  });
export const splitName = (name) => {
  const parts = name.split(/\s+/).filter(Boolean);
  return { firstName: parts.shift() || name, lastName: parts.join(" ") };
};
export const clientIp = (request) =>
  clean(
    request.headers.get("x-nf-client-connection-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown",
    80,
  );
export const verifyStripeSignature = (
  raw,
  header,
  secret,
  toleranceSeconds = 300,
) => {
  const parts = Object.fromEntries(
    String(header)
      .split(",")
      .map((part) => part.split("=", 2)),
  );
  const timestamp = Number(parts.t);
  if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds)
    return false;
  return safeEqualHex(hmac(secret, `${timestamp}.${raw}`), parts.v1 || "");
};
