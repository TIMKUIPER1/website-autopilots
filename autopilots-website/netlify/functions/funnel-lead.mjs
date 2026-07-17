import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";
import {
  clean,
  clientIp,
  digest,
  json,
  normalizePhone,
  splitName,
  validEmail,
} from "./_shared/security.mjs";

const api = "https://services.leadconnectorhq.com";
const ghlHeaders = (token, version = "2021-07-28") => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${token}`,
  Version: version,
});
const parseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const enforceRateLimit = async (store, request) => {
  const bucket = Math.floor(Date.now() / 600000);
  const key = `rate/${digest(`${clientIp(request)}:${bucket}`)}`;
  const current = await store.get(key, { type: "json" }).catch(() => null);
  const count = Number(current?.count || 0) + 1;
  await store.setJSON(key, { count, expiresAt: Date.now() + 660000 });
  return count <= 5;
};

const notifyFailure = async (correlationId) => {
  if (!process.env.ALERT_WEBHOOK_URL) return;
  await fetch(process.env.ALERT_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: "lead_processing_failed", correlationId }),
    signal: AbortSignal.timeout(4000),
  }).catch(() => {});
};

export default async (request) => {
  const correlationId = randomUUID();
  if (request.method !== "POST")
    return json(
      { ok: false, message: "Methode niet toegestaan." },
      405,
      correlationId,
    );
  if (Number(request.headers.get("content-length") || 0) > 24000)
    return json(
      { ok: false, message: "Aanvraag is te groot." },
      413,
      correlationId,
    );
  let input;
  try {
    input = await request.json();
  } catch {
    return json(
      { ok: false, message: "Ongeldige aanvraag." },
      400,
      correlationId,
    );
  }
  if (clean(input.website, 10)) return json({ ok: true }, 200, correlationId);

  const name = clean(input.name, 100),
    company = clean(input.company, 120),
    email = clean(input.email, 160).toLowerCase(),
    phone = normalizePhone(input.phone);
  const intent = ["roi", "demo", "appointment", "order"].includes(input.intent)
    ? input.intent
    : "demo";
  if (!name || !company || !validEmail(email) || input.consent !== true)
    return json(
      {
        ok: false,
        message: "Controleer je naam, bedrijf, e-mailadres en toestemming.",
      },
      422,
      correlationId,
    );

  const attribution = {};
  [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
    "fbclid",
    "msclkid",
    "landing_page",
  ].forEach((key) => {
    const value = clean(input[key], 180);
    if (value) attribution[key] = value;
  });
  const product = clean(input.product, 80),
    niche = clean(input.niche, 80),
    campaign = clean(input.campaignName, 120);
  const context = {
    campaign,
    niche,
    product,
    intent,
    attribution,
    submittedAt: new Date().toISOString(),
  };
  const tags = [
    "Website lead",
    intent === "roi"
      ? "Intent ROI"
      : intent === "order"
        ? "Intent bestelling"
        : "Intent afspraak",
    ...(niche ? [`Niche ${niche}`] : []),
    ...(product ? [`Product ${product}`] : []),
  ];
  const fingerprint = digest(
    `${email}|${phone}|${intent}|${niche}|${product}|${Math.floor(Date.now() / 86400000)}`,
  );
  const requestedKey = clean(request.headers.get("idempotency-key"), 100);
  const idempotencyKey = digest(requestedKey || fingerprint);
  const store = getStore("autopilots-lead-guard");

  if (!(await enforceRateLimit(store, request)))
    return json(
      {
        ok: false,
        message: "Te veel aanvragen. Probeer het over enkele minuten opnieuw.",
      },
      429,
      correlationId,
    );
  const existing = await store
    .get(`submission/${idempotencyKey}`, { type: "json" })
    .catch(() => null);
  if (existing?.status === "complete" || existing?.status === "processing")
    return json({ ok: true, duplicate: true }, 200, correlationId);
  await store.setJSON(`submission/${idempotencyKey}`, {
    status: "processing",
    correlationId,
    fingerprint,
    context,
    emailHash: digest(email),
    createdAt: new Date().toISOString(),
  });

  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  const pipelineId = process.env.GHL_PIPELINE_ID;
  const pipelineStageId = process.env.GHL_PIPELINE_STAGE_ID;
  const customFieldKey = process.env.GHL_FUNNEL_CONTEXT_FIELD_KEY;
  if (process.env.GHL_TEST_MODE === "true") {
    await store.setJSON(`submission/${idempotencyKey}`, {
      status: "complete",
      correlationId,
      mode: "dry-run",
      context,
      completedAt: new Date().toISOString(),
    });
    return json({ ok: true, mode: "dry-run" }, 200, correlationId);
  }
  if (
    ![token, locationId, pipelineId, pipelineStageId, customFieldKey].every(
      Boolean,
    )
  ) {
    await store.setJSON(`submission/${idempotencyKey}`, {
      status: "blocked",
      correlationId,
      context,
    });
    return json(
      {
        ok: false,
        message:
          "De persoonlijke toegang is nog niet gekoppeld. Neem contact op met Autopilots.",
      },
      503,
      correlationId,
    );
  }

  try {
    const { firstName, lastName } = splitName(name);
    const contactPayload = {
      firstName,
      lastName,
      name,
      email,
      phone: phone || undefined,
      companyName: company,
      locationId,
      source: "Autopilots website",
      tags,
      customFields: [
        {
          key: customFieldKey,
          fieldValue: JSON.stringify(context).slice(0, 4000),
        },
      ],
    };
    const contactResponse = await fetch(`${api}/contacts/upsert`, {
      method: "POST",
      headers: ghlHeaders(token, "2021-04-15"),
      body: JSON.stringify(contactPayload),
      signal: AbortSignal.timeout(9000),
    });
    const contactBody = await parseJson(contactResponse);
    if (!contactResponse.ok)
      throw new Error(`contact:${contactResponse.status}`);
    const contactId = contactBody.contact?.id || contactBody.id;
    if (!contactId) throw new Error("contact:no-id");

    const params = new URLSearchParams({
      location_id: locationId,
      pipeline_id: pipelineId,
      contact_id: contactId,
      status: "open",
    });
    const search = await fetch(`${api}/opportunities/search?${params}`, {
      headers: ghlHeaders(token, "2021-07-28"),
      signal: AbortSignal.timeout(9000),
    });
    const searchBody = await parseJson(search);
    if (!search.ok) throw new Error(`opportunity-search:${search.status}`);
    const opportunity = searchBody.opportunities?.[0];
    const opportunityPayload = {
      pipelineId,
      pipelineStageId,
      locationId,
      contactId,
      status: "open",
      name: `${company} — ${product || intent}`,
      source: "Autopilots website",
    };
    const opportunityResponse = await fetch(
      opportunity
        ? `${api}/opportunities/${opportunity.id}`
        : `${api}/opportunities/`,
      {
        method: opportunity ? "PUT" : "POST",
        headers: ghlHeaders(token, "2021-07-28"),
        body: JSON.stringify(opportunityPayload),
        signal: AbortSignal.timeout(9000),
      },
    );
    if (!opportunityResponse.ok)
      throw new Error(`opportunity:${opportunityResponse.status}`);

    await store.setJSON(`submission/${idempotencyKey}`, {
      status: "complete",
      correlationId,
      context,
      contactId,
      opportunityId:
        opportunity?.id ||
        (await parseJson(opportunityResponse)).opportunity?.id,
      completedAt: new Date().toISOString(),
    });
    return json({ ok: true }, 200, correlationId);
  } catch (error) {
    await store.setJSON(`submission/${idempotencyKey}`, {
      status: "failed",
      correlationId,
      context,
      failure: clean(error?.message, 80),
      failedAt: new Date().toISOString(),
    });
    await notifyFailure(correlationId);
    return json(
      {
        ok: false,
        message:
          "De aanvraag is veilig opgeslagen, maar kon nog niet worden doorgezet. We pakken deze handmatig op.",
      },
      502,
      correlationId,
    );
  }
};

export const config = { path: "/api/funnel-lead", method: "POST" };
