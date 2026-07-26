import { safeSessionId, saveFunnelEvent } from "./_shared/funnel-store.mjs";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
const text = (value, max) =>
  String(value ?? "")
    .trim()
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f]/g, " ")
    .slice(0, max);
const allowedEvents = new Set([
  "page_view",
  "funnel_started",
  "funnel_question_answered",
  "funnel_diagnosis_completed",
  "lead_form_submitted",
  "lead_form_succeeded",
  "lead_form_failed",
  "demo_page_view",
  "demo_role_selected",
  "demo_widget_opened",
  "roi_started",
  "roi_completed",
  "booking_clicked",
]);

export default async (request) => {
  if (request.method !== "POST") return json({ ok: false }, 405);
  if (Number(request.headers.get("content-length") || 0) > 12000)
    return json({ ok: false }, 413);
  let input;
  try {
    input = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }
  const sessionId = safeSessionId(input.sessionId);
  const event = text(input.event, 60);
  if (!sessionId || !allowedEvents.has(event)) return json({ ok: false }, 422);

  const properties = {};
  if (
    input.properties &&
    typeof input.properties === "object" &&
    !Array.isArray(input.properties)
  ) {
    Object.entries(input.properties)
      .slice(0, 16)
      .forEach(([key, value]) => {
        const safeKey = text(key, 50);
        const safeValue = text(value, 180);
        if (safeKey && safeValue) properties[safeKey] = safeValue;
      });
  }

  try {
    await saveFunnelEvent({
      sessionId,
      event,
      page: text(input.page, 240),
      occurredAt: new Date().toISOString(),
      properties,
    });
  } catch {
    return json({ ok: false }, 503);
  }
  return json({ ok: true });
};

export const config = { path: "/api/funnel-event", method: "POST" };
