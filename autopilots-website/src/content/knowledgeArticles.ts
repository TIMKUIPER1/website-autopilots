import { researchKnowledgeArticles } from "./researchKnowledgeArticles";
import { strategicKnowledgeArticles } from "./strategicKnowledgeArticles";

export type KnowledgeArticle = {
  slug: string;
  category: string;
  label: string;
  readTime: string;
  title: string;
  accent: string;
  cardTitle: string;
  excerpt: string;
  description: string;
  intent: string;
  audience: string;
  promise: string;
  conversion: string;
  published: string;
  modified: string;
  reviewed?: string;
  author?: string;
  primaryKeyword?: string;
  searchIntent?: string;
  contentCluster?: string;
  pillar?: boolean;
  relatedArticles?: string[];
  relatedProducts?: string[];
  relatedNiches?: string[];
  keywords: string[];
  summary: string[];
  sections: {
    id: string;
    eyebrow: string;
    title: string;
    paragraphs: string[];
    bullets?: string[];
  }[];
  examples?: {
    title: string;
    text: string;
  }[];
  faq: {
    question: string;
    answer: string;
  }[];
  related: {
    label: string;
    title: string;
    href: string;
  }[];
  sources: {
    label: string;
    href: string;
  }[];
};

export const legacyKnowledgeArticles: KnowledgeArticle[] = [
  {
    slug: "wat-betekenen-ai-agents-voor-klantcontact",
    category: "OpenAI agents",
    label: "Nieuw",
    readTime: "7 min",
    title: "Wat betekenen AI agents voor klantcontact?",
    accent: "klantcontact.",
    cardTitle: "Wat betekenen AI agents voor klantcontact?",
    excerpt:
      "Een praktische uitleg over agents die vragen begrijpen, context ophalen, acties uitvoeren en alles terugrapporteren in CRM.",
    description:
      "Lees wat AI agents betekenen voor klantcontact, CRM, opvolging, servicevragen, planning en overdracht naar medewerkers.",
    intent: "Informatief onderzoek naar AI agents voor klantenservice, sales en CRM.",
    audience: "Ondernemers, marketeers, sales managers en service teams.",
    promise: "Je snapt wat een AI agent doet, wanneer het nuttig is en hoe je het veilig inzet.",
    conversion: "Bekijk welke klantcontactflow als eerste geautomatiseerd kan worden.",
    published: "2026-06-19",
    modified: "2026-06-19",
    keywords: [
      "AI agents klantcontact",
      "AI agent CRM",
      "AI klantenservice automatiseren",
      "AI medewerker klantcontact",
      "OpenAI agents bedrijf"
    ],
    summary: [
      "Een AI agent is geen simpele chatbot. Het is een digitale medewerker die een doel krijgt, context ophaalt, vervolgstappen kiest en acties kan uitvoeren.",
      "Voor klantcontact betekent dit dat vragen niet alleen beantwoord worden, maar ook verwerkt worden in CRM, planning, tickets, offertes of follow-up.",
      "De winst zit vooral in snelheid, consistentie en minder losse handmatige taken rond ieder klantgesprek."
    ],
    sections: [
      {
        id: "wat-is-een-ai-agent",
        eyebrow: "Betekenis",
        title: "Wat is een AI agent in klantcontact?",
        paragraphs: [
          "Een AI agent is een AI medewerker die verder gaat dan antwoorden geven. De agent begrijpt de vraag, bepaalt wat er nodig is, gebruikt beschikbare bedrijfsinformatie en voert daarna een passende actie uit. Denk aan een afspraak boeken, een leadstatus aanpassen, een samenvatting maken, een ticket aanmaken of een medewerker inschakelen.",
          "In klantcontact wordt het verschil meteen zichtbaar. Een gewone chatbot zegt: \"Ik kan je helpen met een afspraak.\" Een goede AI agent controleert de agenda, vraagt de juiste gegevens uit, kijkt of de aanvraag spoed heeft, plant het juiste type afspraak en zet alle context terug in het CRM. Dat is een ander niveau van bruikbaarheid.",
          "Voor Google en LLM's is het belangrijk om deze term concreet te gebruiken. AI agents voor klantcontact gaan over intentieherkenning, CRM-verwerking, workflow automation, gesprekssamenvattingen, fallbackregels, menselijke overdracht en meetbare opvolging."
        ],
        bullets: [
          "De agent begrijpt intentie: vraag, klacht, spoed, offerte, planning of support.",
          "De agent gebruikt context: klantgegevens, openingstijden, aanbod, regio, prijzen en afspraken.",
          "De agent voert acties uit: CRM-update, agenda-afspraak, mail, WhatsApp, taak of ticket.",
          "De agent rapporteert terug: transcript, samenvatting, status en volgende actie."
        ]
      },
      {
        id: "waarom-nu",
        eyebrow: "Waarom nu",
        title: "Waarom AI agents juist nu interessant zijn voor bedrijven",
        paragraphs: [
          "Bedrijven hebben al jaren formulieren, chatwidgets en automatische mails. Het probleem is dat die systemen vaak niet echt meedenken. Ze verzamelen informatie, maar leggen geen context. Ze sturen door, maar lossen niet op. Ze maken een taak, maar bewaken de opvolging niet.",
          "AI agents veranderen dat omdat ze taal kunnen combineren met bedrijfsregels en tools. Ze kunnen een klantgesprek lezen alsof het een medewerker is, maar daarna ook volgens vaste regels handelen. Dat maakt ze interessant voor ondernemers die veel klantvragen, terugbelverzoeken, offertevragen of serviceverzoeken krijgen.",
          "De beste toepassing is niet meteen alles automatiseren. Begin met een smalle klantreis waar snelheid veel waard is. Bijvoorbeeld gemiste telefoontjes opvolgen, websitevragen kwalificeren, storingen triageren of open offertes nabellen."
        ]
      },
      {
        id: "crm-en-acties",
        eyebrow: "CRM acties",
        title: "De echte waarde zit in CRM, planning en opvolging",
        paragraphs: [
          "Een AI agent zonder CRM-koppeling blijft vaak een losse assistent. Leuk, maar beperkt. Zodra de agent gekoppeld wordt aan CRM, agenda, inbox, WhatsApp of ticketing, ontstaat er een werkend klantcontactsysteem. De vraag komt binnen, de AI begrijpt wat er speelt en de uitkomst wordt direct opgeslagen.",
          "Dat is precies waar veel bedrijven tijd verliezen. Niet aan het beantwoorden van een vraag, maar aan alles eromheen: gegevens overtypen, notities maken, status wijzigen, collega taggen, afspraak bevestigen en later nog eens opvolgen. Een agent kan dat netjes en voorspelbaar doen.",
          "Voor sales betekent dit snellere leadkwalificatie. Voor service betekent dit betere triage. Voor planning betekent dit minder heen-en-weer bellen. Voor management betekent dit schonere data: je ziet waar aanvragen vandaan komen, welke vragen terugkomen en waar bottlenecks ontstaan."
        ],
        bullets: [
          "Nieuwe lead automatisch verrijken met bron, behoefte, urgentie en budget.",
          "Servicevraag indelen op spoed, locatie, klanttype en benodigde monteur.",
          "Offerte-opvolging starten op basis van datum, interesse en eerdere reactie.",
          "Gespreksverslag opslaan zodat een medewerker zonder opnieuw vragen kan overnemen."
        ]
      },
      {
        id: "veilig-inrichten",
        eyebrow: "Inrichting",
        title: "Hoe richt je een AI agent veilig en betrouwbaar in?",
        paragraphs: [
          "Een sterke AI agent begint niet bij techniek, maar bij afbakening. Wat mag de agent zelfstandig doen? Wanneer moet hij doorzetten naar een mens? Welke informatie mag hij wel en niet gebruiken? Welke toon past bij je bedrijf? Welke uitzonderingen komen vaak voor?",
          "Daarom werken goede agents met een kennisbasis, gesprekslogica, toolrechten en fallbackregels. De agent krijgt geen vage opdracht als \"help klanten\", maar een duidelijke taak. Bijvoorbeeld: kwalificeer daklekkagevragen, verzamel adres en urgentie, controleer servicegebied, plan alleen inspecties binnen beschikbare blokken en zet spoed buiten werktijd door naar de storingsdienst.",
          "Zo blijft AI menselijker dan veel standaard automatisering. Niet omdat de techniek gezellig doet, maar omdat de klant minder hoeft te herhalen en sneller bij de juiste oplossing komt."
        ]
      }
    ],
    examples: [
      {
        title: "Voorbeeld: gemist telefoontje",
        text: "De agent belt terug, vraagt waarvoor de klant belde, checkt of er spoed is, plant een afspraak en zet de samenvatting in CRM."
      },
      {
        title: "Voorbeeld: offerte-opvolging",
        text: "De agent ziet dat een offerte zeven dagen openstaat, vraagt of er nog vragen zijn en plant een belmoment met sales als de klant interesse toont."
      }
    ],
    faq: [
      {
        question: "Is een AI agent hetzelfde als een chatbot?",
        answer:
          "Nee. Een chatbot beantwoordt vooral vragen. Een AI agent kan ook context ophalen, beslissingen volgen, acties uitvoeren en terugrapporteren in CRM of andere systemen."
      },
      {
        question: "Kan een AI agent klantcontact volledig overnemen?",
        answer:
          "Soms voor eenvoudige stromen, maar meestal werkt het beter als eerste lijn. De agent vangt op, kwalificeert, verwerkt en draagt complexe gevallen met context over aan een medewerker."
      },
      {
        question: "Welke bedrijven hebben het meest aan AI agents?",
        answer:
          "Bedrijven met veel herhaalvragen, gemiste oproepen, offerte-opvolging, serviceverzoeken, planning of CRM-handwerk merken meestal het snelst resultaat."
      }
    ],
    related: [
      { label: "Product", title: "Bekijk Voice AI voor telefonische opvang.", href: "/nl/producten/" },
      { label: "Proces", title: "Zo bouwen we een AI-brein met regels en context.", href: "/nl/proces/" },
      { label: "Afspraak", title: "Bespreek welke klantreis geschikt is.", href: "/nl/afspraak/" }
    ],
    sources: [
      { label: "OpenAI Agents documentatie", href: "https://platform.openai.com/docs/guides/agents" },
      { label: "Google richtlijnen voor AI features in Search", href: "https://developers.google.com/search/docs/appearance/ai-features" }
    ]
  },
  {
    slug: "claude-openai-of-beide-wanneer-gebruik-je-welke-ai",
    category: "Claude workflows",
    label: "Actueel",
    readTime: "6 min",
    title: "Claude, OpenAI of beide: wanneer gebruik je welke AI?",
    accent: "welke AI.",
    cardTitle: "Claude, OpenAI of beide: wanneer gebruik je welke AI?",
    excerpt:
      "Geen toolstrijd, maar een heldere keuzehulp voor research, documenten, klantcommunicatie en automatisering.",
    description:
      "Praktische vergelijking tussen Claude en OpenAI voor ondernemers: research, documenten, voice, agents, workflows en klantcontact.",
    intent: "Vergelijkend onderzoek naar Claude vs OpenAI voor zakelijk gebruik.",
    audience: "Ondernemers, teams en consultants die AI professioneel willen inzetten.",
    promise: "Je weet wanneer Claude, OpenAI of een combinatie logisch is.",
    conversion: "Laat een AI workflow ontwerpen rond je echte bedrijfsproces.",
    published: "2026-06-19",
    modified: "2026-06-19",
    keywords: ["Claude vs OpenAI", "beste AI voor bedrijf", "AI workflows", "OpenAI Claude vergelijken", "AI tools kiezen"],
    summary: [
      "Gebruik niet blind een model omdat het populair is. Kies op taak: research, schrijven, redeneren, documenten, voice, agents, snelheid en integraties.",
      "OpenAI is vaak sterk voor agents, realtime voice, toolgebruik en productieflows. Claude wordt vaak gekozen voor lange context, documentwerk, zorgvuldige analyse en schrijfwerk.",
      "In serieuze automatisering gebruik je soms beide: het beste model per stap, met duidelijke regels, logging en menselijke controle."
    ],
    sections: [
      {
        id: "geen-toolstrijd",
        eyebrow: "Keuzehulp",
        title: "Het gaat niet om Claude tegen OpenAI, maar om de juiste taak",
        paragraphs: [
          "De vraag \"is Claude beter dan OpenAI?\" klinkt logisch, maar is eigenlijk te plat. Een ondernemer zoekt geen modelwinnaar. Die zoekt een betrouwbare manier om werk sneller, slimmer en consistenter te doen.",
          "Daarom kijk je per taak. Moet de AI bellen, luisteren en direct reageren? Dan kijk je naar realtime voice en latency. Moet de AI lange documenten lezen en samenvatten? Dan kijk je naar contextvenster, nauwkeurigheid en schrijfstijl. Moet de AI acties uitvoeren in CRM? Dan kijk je naar agents, toolrechten en logging.",
          "Een goede AI workflow is dus modelbewust. Niet elk onderdeel hoeft door hetzelfde model gedaan te worden. Net zoals je niet dezelfde medewerker gebruikt voor sales, administratie, analyse en planning."
        ]
      },
      {
        id: "openai-sterktes",
        eyebrow: "OpenAI",
        title: "Wanneer OpenAI logisch is",
        paragraphs: [
          "OpenAI is sterk wanneer AI onderdeel wordt van een interactief systeem. Denk aan AI agents, Chat AI, Voice AI, realtime gesprekken, toolgebruik, CRM-acties en workflows waarin snelheid telt. Voor klantcontact is dat belangrijk, omdat de AI niet alleen moet denken, maar ook moet handelen.",
          "Bij een websitechat of voice agent moet de AI snel begrijpen wat de klant bedoelt, vervolgvragen stellen, data ophalen en daarna iets doen. Een afspraak plannen. Een leadstatus aanpassen. Een samenvatting maken. Een mail sturen. Dat vraagt om een model dat goed samenwerkt met tools en vaste procesregels.",
          "OpenAI is daarom vaak een logische basis voor productie-waardige klantcontactautomatisering, vooral wanneer voice, chat, actions en monitoring samenkomen."
        ],
        bullets: [
          "Realtime voice en telefonische AI gesprekken.",
          "AI agents die tools gebruiken en acties uitvoeren.",
          "Chatflows met CRM, agenda, tickets en follow-up.",
          "Productiesystemen waar snelheid, logging en stabiliteit belangrijk zijn."
        ]
      },
      {
        id: "claude-sterktes",
        eyebrow: "Claude",
        title: "Wanneer Claude logisch is",
        paragraphs: [
          "Claude is vaak prettig bij lang documentwerk, analyse, redactie, kennisverwerking en zorgvuldige nuance. Als je veel beleid, offertes, intakeverslagen, rapporten of documentatie moet verwerken, kan Claude een sterke rol spelen in de workflow.",
          "Denk aan het samenvatten van grote klantdossiers, het vergelijken van contractversies, het redigeren van lange kennisbankartikelen of het structureren van interne werkinstructies. Daar wil je rust, consistentie en een model dat netjes met context omgaat.",
          "Voor bedrijven is Claude dus interessant als kenniswerker in een proces: lezen, ordenen, uitleggen, samenvatten en voorbereiden. Daarna kan een andere stap in de workflow de actie uitvoeren."
        ],
        bullets: [
          "Lange documenten lezen en ordenen.",
          "Researchnotities omzetten naar begrijpelijke teksten.",
          "Interne kennisbank en werkinstructies structureren.",
          "Offertes, beleidsstukken en klantdossiers analyseren."
        ]
      },
      {
        id: "beide-gebruiken",
        eyebrow: "Workflow",
        title: "Wanneer gebruik je beide modellen in een workflow?",
        paragraphs: [
          "In volwassen AI-systemen is \"beide\" vaak het slimste antwoord. Bijvoorbeeld: Claude verwerkt een lang document of klantdossier, OpenAI voert daarna een klantgesprek en schrijft de actie terug naar CRM. Of OpenAI verzamelt intakegegevens via chat, terwijl Claude de inhoud omzet naar een nette projectbrief.",
          "Het voordeel is dat elk model doet waar het goed in is. Het nadeel is dat je workflow strakker ontworpen moet worden. Je wilt weten welk model welke stap doet, welke output verplicht is en wanneer een mens meekijkt.",
          "Daarom begint een goede AI keuze niet met een abonnement, maar met een proceskaart. Welke informatie komt binnen? Welke beslissing is nodig? Welke actie volgt? Welke data moet terug naar CRM? Pas daarna kies je Claude, OpenAI of een combinatie."
        ]
      }
    ],
    examples: [
      {
        title: "Research naar klantvraag",
        text: "Claude vat documenten samen, OpenAI zet de uitkomst om naar een klantgesprek met vervolgactie."
      },
      {
        title: "Voice AI met kennisbasis",
        text: "OpenAI voert het realtime gesprek, terwijl de kennisbasis vooraf met Claude is opgeschoond en gestructureerd."
      }
    ],
    faq: [
      {
        question: "Is Claude beter dan OpenAI voor bedrijven?",
        answer:
          "Niet algemeen. Claude is vaak sterk voor lang documentwerk en analyse. OpenAI is vaak logisch voor agents, realtime voice, toolgebruik en klantcontactflows."
      },
      {
        question: "Kan ik Claude en OpenAI samen gebruiken?",
        answer:
          "Ja. In workflows kan het slim zijn om per stap het beste model te kiezen, zolang output, logging, rechten en menselijke controle goed zijn ingericht."
      },
      {
        question: "Waar begin ik als ondernemer?",
        answer:
          "Begin met een concrete workflow, bijvoorbeeld offerte-opvolging, intake, support of planning. Daarna kies je het model dat past bij die taak."
      }
    ],
    related: [
      { label: "Kennis", title: "Lees over AI agents voor klantcontact.", href: "/nl/kennisbank/wat-betekenen-ai-agents-voor-klantcontact/" },
      { label: "Producten", title: "Bekijk Chat AI, Voice AI en Follow-up AI.", href: "/nl/producten/" },
      { label: "Proces", title: "Ontwerp eerst de workflow.", href: "/nl/proces/" }
    ],
    sources: [
      { label: "OpenAI Agents documentatie", href: "https://platform.openai.com/docs/guides/agents" },
      { label: "Anthropic Claude modeldocumentatie", href: "https://docs.anthropic.com/en/docs/about-claude/models/overview" }
    ]
  },
  {
    slug: "ai-voor-installatiebedrijven-dakdekkers-en-servicebedrijven",
    category: "AI voor branches",
    label: "Niche",
    readTime: "8 min",
    title: "AI voor installatiebedrijven, dakdekkers en servicebedrijven.",
    accent: "servicebedrijven.",
    cardTitle: "AI voor installatiebedrijven, dakdekkers en servicebedrijven.",
    excerpt:
      "Hoe AI storingen, spoedvragen, planning, offertes en klantupdates sneller kan verwerken zonder persoonlijke service te verliezen.",
    description:
      "Praktische SEO uitleg over AI voor installatiebedrijven, dakdekkers en servicebedrijven: storingen, spoedvragen, planning, offertes en CRM.",
    intent: "Nichegerichte zoektocht naar AI automatisering voor servicebedrijven.",
    audience: "Installateurs, dakdekkers, onderhoudsbedrijven en serviceorganisaties.",
    promise: "Je ziet waar AI direct werk uit handen neemt zonder het contact koud te maken.",
    conversion: "Laat je storingsflow, planning of offerte-opvolging doorlichten.",
    published: "2026-06-19",
    modified: "2026-06-19",
    keywords: [
      "AI voor installatiebedrijven",
      "AI voor dakdekkers",
      "AI servicebedrijf",
      "AI storingsdienst",
      "AI planning monteurs"
    ],
    summary: [
      "AI is voor installatiebedrijven en dakdekkers vooral interessant bij spoed, planning, intake en opvolging.",
      "Een AI medewerker kan telefoontjes aannemen, urgentie bepalen, gegevens verzamelen, klanten op de hoogte houden en alles in CRM of planning zetten.",
      "De beste start is een concrete flow: storing melden, lekkage intake, offerte opvolgen, afspraak verplaatsen of klantupdate sturen."
    ],
    sections: [
      {
        id: "waarom-juist-deze-branches",
        eyebrow: "Niche",
        title: "Waarom AI juist past bij installatie, dakwerk en service",
        paragraphs: [
          "Installatiebedrijven, dakdekkers en servicebedrijven hebben vaak hetzelfde probleem: klantcontact komt binnen op momenten dat het team eigenlijk ergens anders nodig is. Monteurs zijn onderweg. Planners zitten vol. Spoedvragen moeten snel. Offertes moeten opgevolgd. En ondertussen verwacht de klant gewoon duidelijkheid.",
          "AI helpt hier niet omdat het hip is, maar omdat veel contactmomenten een vaste structuur hebben. Waar is de storing? Is er spoed? Wat is het adres? Is het een bestaande klant? Zijn er foto's? Welke regio? Welke monteur of ploeg kan dit oppakken? Wanneer is iemand thuis?",
          "Dat zijn perfecte vragen voor een AI medewerker. De AI hoeft geen vakman te vervangen. Hij moet zorgen dat de vakman betere informatie krijgt voordat hij tijd kwijt is."
        ]
      },
      {
        id: "spoed-en-triage",
        eyebrow: "Spoed",
        title: "AI voor storingen, lekkages en spoedvragen",
        paragraphs: [
          "Bij spoed telt snelheid. Een daklekkage, CV-storing, elektrische storing of verstopping wordt vaak op meerdere plekken tegelijk gemeld: telefoon, WhatsApp, websiteformulier of mail. Als niemand direct reageert, belt de klant door naar de volgende partij.",
          "Een AI agent kan de eerste opvang doen. Hij vraagt door op urgentie, locatie, veiligheid, type probleem, beschikbaarheid en foto's. Daarna bepaalt hij volgens vaste regels of het spoed is, of het binnen servicegebied valt en welke vervolgstap logisch is.",
          "Belangrijk: de AI moet niet doen alsof hij monteur is. Hij moet triage doen, informatie verzamelen, verwachtingen managen en de overdracht voorbereiden. Juist daardoor voelt de service persoonlijker, omdat de klant sneller duidelijkheid krijgt."
        ],
        bullets: [
          "Daklekkage intake met foto's, adres, type dak en urgentie.",
          "CV-storing intake met merk, foutcode, bouwjaar en veiligheidssituatie.",
          "Elektrastoring intake met risico-inschatting en doorzetregels.",
          "Serviceverzoek koppelen aan bestaande klant, contract of locatie."
        ]
      },
      {
        id: "planning",
        eyebrow: "Planning",
        title: "AI planning voor monteurs, routes en klantupdates",
        paragraphs: [
          "Planning is vaak het zenuwcentrum van een servicebedrijf. Een afspraak lijkt simpel, totdat regio, reistijd, urgentie, materiaal, type klus en beschikbaarheid samenkomen. Een standaard formulier snapt dat niet. Een goed ingerichte AI medewerker kan wel de juiste gegevens verzamelen en de planner voorbereiden.",
          "De AI kan beschikbare blokken tonen, een voorkeur ophalen, een afspraak bevestigen en klanten automatisch updaten. Bij complexere planning hoeft de AI niet zelfstandig te beslissen. Hij kan een compleet voorbereid planningsverzoek aanmaken, zodat een medewerker alleen nog hoeft te kiezen.",
          "Dat scheelt vooral bij kleine verstoringen: afspraak verplaatsen, monteur onderweg, extra informatie nodig, klant niet thuis, offertevraag na bezoek. Het zijn geen grote strategieprojecten. Het zijn precies de dagelijkse fricties die tijd opslokken."
        ]
      },
      {
        id: "offertes-en-opvolging",
        eyebrow: "Offertes",
        title: "AI voor offertes, terugbelverzoeken en opvolging",
        paragraphs: [
          "Veel omzet blijft liggen na het eerste contact. Een klant vraagt een offerte aan, krijgt een prijs, twijfelt, stelt nog een vraag en verdwijnt daarna uit beeld. Niet omdat er geen interesse is, maar omdat opvolging druk en handmatig is.",
          "Follow-up AI kan open offertes slim opvolgen. Niet met een generieke reminder, maar met context: welk aanbod, welke datum, welke vragen, welke bezwaren en welke vervolgstap. De AI kan vragen beantwoorden, een belmoment plannen of de lead warm terugzetten naar sales.",
          "Voor installatiebedrijven en dakdekkers is dat waardevol omdat offertes vaak tijdsgevoelig zijn. Een lekkage, renovatie, verduurzaming of onderhoudsbeurt heeft momentum. Wie snel, duidelijk en netjes opvolgt, wint vaker."
        ]
      }
    ],
    examples: [
      {
        title: "Dakdekker",
        text: "AI vraagt foto's, locatie, type dak, lekkageplek en spoed uit, zet alles in CRM en stuurt de juiste belofte naar de klant."
      },
      {
        title: "Installateur",
        text: "AI verzamelt foutcode, toestelgegevens, adres en beschikbaarheid, zodat de planner direct een bruikbare werkbon heeft."
      }
    ],
    faq: [
      {
        question: "Kan AI technische vragen van klanten beantwoorden?",
        answer:
          "Ja, binnen een goed ingerichte kennisbasis en met duidelijke grenzen. Bij risico, garantie, veiligheid of complexe techniek moet de AI doorzetten naar een medewerker."
      },
      {
        question: "Is AI geschikt voor spoedservice?",
        answer:
          "Ja, vooral voor eerste opvang en triage. De AI verzamelt gegevens, bepaalt urgentie volgens regels en schakelt de juiste menselijke route in."
      },
      {
        question: "Vervangt AI de planner?",
        answer:
          "Meestal niet. AI neemt intake, klantupdates, eenvoudige boekingen en voorbereiding over. De planner houdt controle over complexe capaciteit en uitzonderingen."
      }
    ],
    related: [
      { label: "Branches", title: "Bekijk hoe Autopilots branches opbouwt.", href: "/#branches" },
      { label: "Producten", title: "Planning AI, Voice AI en Follow-up AI.", href: "/nl/producten/" },
      { label: "Afspraak", title: "Laat je serviceflow analyseren.", href: "/nl/afspraak/" }
    ],
    sources: [
      { label: "Google helpful content richtlijnen", href: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content" },
      { label: "OpenAI Agents documentatie", href: "https://platform.openai.com/docs/guides/agents" }
    ]
  },
  {
    slug: "waarom-ai-zoekgedrag-je-seo-strategie-verandert",
    category: "AI zoeken",
    label: "SEO",
    readTime: "5 min",
    title: "Waarom AI zoekgedrag je SEO strategie verandert.",
    accent: "verandert.",
    cardTitle: "Waarom AI zoekgedrag je SEO strategie verandert.",
    excerpt:
      "Mensen zoeken steeds vaker in AI-antwoorden. Daarom moeten kennisbankartikelen concreet, betrouwbaar en goed gestructureerd zijn.",
    description:
      "AI zoekgedrag verandert SEO: lees hoe je content schrijft voor Google, AI Overviews, AI Mode en LLM vindbaarheid.",
    intent: "SEO onderzoek naar AI zoeken, AI Overviews en LLM vindbaarheid.",
    audience: "Ondernemers, SEO-specialisten, marketeers en contentteams.",
    promise: "Je weet hoe je pagina's schrijft die Google en AI-systemen beter begrijpen.",
    conversion: "Maak van je kennisbank een vindbare AI-route voor klanten.",
    published: "2026-06-19",
    modified: "2026-06-19",
    keywords: ["AI zoekgedrag SEO", "SEO voor AI Overviews", "LLM vindbaarheid", "AI Mode SEO", "kennisbank SEO"],
    summary: [
      "SEO draait minder om losse keywords en meer om duidelijke antwoorden, entiteiten, bewijs, context en structuur.",
      "AI-systemen halen graag informatie uit pagina's die vragen direct beantwoorden, goed gestructureerd zijn en concrete voorbeelden geven.",
      "Een kennisbank moet daarom niet alleen ranken, maar ook geciteerd, samengevat en begrepen kunnen worden door LLM's."
    ],
    sections: [
      {
        id: "wat-verandert-er",
        eyebrow: "AI zoeken",
        title: "Wat verandert er door AI Overviews, AI Mode en LLM's?",
        paragraphs: [
          "Mensen zoeken steeds minder alleen met losse woorden. Ze stellen langere vragen. Ze vergelijken opties. Ze verwachten een direct antwoord. En ze krijgen steeds vaker een AI-samenvatting voordat ze klassieke blauwe links bekijken.",
          "Dat betekent niet dat SEO dood is. Het betekent dat slordige SEO minder werkt. Pagina's moeten duidelijker zijn. Een artikel moet direct uitleggen waar het over gaat, voor wie het is, wat het antwoord is en welke vervolgstap logisch is.",
          "Voor Autopilots is dit juist gunstig. AI, klantcontact, agents, voice, CRM en automatisering zijn onderwerpen waar mensen uitleg nodig hebben. Wie daar helder, specifiek en betrouwbaar over schrijft, bouwt vindbaarheid op in Google én in AI-antwoorden."
        ]
      },
      {
        id: "schrijf-voor-antwoorden",
        eyebrow: "Antwoord",
        title: "Schrijf pagina's die een AI-systeem makkelijk kan samenvatten",
        paragraphs: [
          "Een LLM houdt van heldere betekenis. Dat betekent: een duidelijke H1, korte definitie bovenaan, H2's rond echte vragen, voorbeelden, lijstjes, FAQ's en consistente termen. Niet omdat lijstjes magisch ranken, maar omdat structuur helpt om de inhoud te begrijpen.",
          "Een pagina over Voice AI moet dus niet beginnen met \"ontdek de kracht van innovatie\". Begin met: Voice AI is een AI medewerker die telefoontjes aanneemt, vragen stelt, afspraken plant en gesprekssamenvattingen terugzet in CRM. Dat is direct bruikbaar.",
          "Daarna bouw je diepte op. Wanneer werkt het? Wanneer niet? Wat kost het? Welke software is nodig? Wat gebeurt er bij uitzonderingen? Welke voorbeelden zijn herkenbaar voor een branche?"
        ],
        bullets: [
          "Gebruik de exacte zoekvraag in H1 of H2.",
          "Geef binnen 80 woorden een direct antwoord.",
          "Herhaal kerntermen natuurlijk: AI agent, CRM, klantcontact, voice, opvolging.",
          "Voeg FAQ's toe rond bezwaren en vervolgvragen.",
          "Link intern naar producten, proces, branches en afspraak."
        ]
      },
      {
        id: "entities",
        eyebrow: "Entiteiten",
        title: "Gebruik slimme entiteiten in plaats van keyword stuffing",
        paragraphs: [
          "Keyword stuffing voelt goedkoop en helpt de lezer niet. Moderne SEO draait veel meer om onderwerpdekking. Een artikel over AI agents moet ook woorden bevatten als toolgebruik, workflow, CRM, intentieherkenning, context, fallback, menselijke overdracht en gesprekslogica.",
          "Dat zijn geen willekeurige synoniemen. Het zijn entiteiten rondom het onderwerp. Ze laten zien dat de pagina het domein begrijpt. Dat is nuttig voor Google, voor AI-systemen en vooral voor de lezer.",
          "Voor nichepagina's werkt hetzelfde. Een artikel over AI voor dakdekkers moet lekkage, spoed, foto's, adres, type dak, planning, inspectie, offerte en servicegebied noemen. Zo voelt de pagina specifiek, niet generiek."
        ]
      },
      {
        id: "kennisbank-als-systeem",
        eyebrow: "Kennisbank",
        title: "Maak van je kennisbank een route, geen rommelige bloglijst",
        paragraphs: [
          "Een losse blog kan ranken. Een goede kennisbank bouwt autoriteit. De bezoeker moet logisch kunnen bewegen van algemene AI uitleg naar een toepassing, van toepassing naar branchevoorbeeld en van branchevoorbeeld naar afspraak.",
          "Daarom werkt een route met AI kennis en Autopilots kennis. AI kennis legt ontwikkelingen uit: agents, Claude, OpenAI, Voice AI, AI zoeken. Autopilots kennis laat zien hoe die ideeën worden omgezet naar klantreizen, AI-breinen, CRM-acties, livegang en optimalisatie.",
          "Zo bouw je een contentnetwerk dat niet alleen zoekverkeer trekt, maar ook vertrouwen opbouwt. Dat is precies wat nodig is in een markt waar iedereen AI roept en bijna niemand concreet uitlegt wat er maandag in het bedrijf verandert."
        ]
      }
    ],
    examples: [
      {
        title: "Slechte SEO zin",
        text: "Onze AI oplossing transformeert je business met next-level technologie."
      },
      {
        title: "Sterke SEO zin",
        text: "Een AI agent neemt klantvragen aan, kwalificeert intentie en schrijft de vervolgstap terug naar CRM."
      }
    ],
    faq: [
      {
        question: "Moet ik anders schrijven door AI Overviews?",
        answer:
          "Ja. Schrijf directer, specifieker en beter gestructureerd. Geef korte antwoorden bovenaan en bouw daarna diepte, voorbeelden en FAQ's op."
      },
      {
        question: "Hoe word je vindbaar in LLM's?",
        answer:
          "Door duidelijke, betrouwbare en entiteitsrijke content te publiceren die vragen compleet beantwoordt en logisch intern gelinkt is."
      },
      {
        question: "Zijn keywords nog belangrijk?",
        answer:
          "Ja, maar niet als losse herhaling. Gebruik zoektermen natuurlijk in H1, H2, intro, voorbeelden en FAQ's, aangevuld met relevante termen rond het onderwerp."
      }
    ],
    related: [
      { label: "Artikel", title: "Bekijk hoe een sterk kennisbankartikel is opgebouwd.", href: "/nl/kennisbank/wat-betekenen-ai-agents-voor-klantcontact/" },
      { label: "Proces", title: "Van kennis naar systeem.", href: "/nl/proces/" },
      { label: "Afspraak", title: "Bespreek je kennisbankroute.", href: "/nl/afspraak/" }
    ],
    sources: [
      { label: "Google AI features en Search", href: "https://developers.google.com/search/docs/appearance/ai-features" },
      { label: "Google helpful content richtlijnen", href: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content" }
    ]
  },
  {
    slug: "wanneer-is-voice-ai-beter-dan-een-formulier",
    category: "Voice AI",
    label: "Voice",
    readTime: "6 min",
    title: "Wanneer is Voice AI beter dan een formulier?",
    accent: "formulier.",
    cardTitle: "Wanneer is Voice AI beter dan een formulier?",
    excerpt:
      "Voice AI werkt vooral bij spoed, complexe vragen, offertes, intake en opvolging waar snelheid direct omzet of rust oplevert.",
    description:
      "Wanneer kies je Voice AI in plaats van een formulier? Praktische uitleg over telefonische AI, intake, spoed, offertes en CRM.",
    intent: "Informatieve vergelijking tussen Voice AI en formulieren.",
    audience: "Bedrijven die veel telefoontjes, intakevragen of terugbelverzoeken krijgen.",
    promise: "Je weet wanneer voice meer oplevert dan een webformulier.",
    conversion: "Test welke telefoongesprekken geschikt zijn voor Voice AI.",
    published: "2026-06-19",
    modified: "2026-06-19",
    keywords: ["Voice AI formulier", "AI telefoon opnemen", "Voice AI klantcontact", "telefonische AI", "AI intake gesprek"],
    summary: [
      "Een formulier is prima voor simpele, niet-dringende informatie. Voice AI is beter wanneer snelheid, nuance, vertrouwen of doorvragen belangrijk is.",
      "Voice AI kan telefoontjes aannemen, terugbellen, intake doen, afspraken plannen en gesprekssamenvattingen in CRM zetten.",
      "De keuze hangt af van intentie: hoe hoger de urgentie of waarde van de aanvraag, hoe vaker voice wint."
    ],
    sections: [
      {
        id: "formulier-of-gesprek",
        eyebrow: "Keuze",
        title: "Een formulier verzamelt data. Voice AI voert een gesprek.",
        paragraphs: [
          "Een formulier is handig als de vraag simpel is. Naam, e-mail, telefoonnummer, bericht. Klaar. Maar zodra een klant onzeker is, spoed heeft of meerdere opties moet uitleggen, voelt een formulier snel stroef.",
          "Voice AI werkt anders. De klant praat gewoon. De AI luistert, vraagt door, vat samen en kan daarna een actie uitvoeren. Dat maakt voice sterker bij situaties waar een gesprek normaal gesproken sneller is dan een formulier.",
          "Denk aan storingen, offertevragen, intakegesprekken, terugbelverzoeken, afspraakplanning en opvolging. Precies de momenten waarop een gemiste aanvraag geld of onrust kost."
        ]
      },
      {
        id: "wanneer-voice-wint",
        eyebrow: "Voice wint",
        title: "Wanneer is Voice AI beter dan een formulier?",
        paragraphs: [
          "Voice AI is vooral beter wanneer de klant niet precies weet wat hij moet invullen. Bij een lekkage wil iemand uitleggen wat er gebeurt. Bij een cosmetische intake wil iemand nuance kwijt. Bij een offerte wil iemand vragen stellen. Bij een serviceprobleem wil iemand gehoord worden.",
          "Een AI telefoonmedewerker kan dan de juiste volgorde aanbrengen. Eerst geruststellen. Dan de kernvraag. Daarna gegevens, urgentie, voorkeuren en vervolgstap. Ondertussen wordt alles gestructureerd opgeslagen.",
          "Dat is ook commercieel belangrijk. Een warme lead die belt heeft vaak meer intentie dan iemand die twijfelend een formulier opent. Als je die lead direct goed helpt, stijgt de kans op afspraak of verkoop."
        ],
        bullets: [
          "Spoedvragen waarbij directe reactie vertrouwen geeft.",
          "Complexe aanvragen waarbij doorvragen nodig is.",
          "Offertes met meerdere variabelen zoals locatie, budget, timing of wensen.",
          "Intakegesprekken waarbij nuance belangrijk is.",
          "Terugbelverzoeken die anders blijven liggen."
        ]
      },
      {
        id: "wanneer-formulier-goed-genoeg-is",
        eyebrow: "Formulier",
        title: "Wanneer is een formulier juist voldoende?",
        paragraphs: [
          "Niet alles hoeft voice te zijn. Een formulier is prima voor eenvoudige aanvragen met lage urgentie. Bijvoorbeeld een nieuwsbriefinschrijving, een simpele download, een standaard contactverzoek of een aanvraag waarbij de bezoeker alle gegevens makkelijk bij de hand heeft.",
          "Ook bij juridische toestemming, uploads of uitgebreide keuzevelden kan een formulier handig blijven. De slimste opzet is daarom vaak hybride: formulier waar het rustig kan, Voice AI waar snelheid, gesprek en conversie belangrijker zijn.",
          "Een goede website biedt meerdere routes. De bezoeker kiest zelf: bellen met AI, chatten, formulier invullen of afspraak plannen. Achter de schermen komt alles op dezelfde plek in CRM."
        ]
      },
      {
        id: "crm-verwerking",
        eyebrow: "CRM",
        title: "De winst ontstaat na het gesprek",
        paragraphs: [
          "Voice AI is pas echt waardevol als het gesprek niet los blijft hangen. Na ieder telefoongesprek wil je een transcript, samenvatting, leadstatus, taak, afspraak of ticket. Anders verplaats je het werk alleen maar.",
          "Een sterke Voice AI koppelt daarom met CRM en planning. De AI zet de klantvraag in de juiste pipeline, vult velden aan, stuurt bevestigingen en maakt vervolgacties. De medewerker ziet meteen wat er is besproken.",
          "Zo voelt voice niet als een gadget, maar als een AI medewerker die de voorkant én achterkant van klantcontact beter organiseert."
        ]
      }
    ],
    examples: [
      {
        title: "Formulier past",
        text: "Een bezoeker vraagt een whitepaper aan en hoeft alleen naam en e-mail achter te laten."
      },
      {
        title: "Voice AI past",
        text: "Een klant belt over lekkage, wil snel duidelijkheid en moet foto's, adres, urgentie en beschikbaarheid doorgeven."
      }
    ],
    faq: [
      {
        question: "Kan Voice AI echt telefoongesprekken voeren?",
        answer:
          "Ja. Moderne realtime voice-systemen kunnen luisteren, reageren, doorvragen en acties starten. De kwaliteit hangt sterk af van inrichting, kennisbasis en fallbackregels."
      },
      {
        question: "Is Voice AI geschikt voor elke website?",
        answer:
          "Nee. Voice AI is vooral zinvol wanneer gesprekken waardevol, urgent of complex zijn. Voor eenvoudige formulieren blijft een formulier vaak genoeg."
      },
      {
        question: "Wat gebeurt er na een Voice AI gesprek?",
        answer:
          "Idealiter worden transcript, samenvatting, afspraak, CRM-status en follow-up automatisch verwerkt, zodat je team direct verder kan."
      }
    ],
    related: [
      { label: "Producten", title: "Bekijk Voice AI als AI medewerker.", href: "/nl/producten/" },
      { label: "Kennis", title: "Lees over AI agents voor klantcontact.", href: "/nl/kennisbank/wat-betekenen-ai-agents-voor-klantcontact/" },
      { label: "Afspraak", title: "Test je telefonische klantreis.", href: "/nl/afspraak/" }
    ],
    sources: [
      { label: "OpenAI Realtime documentatie", href: "https://platform.openai.com/docs/guides/realtime" },
      { label: "OpenAI Agents documentatie", href: "https://platform.openai.com/docs/guides/agents" }
    ]
  },
  {
    slug: "welke-ai-ontwikkelingen-moet-een-ondernemer-volgen",
    category: "AI nieuws",
    label: "Laatste",
    readTime: "5 min",
    title: "Welke AI ontwikkelingen moet een ondernemer volgen?",
    accent: "volgen.",
    cardTitle: "Welke AI ontwikkelingen moet een ondernemer volgen?",
    excerpt:
      "Een rustig overzicht van ontwikkelingen die echt impact hebben: multimodaal, agents, realtime voice, documenten en automatisering.",
    description:
      "Overzicht van AI ontwikkelingen die ondernemers moeten volgen: agents, realtime voice, multimodaal, document-AI, AI zoeken en automatisering.",
    intent: "Breed informatief onderzoek naar actuele AI ontwikkelingen voor ondernemers.",
    audience: "Ondernemers en managers die willen weten wat ze praktisch moeten volgen.",
    promise: "Je scheidt nuttige AI trends van ruis.",
    conversion: "Kies een eerste AI toepassing die nu al waarde oplevert.",
    published: "2026-06-19",
    modified: "2026-06-19",
    keywords: ["AI ontwikkelingen ondernemer", "AI trends bedrijven", "AI agents voice", "multimodale AI", "AI automatisering bedrijf"],
    summary: [
      "Volg vooral ontwikkelingen die werkprocessen veranderen: agents, realtime voice, multimodale AI, documentverwerking, AI zoeken en workflow automation.",
      "Niet elke AI trend is meteen relevant. Kijk steeds naar klantcontact, interne tijdwinst, kwaliteit van opvolging en meetbaarheid.",
      "De praktische vraag is niet: wat is nieuw? De vraag is: welk werk kan hierdoor beter, sneller of consistenter?"
    ],
    sections: [
      {
        id: "agents",
        eyebrow: "Agents",
        title: "1. AI agents worden digitale medewerkers",
        paragraphs: [
          "De belangrijkste ontwikkeling voor ondernemers is de verschuiving van losse chatbots naar AI agents. Een agent kan een doel volgen, context ophalen, tools gebruiken en acties uitvoeren. Dat maakt AI bruikbaar in klantcontact, sales, planning, support en administratie.",
          "Voor een bedrijf betekent dit dat AI minder een vraagbaak wordt en meer een medewerker in een proces. De agent kan leads kwalificeren, afspraken boeken, tickets aanmaken, offertes opvolgen en informatie terugschrijven naar CRM.",
          "Let hierbij vooral op afbakening. Een goede agent heeft duidelijke regels, rechten, logging en menselijke fallback. Zonder dat wordt AI rommelig."
        ]
      },
      {
        id: "realtime-voice",
        eyebrow: "Voice",
        title: "2. Realtime Voice AI maakt telefonie opnieuw interessant",
        paragraphs: [
          "Telefonie leek jarenlang lastig te automatiseren. Te traag, te onnatuurlijk, te beperkt. Realtime Voice AI verandert dat. De AI kan luisteren, reageren en doorvragen met veel minder vertraging dan oudere systemen.",
          "Voor ondernemers is dit relevant bij gemiste oproepen, terugbelverzoeken, intake, support en offerte-opvolging. Niet elk gesprek moet door AI, maar veel eerste contactmomenten kunnen wel beter worden opgevangen.",
          "De echte impact zit weer in de koppeling: transcript, samenvatting, afspraak en CRM-update. Zonder die verwerking blijft voice vooral een leuke demo."
        ]
      },
      {
        id: "multimodaal",
        eyebrow: "Multimodaal",
        title: "3. AI begrijpt steeds meer soorten input",
        paragraphs: [
          "Multimodale AI kan omgaan met tekst, beeld, audio en soms video. Dat klinkt technisch, maar de zakelijke toepassing is simpel: klanten en medewerkers hoeven informatie minder netjes voor te kauwen.",
          "Een klant kan een foto sturen van schade, een foutmelding, een daklekkage of een document. De AI kan helpen interpreteren, de juiste vragen stellen en de informatie klaarzetten voor een medewerker.",
          "Voor branches met visuele context is dit belangrijk: dakdekkers, installateurs, autobedrijven, vastgoedbeheer, zorg, beauty en serviceorganisaties."
        ]
      },
      {
        id: "documenten",
        eyebrow: "Documenten",
        title: "4. Document-AI wordt praktisch in plaats van experimenteel",
        paragraphs: [
          "Veel bedrijven hebben kennis verstopt in offertes, contracten, handleidingen, intakeformulieren en oude dossiers. AI kan die informatie steeds beter lezen, structureren en samenvatten.",
          "Dat maakt interne kennisbanken belangrijk. Niet als map vol pdf's, maar als bron waar AI medewerkers veilig uit kunnen putten. Denk aan voorwaarden, werkinstructies, prijzen, uitzonderingen, serviceregels en tone of voice.",
          "Wie zijn kennis goed organiseert, krijgt betere AI output. Dat is misschien minder spannend dan een nieuw model, maar veel waardevoller in de praktijk."
        ]
      },
      {
        id: "ai-zoeken",
        eyebrow: "AI zoeken",
        title: "5. Zoekgedrag verschuift naar antwoorden",
        paragraphs: [
          "AI zoeken verandert hoe klanten informatie vinden. Ze typen langere vragen, vergelijken opties en lezen samenvattingen. Daardoor moet je content concreter worden. Niet alleen productpagina's, maar ook kennisbankartikelen die vragen echt beantwoorden.",
          "Voor ondernemers betekent dit: publiceer uitleg die je klant al zoekt. Wat is Voice AI? Wanneer werkt AI voor servicebedrijven? Hoe kies je Claude of OpenAI? Wat doet een AI agent met CRM?",
          "Die content helpt niet alleen SEO. Het helpt sales, vertrouwen en onboarding, omdat je markt beter begrijpt wat je bouwt."
        ]
      }
    ],
    examples: [
      {
        title: "Trend met directe waarde",
        text: "Realtime Voice AI voor gemiste oproepen en terugbelverzoeken."
      },
      {
        title: "Trend die voorbereiding vraagt",
        text: "Document-AI werkt pas goed als je kennisbasis opgeschoond en betrouwbaar is."
      }
    ],
    faq: [
      {
        question: "Welke AI trend is het belangrijkst voor ondernemers?",
        answer:
          "AI agents zijn waarschijnlijk het meest praktisch, omdat ze AI verbinden met echte bedrijfsacties zoals CRM, planning, opvolging en support."
      },
      {
        question: "Moet elk bedrijf nu Voice AI gebruiken?",
        answer:
          "Nee. Voice AI is vooral relevant bij veel telefoontjes, gemiste oproepen, spoed, intake of waardevolle terugbelverzoeken."
      },
      {
        question: "Hoe voorkom je dat je achter elke AI hype aanloopt?",
        answer:
          "Koppel elke ontwikkeling aan een concreet proces: meer afspraken, minder handwerk, betere opvolging, sneller support of schonere data."
      }
    ],
    related: [
      { label: "SEO", title: "AI zoeken verandert je contentstrategie.", href: "/nl/kennisbank/waarom-ai-zoekgedrag-je-seo-strategie-verandert/" },
      { label: "Voice", title: "Wanneer Voice AI beter is dan een formulier.", href: "/nl/kennisbank/wanneer-is-voice-ai-beter-dan-een-formulier/" },
      { label: "Afspraak", title: "Kies een eerste AI route.", href: "/nl/afspraak/" }
    ],
    sources: [
      { label: "OpenAI Agents documentatie", href: "https://platform.openai.com/docs/guides/agents" },
      { label: "Google AI features en Search", href: "https://developers.google.com/search/docs/appearance/ai-features" },
      { label: "Anthropic Claude documentatie", href: "https://docs.anthropic.com/en/docs/about-claude/models/overview" }
    ]
  },
  ...researchKnowledgeArticles
];

export const knowledgeArticles: KnowledgeArticle[] = strategicKnowledgeArticles;

export const getKnowledgeArticle = (slug: string) =>
  knowledgeArticles.find((article) => article.slug === slug);
