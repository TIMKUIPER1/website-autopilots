const apProductIconMap = {
  inbox: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 9h20v14H6z"/><path d="m6 10 10 8 10-8"/><path d="M10 22v4h12v-4"/></svg>',
  leadopvolger: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8 10h9a7 7 0 1 1-6.4 9.8"/><path d="M8 10l4-4"/><path d="M8 10l4 4"/><path d="M19 13v5l4 2"/></svg>',
  telefoniste: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M10 7c1.2 8.6 6.4 13.8 15 15l2-4-5-3-3 2c-2.1-1.2-3.8-2.9-5-5l2-3-3-5-4 2Z"/><path d="M21 7c2.4.7 4.3 2.6 5 5"/><path d="M20 12c.9.3 1.7 1.1 2 2"/></svg>',
  crm: '<img src="ap-crm-logo.svg" alt="Autopilots CRM">',
  leadsmachine: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 7h22l-9 10v7l-4 2v-9L5 7Z"/><path d="M8 7c3.8 4.5 12.2 4.5 16 0"/><path d="M12 25h8"/></svg>',
};

const apProductNiches = [
  {
    slug: "autobedrijven",
    label: "autobedrijven",
    short: "Proefritten, voorraadvragen, inruil, werkplaats en CRM.",
    route: "proefritten, voorraadvragen, inruil en showroomleads",
    system: "voorraad, agenda, CRM en verkoopopvolging",
    metric: "proefritaanvragen",
    extra: "extra proefritten",
    margin: 750,
    volume: 80,
    minutes: 12,
    automation: 65,
  },
  {
    slug: "dakdekkers",
    label: "dakdekkers",
    short: "Spoedlekkage, offertes, routeplanning en duidelijke prioriteit.",
    route: "spoedvragen, lekkages, dakinspecties en offerteaanvragen",
    system: "agenda, routeplanning, foto's, CRM en werkbonnen",
    metric: "dakvragen",
    extra: "extra inspecties",
    margin: 540,
    volume: 95,
    minutes: 9,
    automation: 72,
  },
  {
    slug: "hoveniers",
    label: "hoveniers",
    short: "Aanvragen, onderhoud, seizoensdrukte, regio en routeplanning.",
    route: "tuinaanvragen, onderhoud, offertes en terugkerende afspraken",
    system: "regio, capaciteit, agenda, routeplanning en offerte-opvolging",
    metric: "tuinaanvragen",
    extra: "extra afspraken",
    margin: 420,
    volume: 70,
    minutes: 11,
    automation: 68,
  },
  {
    slug: "installatietechniek",
    label: "installatietechniek",
    short: "Storingen, werkbonnen, monteurs, urgentie en routeplanning.",
    route: "storingen, onderhoud, werkbonnen en monteursplanning",
    system: "werkbonnen, agenda, regio, urgentie en klantupdates",
    metric: "servicevragen",
    extra: "extra ingeplande klussen",
    margin: 480,
    volume: 110,
    minutes: 10,
    automation: 70,
  },
  {
    slug: "vastgoedbeheerders",
    label: "vastgoedbeheerders",
    short: "Huurdersmails, reparaties, urgentie, tickets en leveranciers.",
    route: "huurdersmails, reparatieverzoeken, urgenties en dossierstatus",
    system: "mailbox, ticketing, panddata, leveranciers en CRM",
    metric: "huurdersvragen",
    extra: "tickets sneller verwerkt",
    margin: 160,
    volume: 260,
    minutes: 7,
    automation: 74,
  },
  {
    slug: "kapperszaken",
    label: "kapperszaken",
    short: "Afspraken, behandelingen, stylist, prijzen en no-shows.",
    route: "knipafspraken, kleurbehandelingen, prijsupdates en WhatsApp-vragen",
    system: "agenda, behandelduur, stylist, salonregels en reminders",
    metric: "salonvragen",
    extra: "extra boekingen",
    margin: 65,
    volume: 120,
    minutes: 5,
    automation: 78,
  },
  {
    slug: "tandartsen",
    label: "tandartsen",
    short: "Pijnklachten, triage, agenda, intake en overdracht.",
    route: "pijnklachten, controles, behandelvragen en urgentie",
    system: "agenda, triageregels, patientcontext en teamoverdracht",
    metric: "patientvragen",
    extra: "extra afspraken",
    margin: 120,
    volume: 140,
    minutes: 6,
    automation: 64,
  },
  {
    slug: "makelaars",
    label: "makelaars",
    short: "Bezichtigingen, waardebepalingen, leads en terugbelverzoeken.",
    route: "bezichtigingen, waardebepalingen, woningvragen en leadopvolging",
    system: "agenda, objectdata, CRM, mailbox en verkoopopvolging",
    metric: "woningvragen",
    extra: "extra bezichtigingen",
    margin: 650,
    volume: 85,
    minutes: 10,
    automation: 62,
  },
  {
    slug: "cosmetische-klinieken",
    label: "cosmetische klinieken",
    short: "Consults, intake, nazorg, prijzen en behandelvragen.",
    route: "consultaanvragen, behandelvragen, nazorg en intake",
    system: "agenda, behandelregels, intakeformulier, CRM en follow-up",
    metric: "consultaanvragen",
    extra: "extra consults",
    margin: 280,
    volume: 90,
    minutes: 8,
    automation: 70,
  },
  {
    slug: "verzekeraars",
    label: "verzekeraars",
    short: "Claims, polisvragen, documentcheck en dossierstatus.",
    route: "claims, polisvragen, documentchecks en statusupdates",
    system: "mail, documenten, CRM, dossierstatus en compliance",
    metric: "dossiervragen",
    extra: "dossiers sneller verwerkt",
    margin: 180,
    volume: 240,
    minutes: 9,
    automation: 66,
  },
];

