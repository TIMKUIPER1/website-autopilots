const servicePages = {
  voice: {
    kicker: "Voice AI",
    icon: "VO",
    title: "Neemt telefoontjes op, kwalificeert en zet acties direct door.",
    intro: "Of het nu gaat om complexe klantvragen inbound of het proactief opvolgen van offertes outbound: Voice AI neemt op, vraagt door en verwerkt alles netjes.",
    points: ["24/7 telefonische opvang", "Outbound bellen", "Slimme triage", "Gespreksnotities in CRM"],
    visual: "voice",
    flow: [["Oproep komt binnen", "Voice AI neemt direct op."], ["AI vraagt door", "Reden, urgentie en gegevens worden helder."], ["Actie wordt gezet", "Afspraak, taak of CRM-update staat klaar."]],
    seo: "AI telefoon beantwoorden, Voice AI voor klantcontact, AI receptionist, AI outbound bellen"
  },
  chat: {
    kicker: "Chat AI",
    icon: "CH",
    title: "Beantwoordt websitechat en WhatsApp-vragen zonder wachttijd.",
    intro: "Of het nu een DM op Instagram is of een vraag op je website: Chat AI begrijpt de context, geeft direct antwoord en helpt klanten verder naar afspraak, offerte of ticket.",
    points: ["Websitebezoekers converteren", "WhatsApp & SMS", "Social DM opvolging", "Menselijke fallback"],
    visual: "chat",
    flow: [["Vraag komt binnen", "Website, WhatsApp of social DM."], ["AI helpt direct", "Antwoord, intake of kwalificatie."], ["Vervolg staat klaar", "Afspraak, offerte, ticket of overdracht."]],
    seo: "AI chatbot website, WhatsApp AI, Chat AI voor klantenservice, AI DM opvolging"
  },
  followup: {
    kicker: "Follow Up AI",
    icon: "FU",
    title: "Volgt leads, offertes en gemiste kansen automatisch op.",
    intro: "Automatische opvolging via WhatsApp, SMS, mail en telefonie. Niet schreeuwerig, wel precies op tijd en afgestemd op de fase van de klant.",
    points: ["WhatsApp opvolging", "SMS reminders", "Mail sequences", "Reply classificatie"],
    visual: "followup",
    flow: [["Kans blijft open", "Lead, offerte of gemist contact."], ["AI volgt op", "Via het juiste kanaal en moment."], ["Reactie wordt verwerkt", "Classificatie, taak of afspraak in CRM."]],
    seo: "AI lead opvolging, offerte opvolgen met AI, WhatsApp follow up AI, automatische sales opvolging"
  },
  planning: {
    kicker: "Planning AI",
    icon: "PL",
    title: "Plant afspraken op basis van beschikbaarheid, regio en route.",
    intro: "Van lead naar afspraak naar routeplanning. Planning AI houdt rekening met capaciteit, regio, prioriteit en klantcommunicatie.",
    points: ["Intelligente agendaregie", "Routeoptimalisatie", "Status updates", "Gaten vullen"],
    visual: "planning",
    flow: [["Aanvraag vraagt planning", "Klant wil afspraak, bezoek of service."], ["AI checkt capaciteit", "Regio, route, prioriteit en beschikbaarheid."], ["Moment wordt geboekt", "Agenda, klant en team krijgen update."]],
    seo: "AI planning, agenda automatiseren, routeplanning AI, afspraken automatisch plannen"
  },
  leadsmachine: {
    kicker: "Leadsmachine AI",
    icon: "LM",
    title: "Full-funnel machine van klik, intake en opvolging naar klant.",
    intro: "Van advertentie of websitebezoek naar gesprek, intake, afspraak en opvolging: de Leadsmachine houdt de hele route in beweging.",
    points: ["Lead intake", "Opvolging loopt door", "Afspraak gepland", "Data voor groei"],
    visual: "leadsmachine",
    flow: [["Klik of aanvraag", "Campagne, website of formulier."], ["Intake wordt gestart", "AI kwalificeert en stelt vervolgvragen."], ["Klantreis loopt door", "Afspraak, CRM en follow-up blijven actief."]],
    seo: "AI leadsmachine, lead intake automatiseren, AI sales funnel, meer klanten met AI"
  },
  crm: {
    kicker: "Autopilots CRM",
    icon: "CR",
    title: "Je volledige funnel en salesdata in een CRM.",
    intro: "Leads, opvolging, afspraken, funnels en klantdata komen samen in een AI-gestuurde CRM omgeving. Zo zie je waar kansen liggen en waar conversie blijft hangen.",
    points: ["Pipeline overzicht", "AI opvolging", "Afspraken sneller rond", "Reviews en automatisering"],
    visual: "crm",
    flow: [["Gesprek is afgerond", "AI heeft context en vervolgstap."], ["CRM wordt bijgewerkt", "Status, tags, notities en pipeline."], ["Team ziet kansen", "Opvolging, reviews en automatisering lopen door."]],
    seo: "AI CRM, CRM automatisering, sales pipeline AI, klantdata automatiseren"
  },
  support: {
    kicker: "Autopilots Support",
    icon: "SU",
    title: "Monitoring, optimalisatie en snelle hulp na livegang.",
    intro: "Na livegang blijven we gesprekken, flows en koppelingen monitoren zodat de AI beter blijft aansluiten op echte klantvragen.",
    points: ["Monitoring", "Optimalisatie", "Support", "Doorontwikkeling"],
    visual: "support",
    flow: [["AI staat live", "Echte gesprekken komen binnen."], ["We monitoren", "Antwoorden, routes en edge cases worden bekeken."], ["We verbeteren", "Prompts, flows en koppelingen worden aangescherpt."]],
    seo: "AI support, AI monitoring, chatbot optimalisatie, AI implementatie support"
  }
};

const key = document.body.dataset.service || "voice";
const service = servicePages[key] || servicePages.voice;

document.title = `${service.kicker} | Autopilots preview`;
document.querySelectorAll("[data-service-kicker]").forEach((el) => (el.textContent = service.kicker));
document.querySelectorAll("[data-service-icon]").forEach((el) => (el.textContent = service.icon));
document.querySelectorAll("[data-service-title]").forEach((el) => (el.textContent = service.title));
document.querySelectorAll("[data-service-intro]").forEach((el) => (el.textContent = service.intro));
document.querySelectorAll("[data-service-seo]").forEach((el) => (el.textContent = service.seo));

const list = document.querySelector("[data-service-points]");
if (list) list.innerHTML = service.points.map((point) => `<span>${point}</span>`).join("");

const flow = document.querySelector("[data-service-flow]");
if (flow) {
  flow.innerHTML = service.flow.map((item, index) => `
    <div class="ap-service-flow-step">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <div><strong>${item[0]}</strong><em>${item[1]}</em></div>
    </div>
  `).join("");
}

const visual = document.querySelector("[data-service-visual]");
if (visual) {
  visual.dataset.visual = service.visual;
  visual.innerHTML = `
    <div class="ap-service-detail-core"><span>${service.icon}</span><strong>${service.kicker}</strong></div>
    <div class="ap-service-detail-wave" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
    <div class="ap-service-detail-lines" aria-hidden="true"><span></span><span></span><span></span></div>
  `;
}
