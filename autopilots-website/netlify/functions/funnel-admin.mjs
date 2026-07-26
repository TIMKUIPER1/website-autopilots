import { listJSON } from "./_shared/funnel-store.mjs";

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const unauthorized = () =>
  new Response("Inloggen vereist.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Autopilots Funnel"',
      "Cache-Control": "no-store",
    },
  });

const isAuthorized = (request) => {
  const expectedUser = process.env.FUNNEL_ADMIN_USER;
  const expectedPassword = process.env.FUNNEL_ADMIN_PASSWORD;
  const authorization = request.headers.get("authorization") || "";
  if (!expectedUser || !expectedPassword || !authorization.startsWith("Basic "))
    return false;
  try {
    const [user, password] = atob(authorization.slice(6)).split(":");
    return user === expectedUser && password === expectedPassword;
  } catch {
    return false;
  }
};

const formatDate = (value) => {
  try {
    return new Intl.DateTimeFormat("nl-NL", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Amsterdam",
    }).format(new Date(value));
  } catch {
    return "—";
  }
};

const eventLabels = {
  page_view: "Landingspagina bekeken",
  funnel_started: "Funnel gestart",
  funnel_question_answered: "Vraag beantwoord",
  funnel_diagnosis_completed: "Diagnose afgerond",
  lead_form_submitted: "Formulier verstuurd",
  lead_form_succeeded: "Lead opgeslagen",
  lead_form_failed: "Verwerking mislukt",
  demo_page_view: "Demo bekeken",
  demo_role_selected: "AI-rol gekozen",
  demo_widget_opened: "Live agent geopend",
  roi_started: "Calculator gestart",
  roi_completed: "Berekening afgerond",
  booking_clicked: "Afspraak geklikt",
};

const questionLabels = {
  volume: "Hoeveel klantvragen komen er ongeveer per maand binnen?",
  channel: "Waar komen de meeste vragen binnen?",
  missed: "Hoeveel contacten worden nu te laat of niet opgevolgd?",
  responseTime: "Hoe snel krijgt een nieuwe vraag gemiddeld antwoord?",
  goal: "Waar moet een AI-medewerker vooral ruimte maken?",
};

const renderAnswers = (answers = {}) => {
  const rows = Object.entries(answers)
    .map(([key, answer], index) => {
      const question = answer?.question || questionLabels[key] || key;
      const selected = answer?.label || answer?.value || "Geen antwoord";
      return `<li><b>${String(index + 1).padStart(2, "0")}</b><div><span>${escapeHtml(question)}</span><strong>${escapeHtml(selected)}</strong></div></li>`;
    })
    .join("");
  return rows
    ? `<ol class="answers">${rows}</ol>`
    : `<span class="muted">Geen antwoorden opgeslagen</span>`;
};