const apProducts = {
  inbox: {
    kicker: "AI Inboxmedewerker",
    nav: "AI Inboxmedewerker",
    title: 'Alle binnenkomende vragen op een plek, <span class="ap-title-accent">direct verwerkt.</span>',
    intro: "De AI Inboxmedewerker leest e-mail, WhatsApp, websitechat en DM's. Hij herkent intentie, stelt vervolgvragen, geeft antwoord en zet het gesprek door naar afspraak, ticket, offerte of mens.",
    promise: "Standaard product, per niche anders getraind.",
    icon: "inbox",
    cta: "Bekijk AI Inboxmedewerker",
    demoTitle: "Van losse inbox naar duidelijke actie.",
    demoIntro: "Kies een stap en zie hoe de AI Inboxmedewerker informatie omzet naar een bruikbare vervolgstap.",
    demoCore: "AI Inbox",
    demoSub: "van bericht naar actie",
    steps: [
      {
        label: "Signaal",
        title: "Nieuw bericht komt binnen",
        body: "Een klant stelt een vraag via mail, WhatsApp, chat of social DM.",
        output: "Het kanaal, de klant en het onderwerp worden direct herkend.",
      },
      {
        label: "Begrijpen",
        title: "Intentie en context worden gelezen",
        body: "De AI kijkt naar vraag, urgentie, klantstatus en ontbrekende informatie.",
        output: "Vraagtype, prioriteit en benodigde vervolgvraag staan klaar.",
      },
      {
        label: "Antwoorden",
        title: "De klant krijgt een passend antwoord",
        body: "Op basis van kennisbank, regels en tone of voice reageert de AI persoonlijk.",
        output: "Herhaalvragen worden afgehandeld zonder wachttijd.",
      },
      {
        label: "Actie",
        title: "Het gesprek eindigt in je systeem",
        body: "Afspraak, ticket, offerteaanvraag of overdracht wordt netjes vastgelegd.",
        output: "CRM, mailbox of ticketing is bijgewerkt met duidelijke context.",
      },
    ],
    scope: [
      ["Wel binnen dit product", "Inboxvragen, FAQ, intake, samenvattingen, ticketvoorbereiding en menselijke overdracht."],
      ["Niet als losse chatbot", "Geen losse widget zonder proces. De medewerker werkt met jullie kennis, systemen en afspraken."],
      ["Wanneer uitbreiden", "Telefonie, proactieve leadopvolging of volledige funnelsturing kan met andere Autopilots producten erbij."],
    ],
    calculator: {
      volumeLabel: "Binnenkomende berichten per maand",
      minutesLabel: "Minuten handwerk per bericht",
      automationLabel: "Berichten die AI kan verwerken",
      marginLabel: "Waarde per extra afspraak",
    },
  },
  leadopvolger: {
    kicker: "AI Leadopvolger",
    nav: "AI Leadopvolger",
    title: 'Leads, offertes en gemiste kansen blijven <span class="ap-title-accent">automatisch bewegen.</span>',
    intro: "De AI Leadopvolger pakt nieuwe leads, open offertes en stille gesprekken precies op tijd op via WhatsApp, SMS, mail of belactie. Niet schreeuwerig, wel consequent.",
    promise: "Opvolging met ritme, timing en context.",
    icon: "leadopvolger",
    cta: "Bekijk AI Leadopvolger",
    demoTitle: "Van interesse naar afspraak.",
    demoIntro: "Zie hoe opvolging doorloopt zonder dat je team handmatig achter iedere kans aan hoeft.",
    demoCore: "AI Follow-up",
    demoSub: "van lead naar afspraak",
    steps: [
      {
        label: "Lead",
        title: "Nieuwe kans komt binnen",
        body: "Een formulier, offerteaanvraag, belnotitie of oude lead staat klaar voor opvolging.",
        output: "De lead wordt gekoppeld aan bron, status en gewenste vervolgstap.",
      },
      {
        label: "Timing",
        title: "De juiste timing wordt gekozen",
        body: "De AI kiest kanaal, moment en bericht op basis van fase en urgentie.",
        output: "WhatsApp, SMS, mail of telefonische opvolging staat klaar.",
      },
      {
        label: "Reactie",
        title: "Reacties worden begrepen",
        body: "De AI classificeert interesse, bezwaar, afspraakintentie of afmelding.",
        output: "Je team ziet alleen wat echt menselijke aandacht nodig heeft.",
      },
      {
        label: "Afspraak",
        title: "De kans wordt omgezet naar actie",
        body: "Een afspraak wordt gepland, CRM bijgewerkt of de offerte blijft warm.",
        output: "Pipeline en agenda blijven actueel zonder losse reminders.",
      },
    ],
    scope: [
      ["Wel binnen dit product", "Leadopvolging, offerte-reminders, reactivatie, reply classificatie en CRM-taken."],
      ["Niet bedoeld als spam", "Geen massale generieke berichten. Het systeem volgt op met context, timing en duidelijke kaders."],
      ["Wanneer uitbreiden", "Combineer met Leadsmachine AI als je ook advertenties, landingspagina's en intake wilt standaardiseren."],
    ],
    calculator: {
      volumeLabel: "Leads of offertes per maand",
      minutesLabel: "Minuten opvolging per kans",
      automationLabel: "Kansen die AI kan opvolgen",
      marginLabel: "Marge per extra klant",
    },
  },
  telefoniste: {
    kicker: "AI Telefoniste",
    nav: "AI Telefoniste",
    title: 'Altijd opgenomen, goed uitgevraagd en <span class="ap-title-accent">netjes verwerkt.</span>',
    intro: "De AI Telefoniste neemt op, stelt vervolgvragen, bepaalt urgentie, plant waar mogelijk direct en legt het gesprek vast. Binnen of buiten kantooruren.",
    promise: "Telefonie die werkt alsof het bij je team hoort.",
    icon: "telefoniste",
    cta: "Bekijk AI Telefoniste",
    demoTitle: "Van oproep naar systeemactie.",
    demoIntro: "Klik door de route en zie wat er gebeurt zodra een klant belt.",
    demoCore: "AI Telefoon",
    demoSub: "van belletje naar context",
    steps: [
      {
        label: "Oproep",
        title: "Klant belt je bedrijf",
        body: "De AI neemt direct op met jullie begroeting, ook bij drukte of buiten openingstijden.",
        output: "Geen gemiste oproep zonder context.",
      },
      {
        label: "Intake",
        title: "De vraag wordt duidelijk",
        body: "Naam, reden, urgentie, locatie, voorkeur en ontbrekende gegevens worden uitgevraagd.",
        output: "Het team hoeft niet te raden wat er is bedoeld.",
      },
      {
        label: "Besluit",
        title: "De juiste route wordt gekozen",
        body: "Doorverbinden, afspraak plannen, ticket maken of terugbelverzoek klaarzetten.",
        output: "Spoed, sales en service komen niet op dezelfde stapel.",
      },
      {
        label: "CRM",
        title: "Alles wordt vastgelegd",
        body: "Samenvatting, actie, prioriteit en klantcontext komen terug in je systeem.",
        output: "Je team krijgt direct bruikbare overdracht.",
      },
    ],
    scope: [
      ["Wel binnen dit product", "Telefonische opvang, intake, triage, doorverbinden, afspraken plannen en gespreksnotities."],
      ["Niet als callcentertruc", "De telefoniste wordt ingericht op jullie taal, regels, prioriteiten en fallback naar mensen."],
      ["Wanneer uitbreiden", "Combineer met AI Inboxmedewerker voor mail, WhatsApp, chat en social DM naast telefonie."],
    ],
    calculator: {
      volumeLabel: "Telefoontjes per maand",
      minutesLabel: "Minuten per gesprek",
      automationLabel: "Gesprekken die AI kan verwerken",
      marginLabel: "Marge per extra afspraak",
    },
  },
  crm: {
    kicker: "Autopilots CRM",
    nav: "Autopilots CRM",
    title: 'Je volledige funnel en salesdata in <span class="ap-title-accent">een CRM.</span>',
    intro: "Autopilots CRM brengt leads, afspraken, follow-up, reviews, funnels en klantdata samen. Zo zie je waar kansen liggen en welke acties automatisch of menselijk opgevolgd moeten worden.",
    promise: "Het centrale systeem onder je AI medewerkers.",
    icon: "crm",
    cta: "Bekijk Autopilots CRM",
    demoTitle: "Van gesprek naar grip op je funnel.",
    demoIntro: "Zie hoe CRM het geheugen wordt van je klantcontact, sales en opvolging.",
    demoCore: "AP CRM",
    demoSub: "pipeline en acties",
    steps: [
      {
        label: "Contact",
        title: "Elk contactmoment wordt vastgelegd",
        body: "Leadbron, vraag, voorkeur, status en vervolgactie komen op een plek samen.",
        output: "Je ziet welke kansen nieuw, actief of stilgevallen zijn.",
      },
      {
        label: "Pipeline",
        title: "De fase is direct zichtbaar",
        body: "Nieuwe lead, afspraak, offerte, klant, review of heractivatie krijgt een duidelijke plek.",
        output: "Verkoop en operatie kijken naar dezelfde waarheid.",
      },
      {
        label: "Acties",
        title: "AI en team weten wat er moet gebeuren",
        body: "Taken, reminders, follow-up en automatische workflows worden gekoppeld aan status.",
        output: "Minder handmatig werk en minder kansen die blijven hangen.",
      },
      {
        label: "Inzicht",
        title: "Je ziet waar conversie lekt",
        body: "Dashboard, rapportage en data maken duidelijk waar groei of vertraging zit.",
        output: "Beslissingen worden gebaseerd op echte klantdata.",
      },
    ],
    scope: [
      ["Wel binnen dit product", "Pipeline, afspraken, follow-up, reviews, automatiseringen, klantdata en dashboards."],
      ["Niet zomaar een CRM", "Het CRM is gebouwd rondom AI-acties, klantcontact en conversie in plaats van alleen contactkaartjes."],
      ["Wanneer uitbreiden", "Combineer met Inbox, Telefoniste of Leadopvolger om data automatisch gevuld en opgevolgd te krijgen."],
    ],
    calculator: {
      volumeLabel: "Nieuwe leads per maand",
      minutesLabel: "Minuten CRM-handwerk per lead",
      automationLabel: "CRM-acties die AI kan verwerken",
      marginLabel: "Marge per gewonnen kans",
    },
  },
  leadsmachine: {
    kicker: "Leadsmachine AI",
    nav: "Leadsmachine AI",
    title: 'Van klik naar intake, afspraak en klant <span class="ap-title-accent">in een route.</span>',
    intro: "Leadsmachine AI verbindt advertenties, landingspagina's, formulieren, chat, telefonie, opvolging en CRM. Niet alleen leads genereren, maar zorgen dat ze worden opgevolgd.",
    promise: "Voor bedrijven die hun funnel willen standaardiseren.",
    icon: "leadsmachine",
    cta: "Bekijk Leadsmachine AI",
    demoTitle: "Van advertentie naar klant.",
    demoIntro: "Klik door de funnel en zie hoe iedere stap naar de volgende actie beweegt.",
    demoCore: "Leadsmachine",
    demoSub: "klik naar klant",
    steps: [
      {
        label: "Klik",
        title: "Nieuwe lead komt binnen",
        body: "Meta, Google, LinkedIn, website of outreach levert een nieuwe aanvraag op.",
        output: "Bron, campagne en intentie worden direct zichtbaar.",
      },
      {
        label: "Intake",
        title: "De lead wordt gekwalificeerd",
        body: "Budget, behoefte, timing, regio en fit worden uitgevraagd via de juiste route.",
        output: "Alleen passende kansen bewegen door naar afspraak of offerte.",
      },
      {
        label: "Opvolging",
        title: "De lead blijft in beweging",
        body: "WhatsApp, SMS, mail of telefonie volgt automatisch op tot er duidelijkheid is.",
        output: "Geen lead verdwijnt in een spreadsheet of inbox.",
      },
      {
        label: "Klant",
        title: "Afspraken en data landen in CRM",
        body: "De afspraak, status, context en vervolgstap worden vastgelegd.",
        output: "Je ziet campagnewaarde, conversie en omzetkansen.",
      },
    ],
    scope: [
      ["Wel binnen dit product", "Landingspagina, intake, follow-up, afspraakroute, CRM-data en campagne-inzicht."],
      ["Niet alleen advertenties", "Het product is pas waardevol als de opvolging, planning en CRM-acties net zo strak staan als de advertentie."],
      ["Wanneer uitbreiden", "Combineer met Telefoniste of Inbox als veel leads via bellen, WhatsApp of e-mail binnenkomen."],
    ],
    calculator: {
      volumeLabel: "Advertentieleads per maand",
      minutesLabel: "Minuten opvolging per lead",
      automationLabel: "Leads die AI kan opvolgen",
      marginLabel: "Marge per extra klant",
    },
  },
};

