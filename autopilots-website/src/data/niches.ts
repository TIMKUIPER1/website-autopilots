import type { ProductSlug } from "./products";

export interface Niche {
  slug: string;
  name: string;
  singular: string;
  hero: string;
  accent: string;
  lead: string;
  painPoints: Array<{ title: string; text: string }>;
  workflow: Array<{ title: string; text: string }>;
  intake: string[];
  systems: string[];
  primaryProducts: ProductSlug[];
  optionalProducts: ProductSlug[];
  conversation: { customer: string; ai: string; followup: string; result: string };
  metric: { label: string; volume: number; minutes: number; automation: number };
  faq: Array<{ question: string; answer: string }>;
  related: string[];
  seoTitle: string;
  metaDescription: string;
}

export const niches: Niche[] = [
  {
    slug: "autobedrijven", name: "Autobedrijven", singular: "autobedrijf",
    hero: "Leads, oproepen en proefritten krijgen", accent: "direct opvolging.",
    lead: "Een AI-medewerker vangt voorraadvragen, inruil, werkplaatsverzoeken en platformleads op en zet ze door naar proefrit, afspraak of CRM-taak.",
    painPoints: [
      { title: "Platformlead wacht", text: "Marktplaats-, BOVAG- en websiteleads vergelijken meerdere aanbieders tegelijk." },
      { title: "Verkoop en werkplaats lopen door elkaar", text: "Dezelfde telefoonlijn vraagt om verschillende intake en routing." },
      { title: "Proefrit buiten openingstijd", text: "Koopintentie komt vaak binnen wanneer de showroom dicht is." },
      { title: "Offerte blijft stil", text: "Inruil, financiering en open voorstellen missen vaste opvolging." }
    ],
    workflow: [
      { title: "Vraag herkennen", text: "Voorraad, proefrit, inruil, financiering of werkplaats." },
      { title: "Auto en klant kwalificeren", text: "Voertuig, voorkeur, timing, contactgegevens en bestaande klantstatus." },
      { title: "Afspraak of overdracht", text: "Proefrit, terugbelverzoek of werkplaatsmoment wordt voorbereid." },
      { title: "CRM bijwerken", text: "Bron, interesse, status en vervolgactie blijven zichtbaar." }
    ],
    intake: ["Voertuig of kenteken", "Proefrit of werkplaats", "Inruil", "Financiering", "Voorkeursmoment", "Bestaande klant"],
    systems: ["Voorraadwebsite", "CRM", "Werkplaatsagenda", "Telefonie", "WhatsApp", "Marktplaats/BOVAG-leads"],
    primaryProducts: ["ai-leadopvolger", "ai-telefoniste", "autopilots-crm"], optionalProducts: ["ai-inboxmedewerker", "leadsmachine-ai"],
    conversation: { customer: "Is de zwarte occasion nog beschikbaar en kan ik zaterdag proefrijden?", ai: "Ik controleer de aanvraag. Wilt u uw huidige auto eventueel inruilen en welk tijdstip past zaterdag?", followup: "Ja, een Golf uit 2018. Rond 11:00 uur.", result: "Proefritaanvraag met voertuig, inruil en voorkeursmoment naar sales en CRM." },
    metric: { label: "leads en oproepen", volume: 180, minutes: 9, automation: 66 },
    faq: [
      { question: "Kan de AI onderscheid maken tussen verkoop en werkplaats?", answer: "Ja. Reden, voertuig, klantstatus en urgentie bepalen de vragen en de juiste route." },
      { question: "Kan de AI voertuigbeschikbaarheid bevestigen?", answer: "Alleen wanneer de voorraadbron actueel en technisch toegankelijk is. Anders wordt de aanvraag als controleverzoek doorgezet." }
    ], related: ["makelaars", "verzekeraars", "zonnepanelen"],
    seoTitle: "AI-medewerker voor autobedrijven: leads, telefoon en proefritten",
    metaDescription: "Bekijk hoe AI voor autobedrijven voorraadvragen, platformleads, inruil, werkplaatsoproepen en proefritten opvolgt en in CRM verwerkt."
  },
  {
    slug: "dakdekkers", name: "Dakdekkers", singular: "dakbedrijf",
    hero: "Spoedlekkages en offerteaanvragen worden", accent: "direct gescheiden.",
    lead: "De AI vraagt daktype, schade, foto’s, postcode en urgentie uit. Je ploeg krijgt een complete inspectie- of spoedmelding zonder tijdens het werk te hoeven opnemen.",
    painPoints: [
      { title: "Storm vult de lijn", text: "Spoed, onderhoud en offertevragen komen op hetzelfde moment binnen." },
      { title: "Foto’s ontbreken", text: "Zonder beeld en daktype is planning of materiaalkeuze onnodig lastig." },
      { title: "Regio wordt te laat gecontroleerd", text: "Een complete intake blijkt soms buiten het werkgebied te vallen." },
      { title: "Offerte koelt af", text: "Niet-spoedeisende aanvragen verdwijnen tussen lekkagemeldingen." }
    ],
    workflow: [
      { title: "Urgentie bepalen", text: "Actief lek, stormschade en veiligheidsrisico krijgen prioriteit." },
      { title: "Dak en schade uitvragen", text: "Plat of hellend, materiaal, locatie van het lek en foto’s." },
      { title: "Regio en planning", text: "Postcode, ploeg en geschikt inspectiemoment worden afgestemd." },
      { title: "Werkvoorbereiding", text: "Samenvatting en foto’s gaan naar planning of offerteflow." }
    ],
    intake: ["Daktype", "Actieve lekkage", "Stormschade", "Foto’s", "Postcode", "Particulier of VvE"],
    systems: ["Telefonie", "WhatsApp", "Agenda", "Routeplanning", "Werkbonnen", "CRM"],
    primaryProducts: ["ai-telefoniste", "ai-inboxmedewerker", "ai-leadopvolger"], optionalProducts: ["autopilots-crm", "leadsmachine-ai"],
    conversation: { customer: "Sinds de storm lekt het bij de dakkapel en het drupt nog.", ai: "Is het veilig binnen en kunt u foto’s sturen van de plek en de buitenzijde? Wat is de postcode?", followup: "Ja, postcode 3512 AB. Ik stuur de foto’s nu.", result: "Spoedlekkage met dakdeel, veiligheidscheck, postcode en foto’s naar de planning." },
    metric: { label: "meldingen en aanvragen", volume: 140, minutes: 10, automation: 68 },
    faq: [
      { question: "Kan de AI spoedlekkages anders behandelen?", answer: "Ja. Actief water, stormschade en veiligheidsrisico’s krijgen een eigen triage en escalatieroute." },
      { question: "Kan routeplanning rekening houden met regio?", answer: "Ja, op basis van afgesproken postcodegebieden en de mogelijkheden van de gebruikte agenda of planningssoftware." }
    ], related: ["glaszetters", "installatietechniek", "zonnepanelen"],
    seoTitle: "AI voor dakdekkers: lekkage-intake, planning en opvolging",
    metaDescription: "Laat AI lekkages, stormschade, daktypes, foto’s, regio en inspectieafspraken voor dakdekkers uitvragen en opvolgen."
  },
  {
    slug: "hoveniers", name: "Hoveniers", singular: "hoveniersbedrijf",
    hero: "Tuinaanvragen worden compleet voordat je", accent: "een schouw plant.",
    lead: "De AI vraagt aanleg of onderhoud, oppervlakte, foto’s, locatie, budgetrichting en planning uit en houdt rekening met regio en seizoensdrukte.",
    painPoints: [
      { title: "Aanvraag mist omvang", text: "‘Tuin laten doen’ zegt nog niets over oppervlak, werksoort of budget." },
      { title: "Foto’s komen later", text: "De eerste beoordeling begint pas na extra berichten en terugbellen." },
      { title: "Routes lopen onnodig om", text: "Schouwen worden gepland zonder regio en capaciteit mee te nemen." },
      { title: "Seizoenspiek vertraagt reactie", text: "Warme aanvragen wachten juist wanneer buitenwerk het drukst is." }
    ],
    workflow: [
      { title: "Werksoort kiezen", text: "Aanleg, renovatie, onderhoud, snoeiwerk of terugkerend contract." },
      { title: "Tuin in beeld", text: "Oppervlakte, foto’s, bereikbaarheid en wensen worden verzameld." },
      { title: "Regio en schouw", text: "Passend moment op basis van postcode en capaciteit." },
      { title: "Offerte opvolgen", text: "Dossier en vervolgmoment blijven zichtbaar." }
    ],
    intake: ["Aanleg of onderhoud", "Oppervlakte", "Foto’s", "Postcode", "Budgetrichting", "Gewenste periode"],
    systems: ["WhatsApp", "Websiteformulier", "Agenda", "Routeplanning", "Offerteflow", "CRM"],
    primaryProducts: ["ai-inboxmedewerker", "ai-leadopvolger", "ai-telefoniste"], optionalProducts: ["autopilots-crm", "leadsmachine-ai"],
    conversation: { customer: "We willen de achtertuin opnieuw laten aanleggen.", ai: "Hoe groot is de tuin ongeveer, wat wilt u behouden en kunt u foto’s meesturen?", followup: "Ongeveer 80 m². De boom blijft, verder mag alles anders.", result: "Renovatieaanvraag met oppervlak, behoudwens, fotoverzoek en schouwroute." },
    metric: { label: "tuinaanvragen", volume: 85, minutes: 12, automation: 64 },
    faq: [
      { question: "Kan de AI aanleg en onderhoud anders uitvragen?", answer: "Ja. De intakevelden, planning en vervolgstappen verschillen per werksoort." },
      { question: "Kan de AI rekening houden met werkgebied?", answer: "Ja. Postcodegebieden en uitzonderingen worden tijdens onboarding vastgelegd." }
    ], related: ["vloerenleggers", "dakdekkers", "kozijnen"],
    seoTitle: "AI voor hoveniers: tuinaanvragen, schouw en offerteopvolging",
    metaDescription: "Kwalificeer tuinaanvragen met oppervlak, foto’s, regio, budget en planning en laat AI schouwen en offertes voor hoveniers opvolgen."
  },
  {
    slug: "installatietechniek", name: "Installatiebedrijven", singular: "installatiebedrijf",
    hero: "Storingen krijgen triage voordat de", accent: "monteur op pad gaat.",
    lead: "De AI vraagt installatie, foutcode, veiligheid, servicecontract, postcode en beschikbaarheid uit en zet onderhoud, storing of offerte naar de juiste route.",
    painPoints: [
      { title: "Foutcode ontbreekt", text: "De planner kan monteur en materiaal niet gericht kiezen." },
      { title: "Spoed is niet eenduidig", text: "Geen warmte, water of veiligheidsrisico vragen een andere aanpak." },
      { title: "Monteur wordt onderbroken", text: "Terugkerende vragen halen vakmensen uit installatie en onderhoud." },
      { title: "Offerte en storing mengen", text: "Commerciële aanvragen verdwijnen tussen servicevragen." }
    ],
    workflow: [
      { title: "Type vraag", text: "Storing, onderhoud, offerte of bestaande werkbon." },
      { title: "Technische intake", text: "Installatie, merk, type, foutcode, foto en veiligheid." },
      { title: "Contract en regio", text: "Klantstatus, SLA, postcode en capaciteit bepalen de route." },
      { title: "Werkbon of afspraak", text: "De planning ontvangt een complete samenvatting." }
    ],
    intake: ["Type installatie", "Foutcode", "Veiligheid", "Servicecontract", "Postcode", "Foto’s"],
    systems: ["Werkbonnen", "Monteurplanning", "CRM", "Telefonie", "WhatsApp", "Agenda"],
    primaryProducts: ["ai-telefoniste", "ai-inboxmedewerker", "autopilots-crm"], optionalProducts: ["ai-leadopvolger", "leadsmachine-ai"],
    conversation: { customer: "De warmtepomp geeft E10 en we hebben geen warm water.", ai: "Werkt de verwarming nog, ziet u lekkage en heeft u een servicecontract?", followup: "Ook geen verwarming, geen lekkage. We zijn bestaande klant.", result: "Urgente storing met foutcode, veiligheidscheck en klantstatus naar monteurplanning." },
    metric: { label: "storingen en servicevragen", volume: 190, minutes: 9, automation: 66 },
    faq: [
      { question: "Kan de AI veiligheidsrisico’s escaleren?", answer: "Ja, volgens vooraf goedgekeurde signalen en noodinstructies. De AI neemt geen technisch risico-oordeel buiten dat kader." },
      { question: "Kan de AI een werkbon voorbereiden?", answer: "Wanneer de software dit ondersteunt, kunnen intakegegevens als werkbon of servicetaak worden klaargezet." }
    ], related: ["dakdekkers", "zonnepanelen", "woningcorporaties"],
    seoTitle: "AI voor installatiebedrijven: storing, triage en monteurplanning",
    metaDescription: "Laat AI storingen, foutcodes, veiligheid, servicecontracten en regio uitvragen en werkbonnen of afspraken voor installatiebedrijven voorbereiden."
  },
  {
    slug: "vastgoedbeheerders", name: "Vastgoedbeheerders", singular: "vastgoedbeheerder",
    hero: "Iedere melding krijgt pandcontext, urgentie en", accent: "een eigenaar.",
    lead: "De AI kwalificeert huurdersmails, reparatieverzoeken, statusvragen en leveranciersberichten op object, dossier, SLA en benodigde vervolgactie.",
    painPoints: [
      { title: "Mailbox bepaalt de werkdag", text: "Huurder, eigenaar en leverancier gebruiken dezelfde algemene inbox." },
      { title: "Objectcontext ontbreekt", text: "Adres, complex, dossier en verantwoordelijke leverancier moeten worden opgezocht." },
      { title: "Urgentie is subjectief", text: "Een melding bevat niet altijd de informatie voor juiste prioriteit." },
      { title: "Statusvragen herhalen", text: "Huurders vragen opnieuw omdat dossierupdates niet direct beschikbaar zijn." }
    ],
    workflow: [
      { title: "Afzender en object", text: "Huurder, eigenaar of leverancier wordt aan adres en complex gekoppeld." },
      { title: "Melding classificeren", text: "Schade, onderhoud, status, document of financiële vraag." },
      { title: "Urgentie en leverancier", text: "SLA, veiligheidsregels en verantwoordelijkheid bepalen de route." },
      { title: "Dossier bijwerken", text: "Ticket, taak, documentatie en terugkoppeling worden vastgelegd." }
    ],
    intake: ["Rol afzender", "Adres en complex", "Type melding", "Urgentie", "Foto’s/documenten", "Dossierstatus"],
    systems: ["E-mail", "Ticketing", "Panddata", "Leveranciers", "CRM", "Documentbeheer"],
    primaryProducts: ["ai-inboxmedewerker", "autopilots-crm", "ai-telefoniste"], optionalProducts: ["ai-leadopvolger", "leadsmachine-ai"],
    conversation: { customer: "De lekkage in mijn keuken is erger geworden. Wanneer komt iemand?", ai: "Om welk adres en dossier gaat het, is er nu actief water en kunt u een actuele foto sturen?", followup: "Parklaan 18, dossier 2418. Het drupt continu.", result: "Bestaand dossier bijgewerkt met actieve lekkage, nieuwe urgentie en leverancierstaak." },
    metric: { label: "mails en meldingen", volume: 420, minutes: 7, automation: 70 },
    faq: [
      { question: "Kan de AI e-mails per pand en urgentie classificeren?", answer: "Ja, wanneer adres-, object- en dossiergegevens betrouwbaar beschikbaar zijn en urgentiecriteria zijn vastgelegd." },
      { question: "Kan de AI zelfstandig leveranciers kiezen?", answer: "Alleen binnen vooraf goedgekeurde verantwoordelijkheden en regels. Uitzonderingen blijven menselijke beslissingen." }
    ], related: ["woningcorporaties", "makelaars", "installatietechniek"],
    seoTitle: "AI voor vastgoedbeheerders: e-mail, meldingen en dossiers",
    metaDescription: "Kwalificeer huurdersmails, reparatieverzoeken, statusvragen en leveranciersberichten op pand, dossier, urgentie en SLA."
  },
  {
    slug: "kapperszaken", name: "Kapperszaken", singular: "kapperszaak",
    hero: "Afspraken worden gepland zonder de", accent: "behandeling te onderbreken.",
    lead: "De AI beantwoordt WhatsApp-, Instagram- en telefoonvragen, kiest behandeling en duur, controleert stylist en agenda en helpt bij wijzigen of herinneren.",
    painPoints: [
      { title: "Handen zijn bezet", text: "De telefoon gaat terwijl de stylist met een behandeling bezig is." },
      { title: "Kleur vraagt extra intake", text: "Een standaard tijdslot past niet bij iedere behandeling." },
      { title: "Avondboekers wachten", text: "WhatsApp en DM-aanvragen komen na sluitingstijd binnen." },
      { title: "Wijzigingen kosten gaten", text: "Verzetten en no-shows vragen direct overzicht en opvolging." }
    ],
    workflow: [
      { title: "Behandeling bepalen", text: "Knippen, kleuren, styling of consult krijgt passende duur." },
      { title: "Voorkeuren uitvragen", text: "Stylist, haarlengte, historie en gewenst moment." },
      { title: "Agenda controleren", text: "Beschikbaarheid en benodigde behandeltijd worden gecombineerd." },
      { title: "Bevestigen en herinneren", text: "Klant en salon krijgen afspraak en eventuele voorbereiding." }
    ],
    intake: ["Behandeling", "Haarlengte", "Stylist", "Kleurhistorie", "Voorkeurstijd", "Bestaande klant"],
    systems: ["Salonagenda", "WhatsApp", "Instagram/DM", "Telefonie", "Reminders", "CRM"],
    primaryProducts: ["ai-inboxmedewerker", "ai-telefoniste", "ai-leadopvolger"], optionalProducts: ["autopilots-crm", "leadsmachine-ai"],
    conversation: { customer: "Kan ik zaterdag balayage laten doen?", ai: "Is uw haar kort, halflang of lang en is het eerder gekleurd? Heeft u een voorkeur voor een stylist?", followup: "Lang en vorig jaar donker geverfd. Geen voorkeur.", result: "Kleurconsult met haarlengte en historie; salon bepaalt definitieve behandeltijd." },
    metric: { label: "afspraakvragen", volume: 230, minutes: 5, automation: 74 },
    faq: [
      { question: "Kan de AI rekening houden met behandelingsduur?", answer: "Ja. Duur kan afhangen van behandeling, haarlengte, stylist en salonregels." },
      { question: "Wat gebeurt er bij complexe kleurbehandelingen?", answer: "De AI verzamelt de basis en plant een consult of draagt over voor menselijke beoordeling." }
    ], related: ["cosmetische-klinieken", "tandartsen", "dierenverzorging"],
    seoTitle: "AI voor kapperszaken: afspraken, WhatsApp en no-shows",
    metaDescription: "Laat AI behandelingen, duur, stylist en voorkeurstijd uitvragen en afspraken via WhatsApp, DM en telefoon voor kapperszaken plannen."
  },
  {
    slug: "tandartsen", name: "Tandartsen", singular: "tandartspraktijk",
    hero: "Patiëntvragen krijgen triage zonder een", accent: "overvolle balie.",
    lead: "De AI vangt afspraakvragen, pijnklachten, verzetten en intake op, herkent afgesproken spoedsignalen en draagt medische beoordeling veilig over.",
    painPoints: [
      { title: "Balie en telefoon tegelijk", text: "Patiënten aan de desk en aan de lijn vragen dezelfde aandacht." },
      { title: "Pijnklacht mist context", text: "Zwelling, koorts, trauma en duur moeten eerst worden uitgevraagd." },
      { title: "Verzetten kost veel handwerk", text: "Beschikbaarheid en behandeltijd moeten kloppen." },
      { title: "Medische grens is belangrijk", text: "De AI mag geen diagnose of behandelbeslissing nemen." }
    ],
    workflow: [
      { title: "Reden vaststellen", text: "Controle, pijn, trauma, wijziging of nieuwe patiënt." },
      { title: "Veilige triage", text: "Goedgekeurde signalen bepalen urgentie en menselijke overdracht." },
      { title: "Agenda en duur", text: "Afspraaktype en beschikbare behandelaar worden gecombineerd." },
      { title: "Dossiernotitie", text: "De balie ontvangt klacht, antwoorden en vervolgactie." }
    ],
    intake: ["Klacht of afspraaktype", "Duur klachten", "Zwelling/koorts", "Trauma", "Bestaande patiënt", "Voorkeursmoment"],
    systems: ["Telefonie", "Praktijkagenda", "Patiëntadministratie", "Website", "WhatsApp", "Reminders"],
    primaryProducts: ["ai-telefoniste", "ai-inboxmedewerker", "ai-leadopvolger"], optionalProducts: ["autopilots-crm"],
    conversation: { customer: "Ik heb sinds vannacht hevige kiespijn.", ai: "Heeft u zwelling, koorts, een ongeval gehad of moeite met slikken?", followup: "Geen koorts, wel zwelling en kloppende pijn.", result: "Pijnklacht met zwelling gemarkeerd voor directe beoordeling door de praktijk." },
    metric: { label: "patiëntvragen", volume: 360, minutes: 5, automation: 58 },
    faq: [
      { question: "Geeft de AI medisch advies?", answer: "Nee. De AI verzamelt informatie, volgt goedgekeurde instructies en draagt medische beoordeling over." },
      { question: "Kan de AI spoedplekken boeken?", answer: "Alleen wanneer de praktijk duidelijke triage- en agendaregels beschikbaar stelt." }
    ], related: ["dierenarts", "cosmetische-klinieken", "kapperszaken"],
    seoTitle: "AI voor tandartsen: telefoon, triage en afspraken",
    metaDescription: "Vang patiëntvragen, pijnklachten, afspraken en wijzigingen op met veilige triage en menselijke beoordeling voor tandartspraktijken."
  },
  {
    slug: "makelaars", name: "Makelaars", singular: "makelaarskantoor",
    hero: "Woningvragen worden bezichtigingen en", accent: "concrete verkoopkansen.",
    lead: "De AI kwalificeert woningzoekers, verkopers en waardebepalingen, plant bezichtigingen en legt interesse en terugbelacties vast.",
    painPoints: [
      { title: "Veel reacties per object", text: "Dezelfde vragen over beschikbaarheid, planning en voorwaarden keren terug." },
      { title: "Warme verkoper wacht", text: "Een waardebepaling vraagt snelle en persoonlijke opvolging." },
      { title: "Bezichtiging kost afstemming", text: "Voorkeuren, object en tijdslot worden handmatig gecombineerd." },
      { title: "Objectcontext ontbreekt", text: "Contactnotities staan niet altijd bij de juiste woning of lead." }
    ],
    workflow: [
      { title: "Koper of verkoper", text: "Doel, object en fase worden direct herkend." },
      { title: "Kwalificatie", text: "Eigen bewoning, financiering, verkoopwens en timing." },
      { title: "Bezichtiging of afspraak", text: "Beschikbaarheid en passende makelaar worden gekoppeld." },
      { title: "CRM-opvolging", text: "Object, interesse en vervolgactie blijven zichtbaar." }
    ],
    intake: ["Object", "Koper of verkoper", "Financieringsfase", "Verkoopmoment", "Voorkeurstijd", "Contactgegevens"],
    systems: ["Woningwebsite", "CRM", "Agenda", "E-mail", "WhatsApp", "Telefonie"],
    primaryProducts: ["ai-leadopvolger", "ai-inboxmedewerker", "autopilots-crm"], optionalProducts: ["ai-telefoniste", "leadsmachine-ai"],
    conversation: { customer: "Ik wil de woning aan de Lindenlaan bezichtigen.", ai: "Koopt u voor eigen bewoning en welke van de beschikbare momenten past het beste?", followup: "Voor eigen bewoning. Donderdag einde middag.", result: "Bezichtigingsaanvraag met object, intentie en voorkeursmoment naar makelaar en CRM." },
    metric: { label: "woning- en verkoopvragen", volume: 170, minutes: 8, automation: 64 },
    faq: [
      { question: "Kan de AI vragen per woning beantwoorden?", answer: "Ja, als actuele objectinformatie betrouwbaar beschikbaar is. Onzekere informatie wordt niet bevestigd." },
      { question: "Kan de AI waardebepalingen opvolgen?", answer: "Ja. Timing, woningtype en verkoopwens kunnen worden uitgevraagd en naar de juiste makelaar gerouteerd." }
    ], related: ["vastgoedbeheerders", "autobedrijven", "kozijnen"],
    seoTitle: "AI voor makelaars: bezichtigingen en leadopvolging",
    metaDescription: "Laat AI woningvragen, bezichtigingen, waardebepalingen en verkopersleads kwalificeren, plannen en in CRM opvolgen."
  },
  {
    slug: "cosmetische-klinieken", name: "Cosmetische klinieken", singular: "cosmetische kliniek",
    hero: "Consultaanvragen worden zorgvuldig", accent: "gekwalificeerd en gepland.",
    lead: "De AI beantwoordt behandelvragen, verzamelt verwachtingen en relevante aandachtspunten, plant consulten en routeert medische beoordeling naar de behandelaar.",
    painPoints: [
      { title: "DM is geen intake", text: "Een korte behandelvraag mist wens, historie en geschiktheid." },
      { title: "Prijs zonder context", text: "Bezoekers vragen om een bedrag voordat behandeling en doel helder zijn." },
      { title: "Consult koelt af", text: "Een warme aanvraag wacht buiten openingstijd." },
      { title: "Medische beoordeling blijft menselijk", text: "Contra-indicaties en behandelkeuze vragen een professional." }
    ],
    workflow: [
      { title: "Behandelwens", text: "Gebied, doel, eerdere behandeling en gewenste periode." },
      { title: "Veilige voorselectie", text: "Aandachtspunten worden verzameld zonder medische conclusie." },
      { title: "Consult plannen", text: "Locatie, behandelaar en passend moment worden gekozen." },
      { title: "Nazorg en follow-up", text: "Bevestiging, voorbereiding en vervolgactie worden vastgelegd." }
    ],
    intake: ["Behandelwens", "Eerdere behandeling", "Verwachting", "Locatie", "Voorkeursmoment", "Menselijke beoordeling"],
    systems: ["Instagram/DM", "WhatsApp", "Website", "Agenda", "CRM", "Reminders"],
    primaryProducts: ["ai-inboxmedewerker", "ai-leadopvolger", "ai-telefoniste"], optionalProducts: ["autopilots-crm", "leadsmachine-ai"],
    conversation: { customer: "Ik wil weten of fillers geschikt zijn voor mijn lippen.", ai: "Ik kan een consult voorbereiden. Heeft u eerder fillers gehad en wat wilt u vooral bespreken?", followup: "Eerste keer. Ik wil een subtiel resultaat.", result: "Consultaanvraag met eerste behandeling en verwachting; beoordeling blijft bij behandelaar." },
    metric: { label: "consult- en behandelvragen", volume: 160, minutes: 7, automation: 62 },
    faq: [
      { question: "Bepaalt de AI of iemand geschikt is?", answer: "Nee. De AI verzamelt informatie en plant een consult; medische geschiktheid blijft bij de behandelaar." },
      { question: "Kan de AI nazorgvragen herkennen?", answer: "Ja, en urgente of onverwachte klachten volgens afgesproken regels direct naar de kliniek escaleren." }
    ], related: ["kapperszaken", "tandartsen", "dierenarts"],
    seoTitle: "AI voor cosmetische klinieken: consulten en behandelvragen",
    metaDescription: "Kwalificeer consultaanvragen, behandelvragen en nazorg met veilige menselijke beoordeling en automatische planning voor cosmetische klinieken."
  },
  {
    slug: "verzekeraars", name: "Verzekeraars", singular: "verzekeraar",
    hero: "Claims komen completer binnen zonder", accent: "autonome risicobeslissingen.",
    lead: "De AI ondersteunt polisvragen, documentchecks en claimintake, registreert dossierinformatie en draagt beoordeling, compliance en risicosignalen over.",
    painPoints: [
      { title: "Claim mist documenten", text: "Foto’s, datum, oorzaak en polisgegevens komen in losse stappen binnen." },
      { title: "Statusvraag herhaalt", text: "Klanten zoeken duidelijkheid terwijl dossiers nog worden behandeld." },
      { title: "Gevoelige gegevens", text: "Rechten, opslag en overdracht moeten aantoonbaar kloppen." },
      { title: "Beslissing vraagt mens", text: "Dekking, fraude en aansprakelijkheid mogen niet generiek worden geautomatiseerd." }
    ],
    workflow: [
      { title: "Identiteit en polis", text: "Klant, polis en type verzoek worden veilig gekoppeld." },
      { title: "Claim compleet maken", text: "Schade, datum, oorzaak, documenten en urgentie." },
      { title: "Dossierroute", text: "Categorie en ontbrekende informatie bepalen de volgende taak." },
      { title: "Menselijke beoordeling", text: "Dekking, risico en uitzonderingen blijven bij bevoegde medewerkers." }
    ],
    intake: ["Identiteit", "Polis", "Schadecategorie", "Datum en oorzaak", "Documenten", "Risicosignalen"],
    systems: ["Klantportaal", "Dossierbeheer", "Documenten", "E-mail", "Telefonie", "CRM"],
    primaryProducts: ["ai-inboxmedewerker", "ai-telefoniste", "autopilots-crm"], optionalProducts: ["ai-leadopvolger"],
    conversation: { customer: "Ik wil waterschade melden en heb foto’s.", ai: "Ik help de claim compleet maken. Wat is het polisnummer, wanneer ontstond de schade en is verdere schade beperkt?", followup: "Polis 4821, vannacht ontstaan. De hoofdkraan is dicht.", result: "Claimintake met polis, oorzaak, veiligheidsactie en documentverzoek naar dossierteam." },
    metric: { label: "claims en polisvragen", volume: 480, minutes: 8, automation: 54 },
    faq: [
      { question: "Beslist de AI over dekking?", answer: "Nee. De AI verzamelt en structureert informatie; dekking, fraude en aansprakelijkheid blijven menselijke beslissingen." },
      { question: "Hoe worden persoonsgegevens beschermd?", answer: "Toegang, bewaartermijnen, logging en verwerkersafspraken worden per systeem en proces ingericht." }
    ], related: ["woningcorporaties", "vastgoedbeheerders", "autobedrijven"],
    seoTitle: "AI voor verzekeraars: claimintake, polisvragen en dossiers",
    metaDescription: "Ondersteun claimintake, polisvragen, documentchecks en dossierregistratie met duidelijke menselijke grenzen voor verzekeraars."
  },
  {
    slug: "glaszetters", name: "Glaszetters", singular: "glaszettersbedrijf",
    hero: "Glasschade krijgt direct een veilige", accent: "spoed- of offertetroute.",
    lead: "De AI vraagt type glas, breuk, afmetingen, locatie, veiligheid, foto’s en verzekeringsinformatie uit en plant herstel of inmeten.",
    painPoints: [
      { title: "Veiligheid eerst", text: "Los glas en open puien vragen een andere route dan HR++ advies." },
      { title: "Afmetingen ontbreken", text: "Zonder foto en globale maat is werkvoorbereiding beperkt." },
      { title: "Spoed en offerte mengen", text: "Acute schade en verduurzamingsvragen komen op dezelfde lijn." },
      { title: "Verzekeringsvraag vertraagt", text: "Polis en schadenummer worden pas later opgehaald." }
    ],
    workflow: [
      { title: "Veiligheid bepalen", text: "Los glas, open situatie en letselrisico krijgen voorrang." },
      { title: "Glas en maat", text: "Type, positie, foto’s en globale afmetingen." },
      { title: "Verzekering en regio", text: "Schadenummer, postcode en bereikbaarheid." },
      { title: "Herstel of inmeten", text: "Spoedtaak, afspraak of offerte-intake wordt aangemaakt." }
    ],
    intake: ["Type schade", "Veiligheid", "Glassoort", "Afmetingen", "Foto’s", "Verzekering"], systems: ["Telefonie", "WhatsApp", "Agenda", "Routeplanning", "Werkbon", "CRM"],
    primaryProducts: ["ai-telefoniste", "ai-inboxmedewerker", "autopilots-crm"], optionalProducts: ["ai-leadopvolger", "leadsmachine-ai"],
    conversation: { customer: "De ruit van de achterdeur is gebarsten en er ligt glas.", ai: "Blijf op afstand. Is de opening nog afgesloten en kunt u veilig een foto en globale maat sturen?", followup: "De deur kan dicht. Ongeveer 80 bij 190 cm.", result: "Glasschade met veiligheidsstatus, maat en fotoverzoek naar spoedplanning." },
    metric: { label: "schades en offertevragen", volume: 115, minutes: 9, automation: 65 },
    faq: [{ question: "Kan de AI onveilige situaties herkennen?", answer: "De AI volgt afgesproken signalen en veiligheidsinstructies en escaleert buiten het veilige kader." }, { question: "Kan de AI een exacte prijs geven?", answer: "Alleen wanneer type, maat en prijsregels betrouwbaar vaststaan. Anders volgt een inmeet- of offerteaanvraag." }],
    related: ["dakdekkers", "kozijnen", "verzekeraars"], seoTitle: "AI voor glaszetters: glasschade, spoed en offertes", metaDescription: "Laat AI glasschade, veiligheid, glas, maten, foto’s en verzekering uitvragen en herstel of inmeten voor glaszetters plannen."
  },
  {
    slug: "hotels", name: "Hotels", singular: "hotel",
    hero: "Gastvragen krijgen antwoord zonder de", accent: "receptie te belasten.",
    lead: "De AI behandelt boekingsvragen, late check-in, parkeren, ontbijt, wijzigingen en groepsaanvragen en draagt uitzonderingen met reserveringscontext over.",
    painPoints: [{ title: "Dezelfde vragen keren terug", text: "Check-in, parkeren, ontbijt en faciliteiten vragen continu receptietijd." }, { title: "Talen wisselen", text: "Gasten verwachten duidelijkheid in hun eigen taal." }, { title: "Wijziging vraagt reserveringscontext", text: "Datum, kamertype en voorwaarden moeten kloppen." }, { title: "Groepsaanvraag is geen standaardboeking", text: "Capaciteit, zaal en voorwaarden vragen menselijke opvolging." }],
    workflow: [{ title: "Gastvraag herkennen", text: "Boeking, verblijf, faciliteit, wijziging of groep." }, { title: "Reserveringscontext", text: "Datum, gastnaam, kamertype en locatie." }, { title: "Antwoord of route", text: "Direct antwoord, wijzigingsverzoek of receptietaak." }, { title: "Bevestiging", text: "Gast en team zien dezelfde vervolgactie." }],
    intake: ["Verblijfsdatum", "Reserveringsnummer", "Kamertype", "Late check-in", "Groepsgrootte", "Taal"], systems: ["Boekingssysteem", "E-mail", "Websitechat", "Telefonie", "WhatsApp", "CRM"],
    primaryProducts: ["ai-inboxmedewerker", "ai-telefoniste", "autopilots-crm"], optionalProducts: ["ai-leadopvolger", "leadsmachine-ai"],
    conversation: { customer: "We komen na 23:00 uur aan. Kan dat?", ai: "Wat is uw reserveringsnummer en verwachte aankomsttijd? Dan zet ik de late check-in klaar.", followup: "Reservering H482, rond 23:45.", result: "Late check-inverzoek met reservering en aankomsttijd naar receptie en gastbevestiging." }, metric: { label: "gast- en boekingsvragen", volume: 520, minutes: 4, automation: 72 },
    faq: [{ question: "Kan de AI reserveringen wijzigen?", answer: "Alleen binnen de mogelijkheden en voorwaarden van het boekingssysteem; uitzonderingen gaan naar de receptie." }, { question: "Kan de AI meerdere talen gebruiken?", answer: "Ja, met gecontroleerde kennis en duidelijke overdracht wanneer context of nuance ontbreekt." }],
    related: ["restaurants", "evenementen", "non-profit"], seoTitle: "AI voor hotels: gastvragen, boekingen en receptie", metaDescription: "Beantwoord boekings- en gastvragen, late check-in, wijzigingen en groepsaanvragen met AI en menselijke receptiefallback."
  },
  {
    slug: "restaurants", name: "Restaurants", singular: "restaurant",
    hero: "Reserveringen worden geregeld zonder de", accent: "service te onderbreken.",
    lead: "De AI beantwoordt openingstijden, menu- en allergievragen, plant of wijzigt reserveringen en kwalificeert groepen en evenementen.",
    painPoints: [{ title: "Telefoon tijdens service", text: "Reserveringsvragen komen wanneer het team gasten bedient." }, { title: "Allergie vraagt zorg", text: "Informatie moet kloppen en complexe situaties vragen menselijke bevestiging." }, { title: "Groep vraagt meer context", text: "Aantal, menu, ruimte en aanbetaling passen niet in standaardboeking." }, { title: "Wijzigingen raken bezetting", text: "Tijd, aantal gasten en tafelplanning moeten actueel blijven." }],
    workflow: [{ title: "Vraag of reservering", text: "Datum, tijd, gasten en locatie." }, { title: "Wensen uitvragen", text: "Allergie, kind, terras, groep of gelegenheid." }, { title: "Beschikbaarheid", text: "Boekingssysteem en voorwaarden bepalen de optie." }, { title: "Bevestigen", text: "Gast en restaurant ontvangen de juiste details." }],
    intake: ["Datum en tijd", "Aantal gasten", "Allergieën", "Groepsaanvraag", "Locatie", "Contactgegevens"], systems: ["Reserveringssysteem", "Telefonie", "Website", "WhatsApp", "E-mail", "Reminders"],
    primaryProducts: ["ai-telefoniste", "ai-inboxmedewerker", "ai-leadopvolger"], optionalProducts: ["autopilots-crm", "leadsmachine-ai"],
    conversation: { customer: "Kunnen we vrijdag met acht personen komen? Eén gast is glutenvrij.", ai: "Welke tijd heeft uw voorkeur en gaat het om een ernstige allergie of dieetwens?", followup: "Rond 19:30 en het is coeliakie.", result: "Groepsaanvraag met medische allergie gemarkeerd voor bevestiging door restaurant." }, metric: { label: "reserveringsvragen", volume: 300, minutes: 4, automation: 70 },
    faq: [{ question: "Kan de AI allergieën bevestigen?", answer: "De AI kan bekende informatie delen, maar ernstige allergieën en keukenmogelijkheden blijven menselijke bevestiging vragen." }, { question: "Kan de AI groepsboekingen verwerken?", answer: "De AI verzamelt de gegevens en routeert groepen volgens capaciteit, menu en aanbetalingsregels." }],
    related: ["hotels", "evenementen", "kapperszaken"], seoTitle: "AI voor restaurants: reserveringen en gastvragen", metaDescription: "Laat AI reserveringen, wijzigingen, allergievragen en groepsaanvragen voor restaurants opvangen en correct routeren."
  },
  {
    slug: "evenementen", name: "Evenementen", singular: "evenementenbedrijf",
    hero: "Eventaanvragen worden compleet voordat sales", accent: "een voorstel maakt.",
    lead: "De AI kwalificeert datum, locatie, gasten, techniek, catering, budget en beschikbaarheid en houdt opvolging richting intake en voorstel actief.",
    painPoints: [{ title: "Aanvraag is te breed", text: "‘Bedrijfsfeest’ mist datum, gasten, locatie en programma." }, { title: "Leveranciers hangen samen", text: "Techniek, catering en entertainment vragen gezamenlijke beschikbaarheid." }, { title: "Piekdata vullen snel", text: "Late reactie kost de aanvraag of gewenste locatie." }, { title: "Voorstel vraagt opvolging", text: "Open keuzes en budgetvragen blijven na verzending liggen." }],
    workflow: [{ title: "Eventtype", text: "Zakelijk, particulier, congres, feest of activatie." }, { title: "Randvoorwaarden", text: "Datum, regio, gasten, budget en locatie." }, { title: "Modules", text: "Catering, techniek, programma en leveranciers." }, { title: "Intake en voorstel", text: "Sales krijgt een compleet dossier en opvolgmoment." }],
    intake: ["Eventtype", "Datum", "Gasten", "Locatie", "Techniek/catering", "Budgetrichting"], systems: ["CRM", "Agenda", "Offerteflow", "E-mail", "Telefonie", "Formulieren"],
    primaryProducts: ["ai-leadopvolger", "ai-inboxmedewerker", "autopilots-crm"], optionalProducts: ["ai-telefoniste", "leadsmachine-ai"],
    conversation: { customer: "We zoeken een bedrijfsfeest voor 120 mensen in november.", ai: "Heeft u al een datum, regio en wensen voor locatie, catering of techniek?", followup: "14 november in Utrecht, inclusief DJ en borrelhapjes.", result: "Eventlead met datum, regio, gasten en leverancierswensen naar sales." }, metric: { label: "eventaanvragen", volume: 75, minutes: 14, automation: 62 },
    faq: [{ question: "Kan de AI beschikbaarheid van leveranciers bevestigen?", answer: "Alleen wanneer die actueel en gekoppeld is. Anders verzamelt de AI voorkeuren voor menselijke controle." }, { question: "Kan offerteopvolging per event verschillen?", answer: "Ja. Timing kan afhangen van eventdatum, omvang, open keuzes en voorstelstatus." }],
    related: ["hotels", "restaurants", "non-profit"], seoTitle: "AI voor evenementen: intake, planning en offerteopvolging", metaDescription: "Kwalificeer eventaanvragen op datum, gasten, locatie, techniek, catering en budget en volg voorstellen automatisch op."
  },
  {
    slug: "kozijnen", name: "Kozijnenbedrijven", singular: "kozijnenbedrijf",
    hero: "Offerteaanvragen worden klaar voor", accent: "inmeten en calculatie.",
    lead: "De AI vraagt materiaal, aantallen, positie, glaswens, foto’s, woningtype en planning uit en volgt het inmeet- en offertetraject op.",
    painPoints: [{ title: "‘Nieuwe kozijnen’ is te weinig", text: "Materiaal, aantal, glas en montage bepalen de route." }, { title: "Foto’s en maten ontbreken", text: "De eerste calculatie begint pas na extra contact." }, { title: "Subsidievraag vraagt context", text: "Voorwaarden verschillen en mogen niet generiek worden beloofd." }, { title: "Inmeetafspraak koelt af", text: "Warme verbouwplannen worden door meerdere aanbieders opgevolgd." }],
    workflow: [{ title: "Project bepalen", text: "Vervanging, nieuwbouw, glas of renovatie." }, { title: "Specificaties", text: "Materiaal, aantallen, positie, foto’s en globale maat." }, { title: "Regio en inmeten", text: "Postcode en beschikbaarheid bepalen de afspraak." }, { title: "Offerte opvolgen", text: "Open vragen en beslismoment blijven zichtbaar." }],
    intake: ["Materiaal", "Aantal kozijnen", "Glaswens", "Foto’s", "Postcode", "Gewenste periode"], systems: ["Websiteformulier", "WhatsApp", "Agenda", "CRM", "Offerteflow", "Telefonie"],
    primaryProducts: ["ai-leadopvolger", "ai-inboxmedewerker", "leadsmachine-ai"], optionalProducts: ["ai-telefoniste", "autopilots-crm"],
    conversation: { customer: "We willen drie houten kozijnen vervangen door kunststof met HR++.", ai: "Op welke verdieping zitten ze en kunt u foto’s en globale maten sturen?", followup: "Begane grond aan de voorzijde. Foto’s volgen.", result: "Inmeetlead met materiaal, glas, aantal, positie en fotoverzoek." }, metric: { label: "offerte- en inmeetvragen", volume: 90, minutes: 11, automation: 67 },
    faq: [{ question: "Kan de AI subsidie beloven?", answer: "Nee. De AI kan goedgekeurde informatie delen en verwijst voor definitieve voorwaarden naar de juiste bron of medewerker." }, { question: "Kan de AI een inmeetafspraak plannen?", answer: "Ja, op basis van regio, capaciteit en de mogelijkheden van de agenda." }],
    related: ["glaszetters", "vloerenleggers", "zonnepanelen"], seoTitle: "AI voor kozijnenbedrijven: offerte, foto’s en inmeten", metaDescription: "Laat AI kozijnvragen op materiaal, glas, aantallen, foto’s en regio kwalificeren en inmeetafspraken en offertes opvolgen."
  },
  {
    slug: "zonnepanelen", name: "Zonnepanelenbedrijven", singular: "zonnepanelenbedrijf",
    hero: "Solarleads krijgen direct een", accent: "complete adviesintake.",
    lead: "De AI vraagt verbruik, daktype, dakrichting, meterkast, adres en planning uit en scheidt nieuwe aanvragen van monitoring- en servicevragen.",
    painPoints: [{ title: "Lead vergelijkt snel", text: "Energievragen worden bij meerdere aanbieders tegelijk neergelegd." }, { title: "Dakdata ontbreekt", text: "Verbruik, richting en type dak bepalen de eerste beoordeling." }, { title: "Service haalt sales uit focus", text: "Omvormer- en monitoringvragen mengen met nieuwe aanvragen." }, { title: "Advies vraagt afstemming", text: "Beschikbaarheid en ontbrekende gegevens vertragen het gesprek." }],
    workflow: [{ title: "Sales of service", text: "Nieuwe installatie, uitbreiding, storing of monitoring." }, { title: "Dak en verbruik", text: "Jaarverbruik, daktype, richting en meterkast." }, { title: "Regio en afspraak", text: "Adres en agenda bepalen het adviesmoment." }, { title: "CRM-opvolging", text: "Leadstatus en open informatie blijven zichtbaar." }],
    intake: ["Jaarverbruik", "Daktype", "Dakrichting", "Meterkast", "Adres", "Service of nieuw"], systems: ["CRM", "Agenda", "E-mail", "WhatsApp", "Telefonie", "Monitoring"],
    primaryProducts: ["ai-leadopvolger", "ai-inboxmedewerker", "leadsmachine-ai"], optionalProducts: ["ai-telefoniste", "autopilots-crm"],
    conversation: { customer: "Zijn zonnepanelen interessant bij 4200 kWh verbruik?", ai: "Is het dak plat of schuin, welke richting heeft het en weet u iets over de meterkast?", followup: "Schuin op het zuiden, drie fasen aanwezig.", result: "Solarlead met verbruik, dakrichting en meterkast voor adviesafspraak." }, metric: { label: "solar- en servicevragen", volume: 130, minutes: 9, automation: 65 },
    faq: [{ question: "Kan de AI een opbrengst garanderen?", answer: "Nee. De AI verzamelt gegevens en deelt alleen goedgekeurde indicaties; definitieve berekening blijft specialistisch." }, { question: "Kan de AI service en sales scheiden?", answer: "Ja. Storingen, monitoring en nieuwe offertes krijgen verschillende vragen en routes." }],
    related: ["installatietechniek", "dakdekkers", "kozijnen"], seoTitle: "AI voor zonnepanelenbedrijven: solarleads en service", metaDescription: "Kwalificeer solarleads op verbruik, dak, meterkast en regio en scheid servicevragen van nieuwe aanvragen met AI."
  },
  {
    slug: "vloerenleggers", name: "Vloerenleggers", singular: "vloerenbedrijf",
    hero: "Vloeraanvragen worden compleet voor", accent: "opname en offerte.",
    lead: "De AI vraagt vloertype, m², ondervloer, ruimtes, foto’s, planning en adres uit en houdt opname en offerte actief in opvolging.",
    painPoints: [{ title: "M² ontbreekt", text: "Zonder oppervlak en ruimtes is een aanvraag niet te beoordelen." }, { title: "Ondervloer verrast", text: "Egaliseren, vocht en bestaande vloer bepalen voorbereiding." }, { title: "Foto’s komen verspreid", text: "Werkvoorbereiding start na meerdere losse berichten." }, { title: "Offerte vraagt opvolging", text: "Planning en materiaalkeuze blijven soms onbesproken." }],
    workflow: [{ title: "Vloer en ruimtes", text: "PVC, hout, laminaat of gietvloer met m²." }, { title: "Ondergrond", text: "Bestaande vloer, egaliseren, vloerverwarming en foto’s." }, { title: "Opname plannen", text: "Adres, regio en gewenste uitvoerperiode." }, { title: "Offerte opvolgen", text: "Keuzes, planning en status blijven in beeld." }],
    intake: ["Vloertype", "Oppervlakte", "Ondervloer", "Foto’s", "Vloerverwarming", "Uitvoerperiode"], systems: ["WhatsApp", "Formulier", "Agenda", "CRM", "Offerteflow", "Planning"],
    primaryProducts: ["ai-inboxmedewerker", "ai-leadopvolger", "leadsmachine-ai"], optionalProducts: ["ai-telefoniste", "autopilots-crm"],
    conversation: { customer: "We willen 65 m² visgraat-PVC laten leggen.", ai: "Wat ligt er nu, is er vloerverwarming en wanneer wilt u de vloer gereed hebben?", followup: "Tegels met vloerverwarming, liefst in september.", result: "Vloerlead met m², materiaal, ondergrond, vloerverwarming en planning." }, metric: { label: "vloer- en offertevragen", volume: 80, minutes: 12, automation: 66 },
    faq: [{ question: "Kan de AI bepalen of egaliseren nodig is?", answer: "Nee. De AI verzamelt informatie en foto’s; technische beoordeling blijft bij de specialist." }, { question: "Kan de AI opnames per regio plannen?", answer: "Ja, wanneer werkgebied en agenda beschikbaar zijn." }],
    related: ["kozijnen", "hoveniers", "glaszetters"], seoTitle: "AI voor vloerenleggers: intake, opname en offerte", metaDescription: "Laat AI vloertype, m², ondervloer, foto’s en planning uitvragen en opnames en offertes voor vloerenleggers opvolgen."
  },
  {
    slug: "woningcorporaties", name: "Woningcorporaties", singular: "woningcorporatie",
    hero: "Huurdersmeldingen krijgen een veilige en", accent: "traceerbare route.",
    lead: "De AI vangt reparatieverzoeken, leefbaarheidsmeldingen, huurvragen en statusvragen op, koppelt ze aan woning en dossier en respecteert SLA en escalatie.",
    painPoints: [{ title: "Veel kanalen", text: "Telefoon, portaal en e-mail bevatten overlappende meldingen." }, { title: "Urgentie verschilt", text: "Veiligheid, bewonerssituatie en type gebrek vragen duidelijke regels." }, { title: "Dossiercontext ontbreekt", text: "Eerdere reparaties en open taken moeten worden gecontroleerd." }, { title: "Bewoner wil status", text: "Onzekerheid leidt tot herhaalde contactmomenten." }],
    workflow: [{ title: "Bewoner en woning", text: "Identiteit, adres, complex en contactvoorkeur." }, { title: "Melding en veiligheid", text: "Gebrek, urgentie, foto’s en bewonerssituatie." }, { title: "SLA en leverancier", text: "Route op basis van verantwoordelijkheid en beschikbaarheid." }, { title: "Dossier en terugkoppeling", text: "Taak, afspraak en status worden zichtbaar." }],
    intake: ["Bewoner", "Adres", "Type melding", "Veiligheid", "Foto’s", "Toegankelijkheid"], systems: ["Huurdersportaal", "Dossierbeheer", "Werkbonnen", "Telefonie", "E-mail", "Leveranciers"],
    primaryProducts: ["ai-inboxmedewerker", "ai-telefoniste", "autopilots-crm"], optionalProducts: ["ai-leadopvolger"],
    conversation: { customer: "De verwarming werkt niet en er is een baby in huis.", ai: "Wat is uw adres, geldt het voor de hele woning en ziet of ruikt u iets ongewoons?", followup: "Hele woning, geen geur. Adres is Hof 12.", result: "Urgente verwarmingsmelding met bewonerscontext en veiligheidscheck naar storingsdienst." }, metric: { label: "huurdersmeldingen", volume: 650, minutes: 7, automation: 62 },
    faq: [{ question: "Kan de AI rekening houden met kwetsbare bewoners?", answer: "Ja, als relevante signalen en escalatieregels zorgvuldig zijn vastgelegd en privacy correct is ingericht." }, { question: "Kan de AI afspraken met leveranciers plannen?", answer: "Dat hangt af van beschikbare planning, rechten en de gewenste mate van automatisering." }],
    related: ["vastgoedbeheerders", "installatietechniek", "verzekeraars"], seoTitle: "AI voor woningcorporaties: huurdersmeldingen en reparaties", metaDescription: "Vang huurdersmeldingen, reparaties en statusvragen op met woningcontext, urgentie, SLA en veilige menselijke escalatie."
  },
  {
    slug: "non-profit", name: "Non-profitorganisaties", singular: "non-profitorganisatie",
    hero: "Donateurs, vrijwilligers en hulpvragen krijgen", accent: "de juiste aandacht.",
    lead: "De AI beantwoordt praktische vragen, kwalificeert vrijwilligers en donateurs, routeert hulpvragen en bewaakt dat gevoelige situaties menselijk worden opgepakt.",
    painPoints: [{ title: "Klein team, veel vragen", text: "Operationele vragen nemen tijd weg van programma en impact." }, { title: "Vrijwilliger koelt af", text: "Aanmeldingen krijgen niet altijd snel een passende vervolgstap." }, { title: "Hulpvraag kan gevoelig zijn", text: "Urgentie en veiligheid vragen een duidelijke menselijke route." }, { title: "Donateur wil context", text: "Vragen over bestemming, bewijs en wijziging vragen betrouwbare informatie." }],
    workflow: [{ title: "Type contact", text: "Hulpvraag, vrijwilliger, donateur, partner of algemene vraag." }, { title: "Relevante intake", text: "Beschikbaarheid, locatie, behoefte en contactvoorkeur." }, { title: "Veilige routing", text: "Urgente en gevoelige situaties gaan naar een mens." }, { title: "Opvolging", text: "Taak, bevestiging en status worden vastgelegd." }],
    intake: ["Rol", "Hulp of aanbod", "Locatie", "Beschikbaarheid", "Urgentie", "Contactvoorkeur"], systems: ["E-mail", "Website", "CRM", "Telefonie", "Donateursadministratie", "Agenda"],
    primaryProducts: ["ai-inboxmedewerker", "autopilots-crm", "ai-leadopvolger"], optionalProducts: ["ai-telefoniste", "leadsmachine-ai"],
    conversation: { customer: "Ik wil me twee avonden per maand inzetten als vrijwilliger.", ai: "In welke regio woont u en welk type werkzaamheden past bij u?", followup: "Regio Rotterdam, liefst contact met mensen.", result: "Vrijwilligerslead met regio, beschikbaarheid en voorkeur naar coördinator." }, metric: { label: "vragen en aanmeldingen", volume: 140, minutes: 8, automation: 60 },
    faq: [{ question: "Kan de AI urgente hulpvragen behandelen?", answer: "De AI kan signalen herkennen en direct doorzetten, maar beoordeling en hulpverlening blijven menselijk." }, { question: "Kan de AI met donateursdata werken?", answer: "Alleen met passende rechten, privacyafspraken en technisch veilige koppelingen." }],
    related: ["evenementen", "woningcorporaties", "hotels"], seoTitle: "AI voor non-profit: vrijwilligers, donateurs en hulpvragen", metaDescription: "Ondersteun vrijwilligersaanmeldingen, donateursvragen en veilige routing van hulpvragen met AI voor non-profitorganisaties."
  },
  {
    slug: "dierenarts", name: "Dierenartsen", singular: "dierenartspraktijk",
    hero: "Dierklachten krijgen triage zonder de", accent: "praktijklijn te blokkeren.",
    lead: "De AI vraagt diersoort, klacht, duur, gedrag, medicatie en spoedsignalen uit, plant passende afspraken en draagt medische beoordeling over.",
    painPoints: [{ title: "Emotionele spoedvraag", text: "Eigenaren hebben snel duidelijkheid nodig zonder diagnose op afstand." }, { title: "Balie is druk", text: "Afspraken en herhaalvragen onderbreken patiëntzorg." }, { title: "Klacht mist context", text: "Diersoort, duur, eten, drinken en gedrag moeten worden uitgevraagd." }, { title: "Medicatie vraagt controle", text: "Herhaalverzoeken moeten aan patiënt en dossier worden gekoppeld." }],
    workflow: [{ title: "Dier en eigenaar", text: "Diersoort, patiëntstatus en contactgegevens." }, { title: "Klacht en signalen", text: "Duur, gedrag, eten, drinken, trauma en urgentie." }, { title: "Veilige route", text: "Spoed naar praktijk, anders afspraak of terugbelverzoek." }, { title: "Dossiernotitie", text: "Samenvatting en vervolgactie worden vastgelegd." }],
    intake: ["Diersoort", "Klacht", "Duur", "Eten/drinken", "Medicatie", "Spoedsignalen"], systems: ["Telefonie", "Praktijkagenda", "Patiëntdossier", "Website", "WhatsApp", "Reminders"],
    primaryProducts: ["ai-telefoniste", "ai-inboxmedewerker", "ai-leadopvolger"], optionalProducts: ["autopilots-crm"],
    conversation: { customer: "Mijn hond braakt sinds vannacht en is erg sloom.", ai: "Heeft hij water binnengehouden, bloed gezien of mogelijk iets giftigs gegeten?", followup: "Water komt terug, geen bloed, oorzaak onbekend.", result: "Urgente klacht met sloomheid en geen vochtbehoud naar directe praktijkbeoordeling." }, metric: { label: "dier- en afspraakvragen", volume: 310, minutes: 6, automation: 55 },
    faq: [{ question: "Geeft de AI een diagnose?", answer: "Nee. De AI verzamelt signalen en volgt goedgekeurde triage; medische beoordeling blijft bij de dierenarts." }, { question: "Kan de AI herhaalmedicatie regelen?", answer: "De AI kan het verzoek verzamelen en aan patiënt en dossier koppelen; goedkeuring blijft bij de praktijk." }],
    related: ["dierenverzorging", "tandartsen", "cosmetische-klinieken"], seoTitle: "AI voor dierenartsen: telefoon, triage en afspraken", metaDescription: "Vang dierklachten, afspraken en medicatieverzoeken op met veilige triage en menselijke beoordeling voor dierenartspraktijken."
  },
  {
    slug: "dierenverzorging", name: "Dierenverzorging", singular: "dierenverzorgingsbedrijf",
    hero: "Boekingen passen bij dier, periode en", accent: "verzorgingswensen.",
    lead: "De AI plant trim-, opvang- en verzorgingsvragen op basis van diersoort, ras, gedrag, vacht, periode en beschikbare capaciteit.",
    painPoints: [{ title: "Behandeling duurt verschillend", text: "Ras, vacht en gedrag beïnvloeden tijd en medewerker." }, { title: "Opvang vraagt dossier", text: "Vaccinatie, medicatie en gedrag moeten vooraf duidelijk zijn." }, { title: "Handen zijn bezet", text: "Tijdens verzorging kan het team niet steeds opnemen." }, { title: "Piekperiodes vullen snel", text: "Vakanties en feestdagen vragen directe beschikbaarheidscontrole." }],
    workflow: [{ title: "Dienst bepalen", text: "Trimmen, opvang, dagverzorging of consult." }, { title: "Dierprofiel", text: "Soort, ras, gedrag, vacht en medische aandacht." }, { title: "Periode en capaciteit", text: "Duur, locatie en beschikbare medewerker of plek." }, { title: "Bevestiging", text: "Voorbereiding en afspraak komen bij klant en team." }],
    intake: ["Diersoort en ras", "Dienst", "Gedrag", "Vacht", "Medicatie", "Periode"], systems: ["Agenda", "WhatsApp", "Telefonie", "Klantdossier", "Reminders", "Formulier"],
    primaryProducts: ["ai-inboxmedewerker", "ai-telefoniste", "ai-leadopvolger"], optionalProducts: ["autopilots-crm", "leadsmachine-ai"],
    conversation: { customer: "Kan mijn labradoodle volgende week getrimd worden?", ai: "Hoe groot is hij, hoe is de vachtconditie en is hij gewend aan trimmen?", followup: "Middelgroot, wat klitten en rustig tijdens trimmen.", result: "Trimaanvraag met ras, formaat, vacht en gedrag voor passende tijdsduur." }, metric: { label: "boekings- en verzorgingsvragen", volume: 150, minutes: 6, automation: 70 },
    faq: [{ question: "Kan de AI behandeltijd per dier aanpassen?", answer: "Ja, op basis van ras, formaat, vacht, gedrag en jullie eigen tijdsregels." }, { question: "Kan de AI medische vragen beantwoorden?", answer: "Nee. Medische beoordeling gaat naar een dierenarts of bevoegde medewerker." }],
    related: ["dierenarts", "kapperszaken", "hotels"], seoTitle: "AI voor dierenverzorging: boekingen en dierintake", metaDescription: "Plan trim-, opvang- en verzorgingsafspraken op basis van dierprofiel, gedrag, vacht, periode en capaciteit."
  }
];

export const nicheBySlug = Object.fromEntries(niches.map((niche) => [niche.slug, niche])) as Record<string, Niche>;