export default async (request) => {
  if (!isAuthorized(request)) return unauthorized();

  const [leads, events] = await Promise.all([
    listJSON("leads/", 500),
    listJSON("events/", 1500),
  ]);
  const eventCountBySession = new Map();
  const latestEventBySession = new Map();
  for (const event of events) {
    eventCountBySession.set(
      event.sessionId,
      (eventCountBySession.get(event.sessionId) || 0) + 1,
    );
    if (!latestEventBySession.has(event.sessionId))
      latestEventBySession.set(event.sessionId, event);
  }
  const uniqueSessions = new Set(events.map((event) => event.sessionId)).size;
  const demoSessions = new Set(
    events
      .filter((event) =>
        ["demo_page_view", "demo_role_selected", "demo_widget_opened"].includes(
          event.event,
        ),
      )
      .map((event) => event.sessionId),
  ).size;
  const successfulLeads = leads.filter(
    (lead) => lead.crmStatus === "synced",
  ).length;
  const failedLeads = leads.filter(
    (lead) => lead.crmStatus === "failed",
  ).length;

  const leadRows =
    leads
      .map((lead) => {
        const lastEvent = latestEventBySession.get(lead.sessionId);
        return `<tr>
          <td><strong>${escapeHtml(lead.name)}</strong><span>${escapeHtml(lead.company)}</span></td>
          <td><a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a><span>${escapeHtml(lead.phone || "Geen telefoonnummer")}</span></td>
          <td><span class="status ${lead.crmStatus === "synced" ? "ok" : lead.crmStatus === "failed" ? "bad" : "wait"}">${lead.crmStatus === "synced" ? "In GHL" : lead.crmStatus === "failed" ? "GHL mislukt" : "Wordt verwerkt"}</span><span>${escapeHtml(lead.crmMessage || "")}</span></td>
          <td><strong>${eventCountBySession.get(lead.sessionId) || 0} acties</strong><span>${escapeHtml(eventLabels[lastEvent?.event] || lastEvent?.event || "Geen klikdata")}</span></td>
          <td>${renderAnswers(lead.funnelAnswers)}</td>
          <td>${formatDate(lead.submittedAt)}</td>
        </tr>`;
      })
      .join("") ||
    `<tr><td colspan="6" class="empty">Nog geen opgeslagen formulierinzendingen.</td></tr>`;

  const eventRows =
    events
      .slice(0, 250)
      .map(
        (event) => `<tr>
          <td><strong>${escapeHtml(eventLabels[event.event] || event.event)}</strong><span>${escapeHtml(event.properties?.questionLabel || event.properties?.question || event.properties?.role || "")}</span>${event.properties?.answerLabel ? `<em>${escapeHtml(event.properties.answerLabel)}</em>` : ""}</td>
          <td><code>${escapeHtml(event.sessionId?.slice(0, 12))}</code></td>
          <td>${escapeHtml(event.page || "—")}</td>
          <td>${formatDate(event.occurredAt)}</td>
        </tr>`,
      )
      .join("") ||
    `<tr><td colspan="4" class="empty">Nog geen klikactiviteit geregistreerd.</td></tr>`;

  const html = `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive"><title>Funneloverzicht | Autopilots</title>
  <style>
  @import url("https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800;900&family=Syne:wght@600;700&display=swap");
  :root{--bg:#f5f5f2;--card:#fff;--text:#111;--muted:#656565;--line:rgba(0,0,0,.1);--brown:#9f3826}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:"Public Sans",sans-serif}.shell{max-width:1280px;margin:auto;padding:30px 20px 80px}
  header{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:10px 0 34px}.brand{font-family:"Syne",sans-serif;letter-spacing:3px}.privacy{color:var(--muted);font-size:13px}
  h1{max-width:760px;margin:14px 0 10px;font-size:clamp(34px,5vw,54px);line-height:1.07;letter-spacing:-.045em}.eyebrow{color:var(--brown);font:700 12px "Syne",sans-serif;letter-spacing:1.5px;text-transform:uppercase}
  .intro{color:var(--muted);font-size:16px}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:34px 0}.metric{border:1px solid var(--line);border-radius:26px;background:var(--card);padding:24px;box-shadow:0 15px 45px rgba(0,0,0,.04)}.metric span{color:var(--muted);font-size:13px}.metric strong{display:block;margin-top:12px;font:700 32px "Syne",sans-serif}
  section{margin-top:40px}.section-head{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:16px}.section-head h2{margin:0;font-size:28px}.section-head span{color:var(--muted);font-size:13px}
  .table-wrap{overflow:auto;border:1px solid var(--line);border-radius:28px;background:#fff;box-shadow:0 18px 50px rgba(0,0,0,.04)}table{width:100%;border-collapse:collapse;min-width:1120px}th,td{padding:18px 20px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top;font-size:13px}th{background:#f8f8f5;color:#777;font:700 11px "Syne",sans-serif;letter-spacing:.7px;text-transform:uppercase}td strong,td span{display:block}td span{margin-top:5px;color:var(--muted);line-height:1.45}td em{display:inline-block;margin-top:7px;border-radius:999px;background:#f3e4e0;padding:6px 9px;color:var(--brown);font-style:normal;font-weight:800}a{color:var(--brown)}code{font-family:"Syne",sans-serif}.status{display:inline-block;margin:0;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:800}.status.ok{background:#dce9dd;color:#285d32}.status.bad{background:#f7ddd8;color:#8c2b1c}.status.wait{background:#eee;color:#555}.empty{padding:45px;text-align:center;color:var(--muted)}.answers{display:grid;gap:10px;min-width:330px;margin:0;padding:0;list-style:none}.answers li{display:grid;grid-template-columns:28px 1fr;gap:10px}.answers li>b{display:grid;width:28px;height:28px;place-items:center;border-radius:9px;background:#111;color:#fff;font:700 9px "Syne",sans-serif}.answers span{margin:0;color:#777;font-size:11px}.answers strong{margin-top:3px;color:#111;font-size:12px}.muted{color:var(--muted)}
  @media(max-width:800px){.metrics{grid-template-columns:repeat(2,1fr)}header{align-items:flex-start;flex-direction:column}.section-head{align-items:flex-start;flex-direction:column}}@media(max-width:480px){.metrics{grid-template-columns:1fr}.shell{padding-inline:14px}}
  </style></head><body><main class="shell"><header><span class="brand">AUTOPILOTS</span><span class="privacy">Afgeschermd · persoonsgegevens niet delen</span></header>
  <p class="eyebrow">Funnel backend</p><h1>Van eerste klik tot opgeslagen lead.</h1><p class="intro">Live overzicht van de autobedrijven-funnel. Tijden worden in Nederland weergegeven.</p>
  <div class="metrics"><article class="metric"><span>Opgeslagen leads</span><strong>${leads.length}</strong></article><article class="metric"><span>Succesvol naar GHL</span><strong>${successfulLeads}</strong></article><article class="metric"><span>Unieke funnelsessies</span><strong>${uniqueSessions}</strong></article><article class="metric"><span>Demo bekeken</span><strong>${demoSessions}</strong></article></div>
  ${failedLeads ? `<p class="status bad">${failedLeads} lead(s) konden niet naar GHL, maar zijn wel veilig opgeslagen.</p>` : ""}
  <section><div class="section-head"><h2>Achtergelaten gegevens</h2><span>Eigen opslag + GHL-status</span></div><div class="table-wrap"><table><thead><tr><th>Contact</th><th>Gegevens</th><th>CRM</th><th>Funnelroute</th><th>Antwoorden</th><th>Datum</th></tr></thead><tbody>${leadRows}</tbody></table></div></section>
  <section><div class="section-head"><h2>Laatste funnelactiviteit</h2><span>Maximaal 250 recente acties</span></div><div class="table-wrap"><table><thead><tr><th>Actie</th><th>Sessie</th><th>Pagina</th><th>Datum</th></tr></thead><tbody>${eventRows}</tbody></table></div></section>
  </main></body></html>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, private",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "X-Frame-Options": "DENY",
      "Content-Security-Policy":
        "default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    },
  });
};

export const config = { path: "/backend/funnel-autobedrijven/" };