const productKey = document.body.dataset.product || "inbox";
const product = apProducts[productKey] || apProducts.inbox;

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const getNiche = (slug) => apProductNiches.find((item) => item.slug === slug) || apProductNiches[0];

const productUrl = {
  inbox: "product-ai-inboxmedewerker.html",
  leadopvolger: "product-ai-leadopvolger.html",
  telefoniste: "product-ai-telefoniste.html",
  crm: "product-autopilots-crm.html",
  leadsmachine: "product-leadsmachine-ai.html",
};

function productIcon(key) {
  const markup = apProductIconMap[key] || apProductIconMap.inbox;
  return `<span class="ap-product-icon ${key === "crm" ? "is-crm" : ""}">${markup}</span>`;
}

function renderShell() {
  document.title = `${product.nav} | Autopilots product`;
  const description = `${product.nav} van Autopilots: een gestandaardiseerd AI product dat per niche wordt ingericht op klantcontact, systemen en opvolging.`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", description);

  const productNav = Object.entries(apProducts)
    .map(([key, item]) => `<a class="${key === productKey ? "is-active" : ""}" href="${productUrl[key]}">${item.nav}</a>`)
    .join("");

  const nicheButtons = apProductNiches
    .map(
      (niche, index) =>
        `<button class="${index === 0 ? "is-active" : ""}" type="button" data-product-niche="${niche.slug}"><span>${String(index + 1).padStart(2, "0")}</span>${niche.label}</button>`
    )
    .join("");

  const demoSteps = product.steps
    .map(
      (step, index) => `
        <button class="ap-product-demo-step ${index === 0 ? "is-active" : ""}" type="button" data-product-step="${index}">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <strong>${step.label}</strong>
        </button>`
    )
    .join("");

  const productOptions = Object.entries(apProducts)
    .map(
      ([key, item]) => `
        <a class="ap-product-related ${key === productKey ? "is-active" : ""}" href="${productUrl[key]}">
          ${productIcon(item.icon)}
          <span>${item.nav}</span>
        </a>`
    )
    .join("");

  document.body.classList.add("ap-product-page", "ap-no-shared-autofill");
  document.body.innerHTML = `
    <header class="ap-header">
      <div class="ap-container ap-header-inner">
        <a class="ap-logo" href="preview-homepage.html?v=10">AUTOPILOTS</a>
        <nav class="ap-nav" aria-label="Hoofdnavigatie">
          <a class="is-active" href="services-preview.html">Diensten</a>
          <a href="preview-homepage.html?v=10#branches">Voor wie</a>
          <a href="process-preview.html">Proces</a>
          <a href="crew-preview.html">Crew</a>
          <a href="knowledge-preview.html">Kennisbank</a>
        </nav>
        <a class="ap-button ap-button-primary" href="afspraak-preview.html">Plan afspraak</a>
      </div>
    </header>
    <main>
      <section class="ap-section ap-product-hero">
        <div class="ap-container">
          <div class="ap-product-subnav" aria-label="Producten">${productNav}</div>
          <div class="ap-product-hero-grid">
            <div class="ap-product-copy">
              <div class="ap-kicker">${product.kicker}</div>
              <h1>${product.title}</h1>
              <p class="ap-lead">${product.intro}</p>
              <div class="ap-actions">
                <a class="ap-button ap-button-primary" href="#product-demo">Bekijk interactieve demo</a>
                <a class="ap-button ap-button-secondary" href="#niche-selector">Kies je niche</a>
              </div>
            </div>
            <aside class="ap-product-hero-card">
              <div class="ap-product-card-top">
                ${productIcon(product.icon)}
                <div>
                  <span>Productstatus</span>
                  <strong>${product.promise}</strong>
                </div>
              </div>
              <div class="ap-product-card-metrics">
                <span><strong>01</strong> Standaard product</span>
                <span><strong>02</strong> Niche route</span>
                <span><strong>03</strong> Demo + ROI</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section class="ap-section ap-product-selector-section" id="niche-selector">
        <div class="ap-container">
          <div class="ap-product-section-head">
            <div>
              <div class="ap-kicker">Kies je niche</div>
              <h2 class="ap-section-title">Het product blijft hetzelfde, maar de route wordt <span class="ap-title-accent">branchegericht.</span></h2>
              <p class="ap-lead">Een AI Telefoniste werkt anders bij een dakdekker dan bij een kapper. Daarom krijgt elk product een eigen niche-instelling: taal, regels, systemen, routes, acties en fallback.</p>
            </div>
          </div>
          <div class="ap-product-selector-grid">
            <div class="ap-product-niche-list" role="list">${nicheButtons}</div>
            <article class="ap-product-niche-card" data-product-niche-card></article>
          </div>
        </div>
      </section>

      <section class="ap-section" id="product-demo">
        <div class="ap-container">
          <div class="ap-product-section-head">
            <div>
              <div class="ap-kicker">${product.kicker}</div>
              <h2 class="ap-section-title">${product.demoTitle.replace("AI", '<span class="ap-title-accent">AI</span>')}</h2>
              <p class="ap-lead">${product.demoIntro}</p>
            </div>
          </div>
          <div class="ap-product-demo-grid">
            <div class="ap-product-demo-board">
              <div class="ap-product-demo-core">
                <strong>${product.demoCore}</strong>
                <span>${product.demoSub}</span>
              </div>
              <div class="ap-product-demo-steps">${demoSteps}</div>
            </div>
            <article class="ap-product-demo-detail" data-product-demo-detail></article>
          </div>
        </div>
      </section>

      <section class="ap-section">
        <div class="ap-container">
          <div class="ap-product-scope-grid">
            ${product.scope
              .map(
                (item, index) => `
                  <article class="ap-product-scope-card">
                    <span>${String(index + 1).padStart(2, "0")}</span>
                    <h3>${item[0]}</h3>
                    <p>${item[1]}</p>
                  </article>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="ap-section" id="product-roi">
        <div class="ap-container">
          <div class="ap-product-roi">
            <div>
              <div class="ap-kicker">ROI calculator</div>
              <h2 class="ap-section-title">Bereken de eerste businesscase <span class="ap-title-accent">per niche.</span></h2>
              <p class="ap-lead">De uitkomst is een indicatie. In een implementatiegesprek scherpen we aantallen, marge, capaciteit en route per niche aan.</p>
              <div class="ap-product-sliders">
                <label>
                  <span data-roi-volume-label>${product.calculator.volumeLabel}</span>
                  <strong data-roi-volume-value></strong>
                  <input type="range" min="20" max="320" step="5" data-roi-volume>
                </label>
                <label>
                  <span data-roi-minutes-label>${product.calculator.minutesLabel}</span>
                  <strong data-roi-minutes-value></strong>
                  <input type="range" min="3" max="25" step="1" data-roi-minutes>
                </label>
                <label>
                  <span data-roi-automation-label>${product.calculator.automationLabel}</span>
                  <strong data-roi-automation-value></strong>
                  <input type="range" min="30" max="90" step="5" data-roi-automation>
                </label>
                <label>
                  <span data-roi-margin-label>${product.calculator.marginLabel}</span>
                  <strong data-roi-margin-value></strong>
                  <input type="range" min="50" max="1500" step="10" data-roi-margin>
                </label>
              </div>
            </div>
            <aside class="ap-product-roi-output">
              <div><span>Automatisch verwerkt</span><strong data-roi-automated></strong><em>per maand</em></div>
              <div><span>Uren teruggewonnen</span><strong data-roi-hours></strong><em>voor team en operatie</em></div>
              <div><span>Extra kansen</span><strong data-roi-extra></strong><em data-roi-extra-label></em></div>
              <div class="is-dark"><span>Geschatte waarde</span><strong data-roi-value></strong><em>tijd + extra marge</em></div>
            </aside>
          </div>
        </div>
      </section>

      <section class="ap-section">
        <div class="ap-container">
          <div class="ap-product-related-grid">${productOptions}</div>
        </div>
      </section>

      <section class="ap-section">
        <div class="ap-container">
          <div class="ap-final-box ap-product-final">
            <div>
              <div class="ap-kicker">Volgende stap</div>
              <h2>Klaar om dit product in je eigen niche <span class="ap-title-accent">te bekijken?</span></h2>
              <p class="ap-lead" data-product-final-text></p>
            </div>
            <div class="ap-actions">
              <a class="ap-button ap-button-primary" href="afspraak-preview.html">Plan productadvies</a>
              <a class="ap-button ap-button-secondary" data-product-branch-link href="#">Meer informatie over AI medewerker</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  `;
}

function renderStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .ap-product-page .ap-section{padding:74px 0}
    .ap-product-page h1{max-width:930px;font-size:clamp(34px,calc(5vw - 12px),54px);line-height:1.07;font-weight:900}
    .ap-product-page h2,.ap-product-page .ap-section-title{font-size:clamp(28px,calc(4.5vw - 6px),52px);line-height:1.07;font-weight:900}
    .ap-product-subnav{display:flex;gap:8px;overflow:auto;margin-bottom:42px;padding:7px;border:1px solid var(--ap-line);border-radius:999px;background:rgba(255,255,255,.74)}
    .ap-product-subnav a{white-space:nowrap;border-radius:999px;padding:12px 16px;color:var(--ap-muted);font-size:13px;font-weight:900}
    .ap-product-subnav a.is-active,.ap-product-subnav a:hover{background:#fff;color:#111;box-shadow:0 10px 28px rgba(17,17,17,.06)}
    .ap-product-hero{padding-top:68px}
    .ap-product-hero-grid{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:28px;align-items:stretch}
    .ap-product-copy .ap-lead{max-width:790px}
    .ap-product-hero-card{position:relative;overflow:hidden;border:1px solid rgba(159,56,38,.22);border-radius:34px;background:#fff;padding:30px;box-shadow:0 20px 60px rgba(17,17,17,.07)}
    .ap-product-hero-card:after,.ap-product-scope-card:after,.ap-product-related:after{content:"";position:absolute;right:-64px;bottom:-72px;width:170px;height:170px;border-radius:50%;background:rgba(159,56,38,.12)}
    .ap-product-card-top{position:relative;z-index:1;display:flex;gap:16px;align-items:center}
    .ap-product-card-top span{display:block;color:var(--ap-brown);font-family:"Syne","Public Sans",Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:1.7px;text-transform:uppercase}
    .ap-product-card-top strong{display:block;margin-top:6px;font-size:22px;line-height:1.12;font-weight:900}
    .ap-product-icon{position:relative;display:grid;width:72px;height:72px;flex:0 0 72px;place-items:center;border:1px solid rgba(159,56,38,.25);border-radius:22px;background:#fff;color:var(--ap-brown);box-shadow:0 18px 40px rgba(159,56,38,.1)}
    .ap-product-icon:after{content:"";position:absolute;right:9px;top:9px;width:9px;height:9px;border-radius:50%;background:var(--ap-brown);box-shadow:0 0 0 0 rgba(159,56,38,.35);animation:apProductPulse 2.2s ease-out infinite}
    .ap-product-icon svg{width:32px;height:32px;stroke:currentColor;stroke-width:2.2;fill:none;stroke-linecap:round;stroke-linejoin:round}
    .ap-product-icon img{width:42px;height:42px;object-fit:contain}
    .ap-product-card-metrics{position:relative;z-index:1;display:grid;gap:10px;margin-top:34px}
    .ap-product-card-metrics span{display:flex;gap:10px;align-items:center;border:1px solid var(--ap-line);border-radius:999px;background:var(--ap-soft-2);padding:11px 14px;color:var(--ap-muted);font-weight:800}
    .ap-product-card-metrics strong{font-family:"Syne","Public Sans",Arial,sans-serif;color:var(--ap-brown)}
    .ap-product-section-head{display:grid;grid-template-columns:minmax(0,1fr);gap:20px;margin-bottom:30px}
    .ap-product-selector-grid{display:grid;grid-template-columns:330px minmax(0,1fr);gap:18px;align-items:stretch}
    .ap-product-niche-list{display:grid;max-height:620px;gap:9px;overflow:auto;border:1px solid var(--ap-line);border-radius:28px;background:#fff;padding:12px}
    .ap-product-niche-list button{display:flex;gap:12px;align-items:center;border:1px solid transparent;border-radius:18px;background:transparent;padding:13px 14px;color:var(--ap-muted);font:900 15px/1.15 "Public Sans",Arial,sans-serif;text-align:left;text-transform:capitalize;cursor:pointer}
    .ap-product-niche-list button span{font-family:"Syne","Public Sans",Arial,sans-serif;color:var(--ap-brown);font-size:12px;letter-spacing:1px}
    .ap-product-niche-list button.is-active,.ap-product-niche-list button:hover{border-color:rgba(159,56,38,.24);background:#fff7f4;color:#111}
    .ap-product-niche-card{position:relative;overflow:hidden;border:1px solid rgba(159,56,38,.22);border-radius:34px;background:#111;color:#fff;padding:36px;min-height:420px;box-shadow:0 22px 70px rgba(17,17,17,.09)}
    .ap-product-niche-card:before{content:"";position:absolute;right:-120px;bottom:-150px;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(159,56,38,.55),rgba(159,56,38,0) 68%)}
    .ap-product-niche-card>*{position:relative;z-index:1}
    .ap-product-niche-card .ap-kicker{color:#e7a295}
    .ap-product-niche-card h3{max-width:720px;font-size:clamp(32px,4vw,54px);line-height:1.05;font-weight:900}
    .ap-product-niche-card p{max-width:700px;margin-top:18px;color:rgba(255,255,255,.72);font-size:18px;line-height:1.55;font-weight:650}
    .ap-product-niche-pills{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:30px}
    .ap-product-niche-pills span{border:1px solid rgba(255,255,255,.16);border-radius:20px;background:rgba(255,255,255,.07);padding:16px;color:#fff;font-weight:850}
    .ap-product-niche-card .ap-actions{margin-top:30px}
    .ap-product-demo-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(330px,.9fr);gap:18px;align-items:stretch}
    .ap-product-demo-board{position:relative;overflow:hidden;min-height:560px;border-radius:34px;background:#111;color:#fff;padding:28px;box-shadow:0 24px 70px rgba(17,17,17,.12)}
    .ap-product-demo-board:before{content:"";position:absolute;inset:18%;border:1px solid rgba(255,255,255,.12);border-radius:50%;box-shadow:0 0 0 68px rgba(159,56,38,.08),0 0 0 150px rgba(255,255,255,.04)}
    .ap-product-demo-core{position:absolute;left:50%;top:50%;display:grid;width:210px;height:210px;place-items:center;translate:-50% -50%;border:1px solid rgba(255,255,255,.18);border-radius:50%;background:radial-gradient(circle,rgba(159,56,38,.7),rgba(17,17,17,.96) 68%);text-align:center}
    .ap-product-demo-core strong{font-size:28px;line-height:1.05;font-weight:900}
    .ap-product-demo-core span{max-width:130px;margin-top:-60px;color:rgba(255,255,255,.74);font-weight:800}
    .ap-product-demo-steps{position:relative;z-index:1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;height:100%;align-content:space-between}
    .ap-product-demo-step{min-height:190px;border:1px solid rgba(255,255,255,.14);border-radius:24px;background:rgba(255,255,255,.07);color:#fff;padding:20px;text-align:left;cursor:pointer;transition:transform .2s ease,border-color .2s ease,background .2s ease}
    .ap-product-demo-step:nth-child(n+5){align-self:end}
    .ap-product-demo-step:hover,.ap-product-demo-step.is-active{transform:translateY(-4px);border-color:rgba(226,144,130,.7);background:rgba(159,56,38,.28)}
    .ap-product-demo-step span{display:grid;width:52px;height:52px;place-items:center;border-radius:16px;background:#fff;color:var(--ap-brown);font-family:"Syne","Public Sans",Arial,sans-serif;font-weight:900}
    .ap-product-demo-step strong{display:block;margin-top:32px;font-size:24px;line-height:1.08;font-weight:900}
    .ap-product-demo-detail{display:flex;min-height:560px;flex-direction:column;justify-content:center;border:1px solid rgba(159,56,38,.2);border-radius:34px;background:#fff;padding:42px;box-shadow:0 20px 60px rgba(17,17,17,.06)}
    .ap-product-demo-detail.is-switching{animation:apProductSwitch .22s ease}
    .ap-product-demo-detail .ap-kicker{margin-bottom:22px}
    .ap-product-demo-detail h3{font-size:clamp(36px,5vw,58px);line-height:1.02;font-weight:900}
    .ap-product-demo-detail p{margin-top:20px;color:var(--ap-muted);font-size:19px;line-height:1.55;font-weight:650}
    .ap-product-output-box{margin-top:34px;border:1px solid rgba(159,56,38,.22);border-radius:24px;background:#fff8f5;padding:24px}
    .ap-product-output-box span{display:block;color:var(--ap-brown);font-family:"Syne","Public Sans",Arial,sans-serif;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase}
    .ap-product-output-box strong{display:block;margin-top:10px;font-size:24px;line-height:1.18;font-weight:900}
    .ap-product-scope-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
    .ap-product-scope-card,.ap-product-related{position:relative;overflow:hidden;border:1px solid var(--ap-line);border-radius:28px;background:#fff;padding:28px;box-shadow:0 18px 52px rgba(17,17,17,.06)}
    .ap-product-scope-card span{color:var(--ap-brown);font-family:"Syne","Public Sans",Arial,sans-serif;font-weight:900;letter-spacing:2px}
    .ap-product-scope-card h3{position:relative;z-index:1;margin-top:28px;font-size:28px;line-height:1.08;font-weight:900}
    .ap-product-scope-card p{position:relative;z-index:1;margin-top:14px;color:var(--ap-muted);font-size:16px;line-height:1.58;font-weight:620}
    .ap-product-roi{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:18px;border:1px solid var(--ap-line);border-radius:34px;background:#fff;padding:34px;box-shadow:0 22px 70px rgba(17,17,17,.07)}
    .ap-product-sliders{display:grid;gap:22px;margin-top:30px}
    .ap-product-sliders label{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;color:var(--ap-muted);font-weight:900}
    .ap-product-sliders label span{font-size:15px}
    .ap-product-sliders label strong{font-family:"Syne","Public Sans",Arial,sans-serif;color:#111;font-size:28px}
    .ap-product-sliders input{grid-column:1/-1;width:100%;accent-color:var(--ap-brown)}
    .ap-product-roi-output{display:grid;gap:10px}
    .ap-product-roi-output div{border:1px solid var(--ap-line);border-radius:22px;background:var(--ap-soft-2);padding:20px}
    .ap-product-roi-output div.is-dark{background:#111;color:#fff}
    .ap-product-roi-output span{display:block;color:var(--ap-brown);font-family:"Syne","Public Sans",Arial,sans-serif;font-size:12px;font-weight:900;letter-spacing:1.8px;text-transform:uppercase}
    .ap-product-roi-output strong{display:block;margin-top:12px;font-family:"Syne","Public Sans",Arial,sans-serif;font-size:42px;line-height:.95;font-weight:900}
    .ap-product-roi-output em{display:block;margin-top:8px;color:var(--ap-muted);font-style:normal;font-weight:800}
    .ap-product-roi-output div.is-dark em{color:rgba(255,255,255,.68)}
    .ap-product-related-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}
    .ap-product-related{display:flex;min-height:166px;flex-direction:column;gap:18px;align-items:flex-start;color:#111;font-weight:900}
    .ap-product-related .ap-product-icon{width:56px;height:56px;border-radius:18px}
    .ap-product-related .ap-product-icon svg{width:26px;height:26px}
    .ap-product-related.is-active{border-color:rgba(159,56,38,.35);background:#fff7f4}
    .ap-product-final{align-items:center}
    .ap-product-final h2{font-size:clamp(30px,4vw,52px);line-height:1.07;font-weight:900}
    .ap-product-final .ap-actions{justify-content:flex-end;margin-top:0}
    @keyframes apProductPulse{70%{box-shadow:0 0 0 14px rgba(159,56,38,0)}}
    @keyframes apProductSwitch{from{opacity:.72;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @media(max-width:980px){
      .ap-product-hero-grid,.ap-product-selector-grid,.ap-product-demo-grid,.ap-product-roi,.ap-product-final{grid-template-columns:1fr}
      .ap-product-niche-list{max-height:none;grid-template-columns:repeat(2,minmax(0,1fr))}
      .ap-product-related-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      .ap-product-demo-board,.ap-product-demo-detail{min-height:auto}
      .ap-product-demo-board{padding:22px}
      .ap-product-demo-core{position:relative;left:auto;top:auto;margin:0 auto 22px;translate:0 0;width:180px;height:180px}
      .ap-product-demo-core span{margin-top:-48px}
      .ap-product-demo-steps{grid-template-columns:repeat(2,minmax(0,1fr));height:auto}
      .ap-product-demo-step{min-height:160px}
    }
    @media(max-width:640px){
      .ap-product-page .ap-section{padding:56px 0}
      .ap-product-subnav{border-radius:24px}
      .ap-product-hero-card,.ap-product-niche-card,.ap-product-demo-board,.ap-product-demo-detail,.ap-product-roi{border-radius:26px;padding:24px}
      .ap-product-niche-list,.ap-product-niche-pills,.ap-product-scope-grid,.ap-product-related-grid{grid-template-columns:1fr}
      .ap-product-niche-card h3{font-size:34px}
      .ap-product-demo-steps{grid-template-columns:1fr}
      .ap-product-demo-step{min-height:118px}
      .ap-product-demo-step strong{margin-top:18px}
      .ap-product-roi-output strong{font-size:36px}
      .ap-product-final .ap-actions{justify-content:stretch}
    }
  `;
  document.head.appendChild(style);
}

