export type ProductSlug =
  | "ai-inboxmedewerker"
  | "ai-leadopvolger"
  | "ai-telefoniste"
  | "autopilots-crm"
  | "leadsmachine-ai";

export interface Product {
  slug: ProductSlug;
  name: string;
  shortName: string;
  eyebrow: string;
  hero: string;
  accent: string;
  intro: string;
  promise: string;
  problemTitle: string;
  problems: Array<{ title: string; text: string }>;
  workflow: Array<{ label: string; title: string; text: string; output: string }>;
  core: Array<{ title: string; text: string }>;
  integrations: string[];
  boundaries: Array<{ title: string; text: string }>;
  fit: Array<{ title: string; text: string }>;
  faq: Array<{ question: string; answer: string }>;
  calculator: {
    volumeLabel: string;
    minutesLabel: string;
    automationLabel: string;
    outputLabel: string;
  };
  seoTitle: string;
  metaDescription: string;
}

export const products: Product[] = [
  {
    slug: "ai-inboxmedewerker",
    name: "AI Inboxmedewerker",
    shortName: "Inboxmedewerker",
    eyebrow: "Digitale klantvragen",
    hero: "Van ieder bericht naar een",
    accent: "duidelijke actie.",
    intro: "Behandelt e-mail, WhatsApp, websitechat, formulieren en social inboxen vanuit één afgesproken werkwijze. De AI beantwoordt, vraagt door, plant, routeert of registreert.",
    promise: "Eén digitale collega voor binnenkomend klantcontact.",
    problemTitle: "Berichten komen overal binnen. De opvolging blijft versnipperd.",
    problems: [
      { title: "Vragen blijven liggen", text: "Een bericht buiten openingstijd wordt pas gezien wanneer de klant al verder zoekt." },
      { title: "Context ontbreekt", text: "Medewerkers zoeken in mailboxen, chats en losse notities voordat ze kunnen antwoorden." },
      { title: "Intake is onvolledig", text: "De eerste reactie mist vaak de velden die nodig zijn voor planning of een offerte." },
      { title: "Geen systeemactie", text: "Een goed gesprek eindigt alsnog zonder ticket, afspraak of CRM-update." }
    ],
    workflow: [
      { label: "Bericht", title: "Vraag komt binnen", text: "Mail, WhatsApp, chat, formulier of DM wordt herkend.", output: "Kanaal, klant en onderwerp zijn bekend." },
      { label: "Context", title: "Intentie wordt bepaald", text: "De AI leest de vraag, klantstatus, urgentie en ontbrekende gegevens.", output: "Prioriteit en vervolgvraag staan klaar." },
      { label: "Antwoord", title: "Klant krijgt duidelijkheid", text: "De AI antwoordt vanuit jullie kennis, regels en tone of voice.", output: "De klant weet direct wat de volgende stap is." },
      { label: "Actie", title: "Gesprek wordt verwerkt", text: "Afspraak, ticket, taak of menselijke overdracht wordt aangemaakt.", output: "Het systeem bevat de volledige context." }
    ],
    core: [
      { title: "Kanaalherkenning", text: "Ieder bericht krijgt afzender, onderwerp en juiste klantcontext." },
      { title: "Kennis en kaders", text: "Antwoorden volgen de goedgekeurde informatie en uitzonderingen." },
      { title: "Intake en kwalificatie", text: "Ontbrekende gegevens worden gericht uitgevraagd." },
      { title: "Menselijke overdracht", text: "Twijfel, uitzonderingen en gevoelige situaties gaan met samenvatting naar een medewerker." }
    ],
    integrations: ["E-mail", "WhatsApp", "Website", "Formulieren", "CRM", "Ticketing", "Agenda"],
    boundaries: [
      { title: "Geen antwoord zonder basis", text: "Bij onvoldoende zekerheid stelt de AI een vraag of draagt hij over." },
      { title: "API bepaalt de actie", text: "Lezen en schrijven in systemen hangt af van rechten en beschikbare koppelingen." },
      { title: "Mens blijft beschikbaar", text: "Klachten, uitzonderingen en beslissingen buiten het kader krijgen menselijke fallback." }
    ],
    fit: [
      { title: "Sterke match", text: "Teams met veel herhaalvragen en meerdere digitale inboxen." },
      { title: "Lichter kan", text: "Bij één klein kanaal met weinig volume kan een goede FAQ en formulier genoeg zijn." },
      { title: "Combineer wanneer", text: "Voeg Leadopvolger of Telefoniste toe als het proces ook proactief of telefonisch doorloopt." }
    ],
    faq: [
      { question: "Wat gebeurt er als de AI het antwoord niet zeker weet?", answer: "Dan vraagt de AI om extra informatie of zet hij het gesprek met context door naar een medewerker. Onzekerheid wordt niet als feit gepresenteerd." },
      { question: "Kan de AI verschillende inboxen tegelijk behandelen?", answer: "Ja, wanneer de kanalen technisch toegankelijk zijn. Tijdens onboarding bepalen we per kanaal welke acties zijn toegestaan." },
      { question: "Kan de tone of voice per team of merk verschillen?", answer: "Ja. We leggen aanspreekvorm, schrijfstijl, uitzonderingen en goedgekeurde antwoorden per omgeving vast." },
      { question: "Werkt dit met ons huidige CRM?", answer: "Dat hangt af van de beschikbare API, rechten en gewenste acties. We toetsen eerst wat veilig kan worden gelezen en geschreven." }
    ],
    calculator: { volumeLabel: "Berichten per maand", minutesLabel: "Minuten per bericht", automationLabel: "Deel dat AI kan voorbereiden", outputLabel: "Indicatieve tijd vrijgemaakt" },
    seoTitle: "AI Inboxmedewerker voor e-mail, WhatsApp en chat | Autopilots",
    metaDescription: "Bekijk hoe de AI Inboxmedewerker e-mail, WhatsApp, chat en formulieren omzet naar antwoorden, intake, afspraken, tickets en CRM-acties."
  },
  {
    slug: "ai-leadopvolger",
    name: "AI Leadopvolger",
    shortName: "Leadopvolger",
    eyebrow: "Leads en offertes",
    hero: "Iedere kans krijgt op tijd de",
    accent: "juiste opvolging.",
    intro: "Volgt nieuwe leads, offertes, no-shows en stille gesprekken consequent op via WhatsApp, e-mail, SMS of een belactie—totdat er een duidelijke uitkomst is.",
    promise: "Een medewerker die opvolging nooit van een losse herinnering laat afhangen.",
    problemTitle: "De lead is er al. De snelheid en discipline ontbreken.",
    problems: [
      { title: "Te late eerste reactie", text: "Een warme aanvraag koelt af voordat iemand tijd heeft om te bellen." },
      { title: "Offertes worden stil", text: "Open vragen en bezwaren blijven onbeantwoord zonder vaste opvolgroute." },
      { title: "No-shows verdwijnen", text: "Een gemiste afspraak krijgt niet altijd een passende nieuwe kans." },
      { title: "Pipeline loopt achter", text: "Reacties en statussen worden handmatig of helemaal niet bijgewerkt." }
    ],
    workflow: [
      { label: "Lead", title: "Nieuwe kans komt binnen", text: "Formulier, platformlead, offerte of oud contact wordt aan een route gekoppeld.", output: "Bron, status en gewenste uitkomst zijn bekend." },
      { label: "Timing", title: "Kanaal en moment worden gekozen", text: "De AI volgt op volgens fase, toestemming, urgentie en openingstijden.", output: "Het juiste bericht staat op het juiste moment klaar." },
      { label: "Reactie", title: "Antwoord wordt begrepen", text: "Interesse, bezwaar, terugbelwens of afmelding wordt geclassificeerd.", output: "Alleen relevante situaties vragen menselijke aandacht." },
      { label: "Uitkomst", title: "Afspraak of status volgt", text: "De agenda en pipeline worden bijgewerkt en de klant ontvangt bevestiging.", output: "Iedere lead heeft een zichtbare volgende stap." }
    ],
    core: [
      { title: "Directe eerste reactie", text: "Nieuwe aanvragen krijgen zonder handmatige wachtrij een passende ontvangst." },
      { title: "Opvolgsequenties", text: "Timing, kanaal en stopregels worden vooraf vastgelegd." },
      { title: "Reply-herkenning", text: "Vragen, bezwaren, interesse en afmeldingen krijgen een andere route." },
      { title: "Pipeline-update", text: "Status, notitie, taak of afspraak wordt na iedere uitkomst verwerkt." }
    ],
    integrations: ["WhatsApp", "E-mail", "SMS", "Telefonie", "Formulieren", "Agenda", "CRM"],
    boundaries: [
      { title: "Geen generieke spam", text: "Berichten volgen toestemming, context, timing en duidelijke stopregels." },
      { title: "Geen verzonnen aanbod", text: "Prijzen, beschikbaarheid en voorwaarden komen uit goedgekeurde bronnen." },
      { title: "Mens bij commercieel oordeel", text: "Onderhandeling en uitzonderlijke bezwaren worden met context overgedragen." }
    ],
    fit: [
      { title: "Sterke match", text: "Bedrijven met structurele leadinstroom, offertes of no-shows." },
      { title: "Lichter kan", text: "Bij enkele warme aanvragen per maand kan een simpele taakflow voldoende zijn." },
      { title: "Combineer wanneer", text: "Leadsmachine AI past wanneer ook advertenties, landingspagina en intake onderdeel zijn." }
    ],
    faq: [
      { question: "Stopt de AI wanneer iemand niet geïnteresseerd is?", answer: "Ja. Afmeldingen en duidelijke negatieve reacties stoppen de route en worden correct vastgelegd." },
      { question: "Kan de AI bezwaren herkennen?", answer: "De AI kan afgesproken bezwaren herkennen en beantwoorden. Nieuwe of gevoelige bezwaren gaan naar een medewerker." },
      { question: "Kan opvolging per leadbron verschillen?", answer: "Ja. Een offerte, advertentielead en bestaande klant kunnen ieder een eigen timing, kanaal en kwalificatie krijgen." },
      { question: "Wordt de pipeline automatisch bijgewerkt?", answer: "Wanneer het CRM dit technisch toestaat, kan de AI status, notities, taken en afspraken verwerken." }
    ],
    calculator: { volumeLabel: "Leads of offertes per maand", minutesLabel: "Minuten handwerk per opvolging", automationLabel: "Deel dat AI kan voorbereiden", outputLabel: "Indicatieve opvolgtijd vrijgemaakt" },
    seoTitle: "AI Leadopvolger voor leads, offertes en no-shows | Autopilots",
    metaDescription: "Bekijk hoe AI-leadopvolging nieuwe leads, offertes, no-shows en oude contacten opvolgt via WhatsApp, mail, SMS, telefonie en CRM."
  },
  {
    slug: "ai-telefoniste",
    name: "AI Telefoniste",
    shortName: "Telefoniste",
    eyebrow: "Telefonische bereikbaarheid",
    hero: "Ieder gesprek wordt opgenomen, begrepen en",
    accent: "netjes verwerkt.",
    intro: "Neemt inkomende oproepen aan, stelt gerichte vervolgvragen, bepaalt urgentie, plant waar mogelijk en schakelt volgens afgesproken regels door.",
    promise: "Een professionele telefonische collega, geen spraakmenu.",
    problemTitle: "De telefoon gaat precies wanneer je team niet kan opnemen.",
    problems: [
      { title: "Gemiste oproepen", text: "Klanten bellen tijdens werk, behandeling, piekdrukte of buiten openingstijd." },
      { title: "Onvolledige notities", text: "Terugbelverzoeken missen reden, urgentie of relevante klantgegevens." },
      { title: "Iedere vraag onderbreekt", text: "Ook eenvoudige vragen halen vakmensen uit hun belangrijkste werk." },
      { title: "Spoed en normaal lopen door elkaar", text: "Zonder triage krijgt niet altijd de juiste situatie voorrang." }
    ],
    workflow: [
      { label: "Oproep", title: "De telefoon wordt opgenomen", text: "De AI opent professioneel en herkent nummer, tijd en gekozen lijn.", output: "De beller krijgt direct een duidelijke ontvangst." },
      { label: "Reden", title: "De vraag wordt uitgevraagd", text: "Nieuwe aanvraag, bestaande klant, spoed of wijziging krijgt eigen vragen.", output: "Reden en ontbrekende gegevens zijn vastgelegd." },
      { label: "Route", title: "De juiste actie wordt gekozen", text: "Antwoord, afspraak, terugbelverzoek, doorschakeling of escalatie volgt.", output: "De beller weet wat er nu gebeurt." },
      { label: "Samenvatting", title: "Gesprek komt in het systeem", text: "Notitie, urgentie, taak en eventuele afspraak worden opgeslagen.", output: "Het team kan zonder opnieuw uitvragen verder." }
    ],
    core: [
      { title: "Natuurlijke intake", text: "De AI luistert, vraagt door en vat samen in normale taal." },
      { title: "Triage en urgentie", text: "Spoedcriteria en verboden beslissingen worden vooraf afgesproken." },
      { title: "Planning en routing", text: "Beschikbaarheid, regio, locatie en doorschakelregels sturen de vervolgactie." },
      { title: "Gespreksregistratie", text: "Samenvatting en actie worden aan de juiste klant of taak gekoppeld." }
    ],
    integrations: ["Telefonie", "Agenda", "CRM", "Werkbonnen", "Ticketing", "E-mail", "WhatsApp"],
    boundaries: [
      { title: "Geen autonome risicobeslissing", text: "Medische, veiligheids- en financiële uitzonderingen krijgen menselijke beoordeling." },
      { title: "Doorschakelen volgens regels", text: "Bereikbaarheid, tijden en noodroutes worden expliciet ingericht." },
      { title: "Koppeling eerst toetsen", text: "Afspraken en klantdata worden alleen verwerkt wanneer systemen dit veilig toestaan." }
    ],
    fit: [
      { title: "Sterke match", text: "Teams die tijdens uitvoering, behandeling of piekuren vaak niet kunnen opnemen." },
      { title: "Lichter kan", text: "Een eenvoudige terugbelservice kan genoeg zijn wanneer intake niet nodig is." },
      { title: "Combineer wanneer", text: "Inboxmedewerker en CRM passen wanneer gesprekken digitaal doorlopen en centraal moeten landen." }
    ],
    faq: [
      { question: "Kan de AI gesprekken doorschakelen?", answer: "Ja, volgens vooraf afgesproken tijden, teams, redenen en fallbackregels." },
      { question: "Wat gebeurt er bij spoed?", answer: "De AI volgt de vastgelegde triage. Situaties buiten het veilige kader worden direct geëscaleerd of naar een afgesproken noodroute gestuurd." },
      { question: "Kan de AI afspraken wijzigen?", answer: "Dat kan wanneer de agenda, rechten en wijzigingsregels dit toelaten." },
      { question: "Krijgt ons team een samenvatting?", answer: "Ja. De relevante gegevens, reden, urgentie en vervolgactie kunnen als notitie of taak worden vastgelegd." }
    ],
    calculator: { volumeLabel: "Oproepen per maand", minutesLabel: "Minuten per gesprek", automationLabel: "Deel dat AI kan opvangen", outputLabel: "Indicatieve telefoontijd vrijgemaakt" },
    seoTitle: "AI Telefoniste voor intake, triage en afspraken | Autopilots",
    metaDescription: "Bekijk hoe de AI Telefoniste oproepen aanneemt, vragen uitvraagt, urgentie bepaalt, afspraken plant, doorschakelt en gesprekken registreert."
  },
  {
    slug: "autopilots-crm",
    name: "Autopilots CRM",
    shortName: "CRM",
    eyebrow: "Klantdata en werkverdeling",
    hero: "AI en team werken vanuit",
    accent: "dezelfde klantcontext.",
    intro: "Brengt leads, gesprekken, afspraken, taken, pipelines en automatiseringen samen. Zo ziet iedereen wat er is gebeurd en welke actie nu nodig is.",
    promise: "De centrale werkplek waar AI-acties en menselijke acties samenkomen.",
    problemTitle: "Klantdata staat verspreid. Niemand ziet de volledige volgende stap.",
    problems: [
      { title: "Meerdere waarheden", text: "Mail, WhatsApp, agenda en spreadsheets vertellen ieder een ander verhaal." },
      { title: "Statussen lopen achter", text: "De pipeline wordt pas bijgewerkt wanneer iemand eraan denkt." },
      { title: "Taken zijn persoonsafhankelijk", text: "Opvolging verdwijnt wanneer een collega afwezig of druk is." },
      { title: "AI mist context", text: "Zonder centraal dossier kan een AI-medewerker niet verantwoord handelen." }
    ],
    workflow: [
      { label: "Contact", title: "Klant en historie komen samen", text: "Kanalen en eerdere acties worden aan één dossier gekoppeld.", output: "Het team ziet één actuele klantcontext." },
      { label: "Status", title: "Pipeline toont de fase", text: "Lead, afspraak, offerte, klant of servicevraag krijgt een duidelijke status.", output: "Iedereen ziet waar het proces staat." },
      { label: "Actie", title: "AI of medewerker voert uit", text: "Taak, bericht, afspraak of workflow volgt op basis van regels.", output: "De volgende stap hangt niet van geheugen af." },
      { label: "Inzicht", title: "Resultaat wordt zichtbaar", text: "Dashboard en rapportage tonen volume, voortgang en knelpunten.", output: "Optimalisatie begint bij echte procesdata." }
    ],
    core: [
      { title: "Centraal klantdossier", text: "Gesprekken, afspraken, taken en statussen staan bij elkaar." },
      { title: "Pipelines", text: "Fases, eigenaren en vervolgstappen worden helder beheerd." },
      { title: "Automatiseringen", text: "Reminders, no-showroutes en reviewverzoeken volgen vaste voorwaarden." },
      { title: "Samenwerking", text: "AI en medewerkers werken met dezelfde context en overdrachtsregels." }
    ],
    integrations: ["E-mail", "WhatsApp", "Telefonie", "Agenda", "Formulieren", "Webhooks", "Rapportage"],
    boundaries: [
      { title: "Geen migratie zonder inventarisatie", text: "Datakwaliteit, velden en historie worden eerst beoordeeld." },
      { title: "Rechten per rol", text: "Niet iedere medewerker of AI-actie krijgt dezelfde toegang." },
      { title: "Maatwerk waar nodig", text: "Complexe branchesystemen kunnen aanvullende ontwikkeling vragen." }
    ],
    fit: [
      { title: "Sterke match", text: "Teams met versnipperde kanalen, handmatige pipelines en meerdere opvolgers." },
      { title: "Lichter kan", text: "Een bestaand CRM kan blijven wanneer het alle benodigde acties betrouwbaar ondersteunt." },
      { title: "Combineer wanneer", text: "Ieder AI-product wordt sterker wanneer acties en context centraal worden vastgelegd." }
    ],
    faq: [
      { question: "Moeten we ons huidige CRM vervangen?", answer: "Niet altijd. We beoordelen eerst of het huidige systeem de gewenste acties, rechten en context ondersteunt." },
      { question: "Kunnen AI en medewerkers in dezelfde pipeline werken?", answer: "Ja. Taken, statussen en overdrachten worden zo ingericht dat duidelijk blijft wie of wat de volgende actie uitvoert." },
      { question: "Kunnen bestaande gegevens worden overgezet?", answer: "Dat hangt af van exportmogelijkheden, datakwaliteit en het gewenste veldmodel. Dit wordt vooraf geïnventariseerd." },
      { question: "Welke automatiseringen zijn mogelijk?", answer: "Onder meer opvolgtaken, reminders, no-showroutes en reviewverzoeken, binnen de mogelijkheden van de gekoppelde kanalen." }
    ],
    calculator: { volumeLabel: "Acties en updates per maand", minutesLabel: "Minuten administratie per actie", automationLabel: "Deel dat kan worden voorbereid", outputLabel: "Indicatieve administratietijd vrijgemaakt" },
    seoTitle: "Autopilots CRM voor AI-acties, pipelines en klantdata",
    metaDescription: "Breng klantdata, gesprekken, afspraken, taken, pipelines en AI-acties samen in Autopilots CRM. Bekijk de workflow en mogelijkheden per branche."
  },
  {
    slug: "leadsmachine-ai",
    name: "Leadsmachine AI",
    shortName: "Leadsmachine",
    eyebrow: "Van campagne naar klant",
    hero: "Van advertentieklik naar een",
    accent: "meetbare volgende stap.",
    intro: "Verbindt advertenties, landingspagina’s, intake, kwalificatie, WhatsApp, telefonie, planning en CRM tot één route van klik naar afspraak of klant.",
    promise: "Een geïntegreerd acquisitiesysteem, niet alleen advertenties draaien.",
    problemTitle: "Er wordt betaald voor aandacht, maar de route na de klik lekt.",
    problems: [
      { title: "Generieke landingspagina", text: "De bezoeker herkent zijn branche en concrete probleem onvoldoende." },
      { title: "Trage leadreactie", text: "Een dure lead wacht terwijl meerdere aanbieders tegelijk reageren." },
      { title: "Intake mist kwaliteit", text: "Sales belt terug zonder situatie, budget, planning of koopintentie." },
      { title: "Geen gesloten rapportage", text: "Klikken en leads zijn zichtbaar, maar afspraken en klanten niet." }
    ],
    workflow: [
      { label: "Campagne", title: "De juiste vraag wordt geraakt", text: "Advertentie en doelgroep sluiten aan op één herkenbaar probleem.", output: "De klik heeft een duidelijke verwachting." },
      { label: "Intake", title: "Landingspagina kwalificeert", text: "Branchevragen verzamelen context zonder onnodige drempels.", output: "De lead komt compleet binnen." },
      { label: "Opvolging", title: "AI reageert direct", text: "WhatsApp, telefonie of mail behandelt vragen en plant waar passend.", output: "Warme intentie krijgt direct een volgende stap." },
      { label: "Resultaat", title: "CRM sluit de route", text: "Bron, status, afspraak en uitkomst worden bij elkaar gebracht.", output: "Optimalisatie gaat verder dan alleen kosten per lead." }
    ],
    core: [
      { title: "Campagnestructuur", text: "Doelgroep, aanbod en route worden als één systeem ontworpen." },
      { title: "Branchelandingspagina", text: "Copy, intake en bewijs sluiten aan op de dagelijkse praktijk." },
      { title: "Directe opvolging", text: "Nieuwe leads krijgen ontvangst, kwalificatie en afspraakroute." },
      { title: "CRM en rapportage", text: "Van bron tot uitkomst blijft de lead meetbaar." }
    ],
    integrations: ["Meta", "LinkedIn", "Landingspagina", "Formulieren", "WhatsApp", "Telefonie", "CRM"],
    boundaries: [
      { title: "Geen omzetgarantie", text: "Resultaat hangt ook af van aanbod, markt, budget, sales en capaciteit." },
      { title: "Budget apart", text: "Advertentiebudget en externe gebruikskosten worden transparant onderscheiden." },
      { title: "Menselijke sales blijft belangrijk", text: "Complexe offertes en commerciële beslissingen blijven bij het team." }
    ],
    fit: [
      { title: "Sterke match", text: "Bedrijven die structureel nieuwe afspraken willen en capaciteit hebben om te leveren." },
      { title: "Lichter kan", text: "Bij voldoende organische instroom kan alleen leadopvolging al waarde leveren." },
      { title: "Combineer wanneer", text: "Telefoniste, Inboxmedewerker en CRM vormen samen de volledige route." }
    ],
    faq: [
      { question: "Is Leadsmachine AI alleen advertentiebeheer?", answer: "Nee. Het systeem omvat de route van campagne en landingspagina tot intake, opvolging, planning en CRM-resultaat." },
      { question: "Garandeert dit een aantal afspraken?", answer: "Nee. We bouwen en optimaliseren het systeem, maar markt, aanbod, budget en salescapaciteit blijven bepalend." },
      { question: "Kunnen we ons bestaande advertentieaccount gebruiken?", answer: "In veel gevallen wel. Toegang, historie en meetinrichting worden eerst gecontroleerd." },
      { question: "Hoe wordt leadkwaliteit verbeterd?", answer: "Door branchegerichte copy, passende intakevragen, directe opvolging en terugkoppeling van echte uitkomsten." }
    ],
    calculator: { volumeLabel: "Leads per maand", minutesLabel: "Minuten handwerk per lead", automationLabel: "Deel dat AI kan voorbereiden", outputLabel: "Indicatieve opvolgtijd vrijgemaakt" },
    seoTitle: "Leadsmachine AI: van advertentie naar afspraak en CRM",
    metaDescription: "Verbind advertenties, landingspagina’s, intake, AI-opvolging, afspraakplanning en CRM in één acquisitiesysteem met Leadsmachine AI."
  }
];

export const productBySlug = Object.fromEntries(products.map((product) => [product.slug, product])) as Record<ProductSlug, Product>;
