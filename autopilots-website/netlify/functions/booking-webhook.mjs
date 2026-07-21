import { getStore } from "@netlify/blobs";
import { clean, hmac, json, safeEqualHex } from "./_shared/security.mjs";

export default async (request) => {
  if (request.method !== "POST") return json({ ok: false }, 405);
  const secret = process.env.GHL_BOOKING_WEBHOOK_SECRET;
  const raw = await request.text();
  const signature = clean(
    request.headers.get("x-autopilots-signature") ||
      request.headers.get("x-ghl-signature"),
    128,
  );
  if (!secret || !safeEqualHex(hmac(secret, raw), signature))
    return json({ ok: false }, 401);
  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return json({ ok: false }, 400);
  }
  const id = clean(
    event.id || event.appointmentId || event.appointment?.id,
    120,
  );
  if (!id) return json({ ok: false }, 422);
  const store = getStore("autopilots-conversions");
  if (await store.get(`booking/${id}`, { type: "json" }).catch(() => null))
    return json({ ok: true, duplicate: true });
  await store.setJSON(`booking/${id}`, {
    type: "appointment_completed",
    id,
    status: clean(event.status || event.appointment?.status, 40),
    receivedAt: new Date().toISOString(),
  });
  return json({ ok: true });
};
export const config = { path: "/api/webhooks/booking", method: "POST" };