let currentNiche = getNiche(new URLSearchParams(window.location.search).get("branche") || "autobedrijven");

function renderNiche() {
  const card = document.querySelector("[data-product-niche-card]");
  if (!card) return;
  document.querySelectorAll("[data-product-niche]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.productNiche === currentNiche.slug);
  });
  card.innerHTML = `
    <div class="ap-kicker">${product.nav} voor ${escapeHtml(currentNiche.label)}</div>
    <h3>In deze niche draait het om ${escapeHtml(currentNiche.route)}.</h3>
    <p>${product.nav} wordt ingericht op ${escapeHtml(currentNiche.system)}. De basis is gestandaardiseerd, maar scripts, velden, urgentie, agenda en fallback sluiten aan op hoe ${escapeHtml(currentNiche.label)} echt werken.</p>
    <div class="ap-product-niche-pills">
      <span>${escapeHtml(currentNiche.short)}</span>
      <span>${escapeHtml(product.promise)}</span>
      <span>Doorlink naar de volledige nichepagina.</span>
    </div>
    <div class="ap-actions">
      <a class="ap-button ap-button-primary" href="branch-preview.html?branche=${currentNiche.slug}">Meer informatie over AI medewerker voor ${escapeHtml(currentNiche.label)}</a>
      <a class="ap-button ap-button-secondary" href="#product-demo">Bekijk demo</a>
    </div>
  `;

  document.querySelector("[data-product-final-text]").textContent =
    `Bekijk hoe ${product.nav} specifiek werkt voor ${currentNiche.label}: van ${currentNiche.route} naar ${currentNiche.system}.`;
  const branchLink = document.querySelector("[data-product-branch-link]");
  if (branchLink) {
    branchLink.href = `branch-preview.html?branche=${currentNiche.slug}`;
    branchLink.textContent = `Meer informatie over AI medewerker voor ${currentNiche.label}`;
  }
  setRoiDefaults(currentNiche);
}

