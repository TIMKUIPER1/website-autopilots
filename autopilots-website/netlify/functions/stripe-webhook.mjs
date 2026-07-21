import { getStore } from "@netlify/blobs";
import { clean, json, verifyStripeSignature } from "./_shared/security.mjs";

export default async (request) => {
  if (request.method !== "POST") return json({ ok: false }, 405);
  const raw = await request.text();
  if (
    !process.env.STRIPE_WEBHOOK_SECRET ||
    !verifyStripeSignature(
      raw,
      request.headers.get("stripe-signature"),
      process.env.STRIPE_WEBHOOK_SECRET,
    )
  )
    return json({ ok: false }, 401);
  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return json({ ok: false }, 400);
  }
  if (!event.id) return json({ ok: false }, 422);
  const store = getStore("autopilots-conversions");
  if (
    await store.get(`payment/${event.id}`, { type: "json" }).catch(() => null)
  )
    return json({ received: true, duplicate: true });
  if (
    ["checkout.session.completed", "payment_intent.succeeded"].includes(
      event.type,
    )
  )
    await store.setJSON(`payment/${event.id}`, {
      type: "payment_completed",
      eventType: event.type,
      objectId: clean(event.data?.object?.id, 120),
      receivedAt: new Date().toISOString(),
    });
  return json({ received: true });
};
export const config = { path: "/api/webhooks/stripe", method: "POST" };