function renderDemoStep(index = 0) {
  const step = product.steps[index] || product.steps[0];
  document.querySelectorAll("[data-product-step]").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.productStep) === index);
  });
  const detail = document.querySelector("[data-product-demo-detail]");
  if (!detail) return;
  detail.classList.remove("is-switching");
  void detail.offsetWidth;
  detail.classList.add("is-switching");
  detail.innerHTML = `
    <div class="ap-kicker">Stap ${String(index + 1).padStart(2, "0")}</div>
    <h3>${escapeHtml(step.title)}</h3>
    <p>${escapeHtml(step.body)}</p>
    <div class="ap-product-output-box">
      <span>Output in systeem</span>
      <strong>${escapeHtml(step.output)}</strong>
    </div>
  `;
}

function formatEuro(value) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function setRoiDefaults(niche) {
  const volume = document.querySelector("[data-roi-volume]");
  const minutes = document.querySelector("[data-roi-minutes]");
  const automation = document.querySelector("[data-roi-automation]");
  const margin = document.querySelector("[data-roi-margin]");
  if (!volume || !minutes || !automation || !margin) return;
  volume.value = niche.volume;
  minutes.value = niche.minutes;
  automation.value = niche.automation;
  margin.value = niche.margin;
  document.querySelector("[data-roi-volume-label]").textContent = product.calculator.volumeLabel.replace("Binnenkomende", currentNiche.metric.charAt(0).toUpperCase() + currentNiche.metric.slice(1));
  updateRoi();
}

function updateRoi() {
  const volume = Number(document.querySelector("[data-roi-volume]")?.value || 0);
  const minutes = Number(document.querySelector("[data-roi-minutes]")?.value || 0);
  const automation = Number(document.querySelector("[data-roi-automation]")?.value || 0);
  const margin = Number(document.querySelector("[data-roi-margin]")?.value || 0);
  const automated = Math.round((volume * automation) / 100);
  const hours = Math.round((automated * minutes) / 6) / 10;
  const timeValue = Math.round(hours * 55);
  const extra = Math.max(1, Math.round(automated * 0.055));
  const marginValue = extra * margin;
  const total = timeValue + marginValue;

  document.querySelector("[data-roi-volume-value]").textContent = volume;
  document.querySelector("[data-roi-minutes-value]").textContent = minutes;
  document.querySelector("[data-roi-automation-value]").textContent = `${automation}%`;
  document.querySelector("[data-roi-margin-value]").textContent = formatEuro(margin);
  document.querySelector("[data-roi-automated]").textContent = automated;
  document.querySelector("[data-roi-hours]").textContent = hours.toLocaleString("nl-NL");
  document.querySelector("[data-roi-extra]").textContent = extra;
  document.querySelector("[data-roi-extra-label]").textContent = currentNiche.extra;
  document.querySelector("[data-roi-value]").textContent = formatEuro(total);
}

renderShell();
renderStyles();
renderNiche();
renderDemoStep(0);

document.querySelectorAll("[data-product-niche]").forEach((button) => {
  button.addEventListener("click", () => {
    currentNiche = getNiche(button.dataset.productNiche);
    renderNiche();
  });
});

document.querySelectorAll("[data-product-step]").forEach((button) => {
  button.addEventListener("click", () => renderDemoStep(Number(button.dataset.productStep)));
});

document.querySelectorAll("[data-roi-volume],[data-roi-minutes],[data-roi-automation],[data-roi-margin]").forEach((input) => {
  input.addEventListener("input", updateRoi);
});
