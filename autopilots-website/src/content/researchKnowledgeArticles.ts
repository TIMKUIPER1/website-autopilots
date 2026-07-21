import type { KnowledgeArticle } from "./knowledgeArticles";

type ResearchArticle = Omit<KnowledgeArticle, "label" | "readTime" | "published" | "modified"> & {
  label?: string;
  readTime?: string;
};

const article = (input: ResearchArticle): KnowledgeArticle => ({
  label: "Actueel 2026",
  readTime: "7 min",
  published: "2026-07-15",
  modified: "2026-07-15",
  ...input
});

export const researchKnowledgeArticles: KnowledgeArticle[] = [
  article({
    slug: "gpt-live-realtime-voice-ai-klantcontact",
    category: "Voice AI",
    title: "GPT-Live en Realtime Voice AI: wat verandert er voor klantcontact?",
    accent: "klantcontact?",
    cardTitle: "GPT-Live en Realtime Voice AI voor klantcontact",
    excerpt: "Nieuwe voice-modellen luisteren natuurlijker, kunnen tools gebruiken en houden een gesprek gaande terwijl een andere stap dieper redeneert.",
    description: "Wat GPT-Live en nieuwe Realtime Voice AI in 2026 betekenen voor telefonische intake, planning, support en menselijke overdracht.",
    intent: "Actuele uitleg over GPT-Live en Realtime Voice AI voor bedrijven.",
    audience: "Bedrijven met veel telefoontjes, intake, planning of support.",
    promise: "Je weet welke verbetering echt bruikbaar is en welke ontwerpkeuzes nog steeds nodig zijn.",
    conversion: "Vergelijk je huidige telefoonroute met een gecontroleerde AI Telefoniste.",
    keywords: ["GPT-Live klantcontact", "Realtime Voice AI", "AI telefoniste 2026", "voice agent CRM", "AI telefoongesprek"],
    summary: [
      "OpenAI presenteerde in juli 2026 GPT-Live met continue, full-duplex interactie: luisteren en spreken kunnen vloeiender naast elkaar plaatsvinden.",
      "Voor bedrijfsprocessen blijft de API-route belangrijker dan een consumentendemo: intake, agenda, CRM-acties, logging en fallback bepalen de werkelijke waarde.",
      "Natuurlijker praten is geen vrijbrief voor volledige autonomie. Maak bekend dat iemand met AI spreekt en leg vast wanneer een mens overneemt."
    ],
    sections: [
      { id: "wat-is-er-nieuw", eyebrow: "Juli 2026", title: "Van wachten op een beurt naar een vloeiender gesprek", paragraphs: ["Oudere spraaksystemen zetten audio vaak achter elkaar om naar tekst, antwoord en nieuwe audio. Daardoor ontstonden lange pauzes en onnatuurlijke onderbrekingen. GPT-Live is volgens OpenAI ontworpen voor continue interactie en kan tijdens het gesprek vaker beslissen of het moet luisteren, spreken, pauzeren of een tool inzetten.", "Voor een klant betekent dit vooral minder frictie: een korte denkpauze hoeft niet direct als einde van de zin te worden gezien. De AI kan bevestigen dat hij luistert en een gesprek natuurlijker laten verlopen. Dat is relevant bij storingen, afspraken en offertevragen, waar klanten niet in perfecte formulierzinnen spreken.", "GPT-Live is bij introductie nog niet hetzelfde als een direct beschikbare zakelijke telefonie-API. OpenAI kondigde aan dat API-beschikbaarheid volgt. Voor productie bestaan ondertussen Realtime API-modellen die spraak, toolgebruik en telefoniekoppelingen ondersteunen."], bullets: ["Vloeiender beurtwisseling en minder stijve pauzes.", "Toolgebruik voor agenda, CRM of statuscontrole.", "Delegeren van complexer zoek- of redeneerwerk.", "Aparte afspraken nodig voor logging, toestemming en overdracht."] },
      { id: "zakelijke-route", eyebrow: "Praktijk", title: "Een goede stem is pas het begin van een werkende AI Telefoniste", paragraphs: ["Een overtuigende stemdemo zegt nog niets over de complete klantreis. Een zakelijke voice agent moet weten wie er belt, welke gegevens verplicht zijn, wat spoed betekent, welke agenda gebruikt mag worden en wat er gebeurt als een koppeling uitvalt.", "Ontwerp daarom eerst de route. Begin met één herkenbare taak, zoals gemiste oproepen terugbellen of een afspraakintake. Meet vervolgens bereik, compleetheid van gegevens, correcte acties en het percentage gesprekken dat terecht aan een mens wordt overgedragen.", "De beste voice-ervaring is niet degene die het langst zelfstandig praat. Het is degene die snel tot de juiste vervolgstap komt zonder informatie te verzinnen of de klant te laten herhalen."] },
      { id: "controlepunten", eyebrow: "Checklist", title: "Controleer dit vóór een pilot", paragraphs: ["Test verschillende accenten, achtergrondgeluid, onderbrekingen, stiltes en gewijzigde verzoeken. Controleer daarnaast of namen, adressen, kentekens en foutcodes correct worden teruggelezen.", "Maak in de opening duidelijk dat de beller met een AI-assistent spreekt. Leg ook een directe menselijke route vast voor klachten, veiligheid, privacyvragen en situaties waarin de AI onvoldoende zekerheid heeft."], bullets: ["Disclosure in de eerste gespreksfase.", "Bevestiging van kritieke gegevens.", "Fallback bij tool- of telefoniefouten.", "Transcripten met beperkte toegang en bewaartermijn."] }
    ],
    examples: [{ title: "Installatiebedrijf", text: "De AI vraagt foutcode, veiligheid, adres en contractstatus uit en zet een complete werkbon klaar." }, { title: "Autobedrijf", text: "De AI herkent proefrit, werkplaats of voorraad en plant alleen in het passende agenda-type." }],
    faq: [{ question: "Is GPT-Live al beschikbaar via de API?", answer: "OpenAI kondigde op 8 juli 2026 aan dat GPT-Live later naar de API komt. Voor productie zijn er al Realtime API-modellen; controleer vóór implementatie altijd de actuele modelbeschikbaarheid." }, { question: "Kan Voice AI een medewerker volledig vervangen?", answer: "Niet als algemeen uitgangspunt. Voice AI is sterk in eerste opvang, vaste intake en systeemacties; complexe, gevoelige of onzekere situaties horen naar een medewerker." }, { question: "Moet ik zeggen dat de stem AI is?", answer: "Maak dit duidelijk. Vanaf 2 augustus 2026 gelden in de EU bovendien transparantieverplichtingen voor bepaalde interactieve AI-systemen. Laat de precieze juridische toepassing beoordelen voor jouw situatie." }],
    related: [{ label: "Product", title: "Bekijk de AI Telefoniste.", href: "/nl/producten/ai-telefoniste/" }, { label: "Proces", title: "Zo testen we vóór livegang.", href: "/nl/proces/" }, { label: "Afspraak", title: "Bespreek je telefoonroute.", href: "/nl/afspraak/" }],
    sources: [{ label: "OpenAI — Introducing GPT-Live (8 juli 2026)", href: "https://openai.com/index/introducing-gpt-live/" }, { label: "OpenAI — Advancing voice intelligence in the API (7 mei 2026)", href: "https://openai.com/index/advancing-voice-intelligence-with-new-models-in-the-api/" }, { label: "Europese Commissie — AI Act", href: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai" }]
  }),
  article({
    slug: "ai-act-2026-chatbot-melden-dat-het-ai-is",
    category: "AI Act",
    title: "AI Act 2026: moet een chatbot zeggen dat het AI is?",
    accent: "AI is?",
    cardTitle: "Moet een chatbot zeggen dat het AI is?",
    excerpt: "Vanaf 2 augustus 2026 worden Europese transparantieregels voor interactieve AI relevant. Dit is de praktische voorbereiding voor klantcontact.",
    description: "Praktische uitleg over de AI Act-transparantieplicht voor chatbots en voice agents vanaf augustus 2026, met implementatiechecklist.",
    intent: "Actuele uitleg over AI Act artikel 50 voor chatbots en voice agents.",
    audience: "Bedrijven die AI gebruiken in chat, telefonie of klantcontact.",
    promise: "Je weet welke transparantie je nu al in het ontwerp kunt opnemen.",
    conversion: "Controleer disclosure, logging en menselijke overdracht in je klantreis.",
    keywords: ["AI Act chatbot transparantie", "artikel 50 AI Act", "melden dat chatbot AI is", "AI voice disclosure", "AI Act 2 augustus 2026"],
    summary: ["De Europese Commissie geeft aan dat mensen in passende gevallen geïnformeerd moeten worden wanneer zij met een AI-systeem communiceren.", "De transparantieregels van artikel 50 worden vanaf 2 augustus 2026 toepasbaar; de precieze reikwijdte hangt af van systeem en context.", "Wacht niet op een juridisch document in je footer: bouw disclosure, menselijke keuze en logging in de feitelijke interactie."],
    sections: [
      { id: "wat-verandert", eyebrow: "Regels", title: "Transparantie hoort in het gesprek, niet alleen in de voorwaarden", paragraphs: ["Bij een chatbot of voice agent moet een gebruiker op tijd begrijpen dat de interactie door AI wordt uitgevoerd. De Europese Commissie noemt chatbots expliciet als voorbeeld van systemen waarbij transparantie vertrouwen en een geïnformeerde keuze ondersteunt.", "Een kleine regel die pas na een lang gesprek zichtbaar wordt, mist het praktische doel. Zorg dat de melding begrijpelijk is, past bij het kanaal en verschijnt voordat iemand redelijkerwijs denkt met een mens te spreken.", "Dit artikel is praktische productinformatie en geen juridisch advies. Laat sector, gegevensverwerking en concrete use case beoordelen wanneer de risico's hoger zijn."], bullets: ["Chat: duidelijke melding aan het begin van de conversatie.", "Voice: korte gesproken introductie zonder juridisch jargon.", "E-mail: herkenbare afzender en route naar een medewerker.", "Alle kanalen: leg uit hoe een mens kan overnemen."] },
      { id: "praktische-implementatie", eyebrow: "Implementatie", title: "Vier ontwerpkeuzes die je nu kunt vastleggen", paragraphs: ["Schrijf één disclosure die de klant begrijpt, leg vast wanneer deze wordt getoond en test of hij ook op mobiel en bij telefonische onderbrekingen overeind blijft. Maak daarna de menselijke route zichtbaar.", "Bewaar een versiegeschiedenis van teksten en prompts, zodat aantoonbaar is welke uitleg op welk moment actief was. Combineer dit met beperkte logging van de systeemactie, zonder onnodige persoonsgegevens in analytics te stoppen.", "Controleer ten slotte of externe tools of gegenereerde content aanvullende eisen oproepen. De Commissie publiceert actuele richtlijnen en een vrijwillige gedragscode; volg die bron bij wijzigingen." ] },
      { id: "governance", eyebrow: "Governance", title: "Maak één eigenaar verantwoordelijk voor transparantie", paragraphs: ["Marketing, operatie, privacy en techniek kijken vaak ieder naar een ander deel. Wijs daarom één eigenaar aan die disclosure, wijzigingen, incidenten en klantfeedback bij elkaar houdt.", "Neem transparantie mee in acceptatietests: ziet de klant de melding, kan hij een mens kiezen en blijft de route werken als een tool faalt? Daarmee wordt compliance onderdeel van kwaliteit in plaats van een losse tekstcontrole."] }
    ],
    examples: [{ title: "Chatopening", text: "Je chat met de AI-assistent van Autopilots. Ik help met je vraag en kan een collega inschakelen." }, { title: "Voiceopening", text: "Je spreekt met onze AI-assistent. Ik kan je aanvraag opnemen of je doorverbinden met een collega." }],
    faq: [{ question: "Geldt de transparantieplicht al?", answer: "Volgens de Europese Commissie worden de transparantieregels van artikel 50 toepasbaar vanaf 2 augustus 2026. Andere AI Act-verplichtingen hebben andere ingangsdata." }, { question: "Is een vermelding in de privacyverklaring genoeg?", answer: "Ontwerp de melding in de interactie zelf. De gebruiker moet tijdig begrijpen dat AI betrokken is; een algemene privacytekst alleen is daarvoor doorgaans geen sterke gebruikerservaring." }, { question: "Geldt dit voor iedere automatisering?", answer: "Niet iedere automatische regel is hetzelfde als een interactief AI-systeem. De precieze kwalificatie hangt af van techniek en toepassing; laat twijfelgevallen juridisch beoordelen." }],
    related: [{ label: "Product", title: "Bekijk hoe AI Inboxmedewerker wordt ingericht.", href: "/nl/producten/ai-inboxmedewerker/" }, { label: "Privacy", title: "Lees onze privacyinformatie.", href: "/nl/privacy/" }, { label: "Proces", title: "Bekijk menselijke fallback in het proces.", href: "/nl/proces/" }],
    sources: [{ label: "Europese Commissie — AI Act implementation timeline", href: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai" }, { label: "Europese Commissie — transparantiecode AI-content", href: "https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content" }, { label: "Europese Commissie — FAQ transparantiecode", href: "https://digital-strategy.ec.europa.eu/en/faqs/code-practice-transparency-ai-generated-content" }]
  }),
  article({
    slug: "ai-geletterdheid-ai-act-praktische-checklist",
    category: "AI governance",
    title: "AI-geletterdheid onder de AI Act: een praktische checklist.",
    accent: "checklist.",
    cardTitle: "AI-geletterdheid: wat moet je team weten?",
    excerpt: "AI-geletterdheid gaat niet om iedereen leren programmeren, maar om genoeg kennis om systemen bewust, veilig en passend te gebruiken.",
    description: "Praktische AI-geletterdheid checklist voor Nederlandse bedrijven op basis van artikel 4 van de Europese AI Act.",
    intent: "Uitleg en checklist voor AI literacy onder artikel 4 van de AI Act.",
    audience: "Directie, operations, HR en medewerkers die AI gebruiken of beheren.",
    promise: "Je kunt een kleine, aantoonbare leerroute voor je team opzetten.",
    conversion: "Koppel training aan de echte AI-systemen en risico's in je organisatie.",
    keywords: ["AI geletterdheid AI Act", "artikel 4 AI Act", "AI training medewerkers", "AI literacy checklist", "AI beleid bedrijf"],
    summary: ["Artikel 4 van de AI Act vraagt aanbieders en gebruiksorganisaties maatregelen te nemen voor voldoende AI-geletterdheid van betrokken personen.", "De verplichting is sinds 2 februari 2025 van toepassing; volgens de Commissie start toezicht en handhaving in augustus 2026.", "Een effectieve aanpak is rolgericht: een gebruiker, beheerder en beslisser hoeven niet dezelfde technische diepte te hebben."],
    sections: [
      { id: "wat-is-ai-geletterdheid", eyebrow: "Artikel 4", title: "Voldoende kennis hangt af van rol, systeem en risico", paragraphs: ["De Europese Commissie omschrijft AI-geletterdheid als vaardigheden, kennis en begrip om AI geïnformeerd in te zetten en kansen, risico's en mogelijke schade te herkennen. Dat is breder dan een eenmalige prompttraining.", "Een medewerker die conceptmails maakt moet hallucinaties en vertrouwelijke informatie herkennen. Een beheerder van een klantcontactagent moet daarnaast toolrechten, logging, fallback en incidenten begrijpen. Een directielid moet weten welke besluiten niet zonder passende controle aan AI worden overgelaten.", "Maak de leerroute daarom afhankelijk van technische ervaring, context en de mensen die door het systeem worden geraakt." ] },
      { id: "minimumprogramma", eyebrow: "Programma", title: "Bouw een compact minimumprogramma rond echte situaties", paragraphs: ["Start met een inventaris van gebruikte AI-systemen en rollen. Leg per rol vast wat iemand moet weten, welke fouten herkenbaar moeten zijn en waar incidenten gemeld worden.", "Gebruik voorbeelden uit de eigen werkdag: een verzonnen CRM-samenvatting, een verkeerd geïnterpreteerde urgentie of een medewerker die persoonsgegevens in een niet-goedgekeurde tool plakt. Dat beklijft beter dan algemene modeltheorie."], bullets: ["Wat het systeem wel en niet mag doen.", "Hoe output wordt gecontroleerd.", "Welke gegevens niet ingevoerd mogen worden.", "Wanneer menselijke beoordeling verplicht is.", "Waar fouten, klachten en incidenten worden gemeld."] },
      { id: "aantoonbaar-maken", eyebrow: "Bewijs", title: "Leg maatregelen vast zonder trainingsbureaucratie", paragraphs: ["Documenteer doelgroep, leerdoelen, datum, materiaal en deelname. Voeg een korte praktijktest of bespreking toe en herhaal training wanneer het systeem, de rol of de risico's wezenlijk veranderen.", "De Commissie waarschuwt dat voorbeelden uit haar repository niet automatisch naleving bewijzen. Gebruik ze als inspiratie, maar koppel maatregelen aantoonbaar aan de eigen context."] }
    ],
    examples: [{ title: "Klantcontactteam", text: "Oefent met hallucinaties, privacyvragen, klachten en de menselijke overnameknop." }, { title: "Beheerder", text: "Oefent met promptwijzigingen, toolrechten, evaluaties, logcontrole en incidentrespons." }],
    faq: [{ question: "Moet ieder bedrijf AI-training geven?", answer: "Organisaties die AI-systemen aanbieden of gebruiken moeten volgens artikel 4 passende maatregelen nemen voor voldoende AI-geletterdheid van betrokken personen. De invulling hangt af van context en risico." }, { question: "Is één algemene training genoeg?", answer: "Niet altijd. De Commissie benadrukt technische kennis, ervaring, context en getroffen personen. Rolgerichte instructie en updates bij systeemwijzigingen zijn sterker." }, { question: "Moet deelname worden vastgelegd?", answer: "De Commissie schrijft geen universeel certificaat voor in de aangehaalde FAQ. Praktisch is het verstandig maatregelen, inhoud en deelname aantoonbaar te documenteren." }],
    related: [{ label: "Proces", title: "Bekijk hoe governance in livegang past.", href: "/nl/proces/" }, { label: "Kennis", title: "Lees over AI Act-transparantie.", href: "/nl/kennisbank/ai-act-2026-chatbot-melden-dat-het-ai-is/" }, { label: "Afspraak", title: "Breng rollen en risico's in kaart.", href: "/nl/afspraak/" }],
    sources: [{ label: "Europese Commissie — AI Literacy Q&A", href: "https://digital-strategy.ec.europa.eu/en/faqs/ai-literacy-questions-answers" }, { label: "Europese Commissie — AI talent, skills and literacy", href: "https://digital-strategy.ec.europa.eu/en/policies/ai-talent-skills-and-literacy" }]
  }),
  article({
    slug: "ai-agent-testen-voor-livegang-evals",
    category: "AI kwaliteit",
    title: "Een AI agent testen vóór livegang: zo gebruik je evals.",
    accent: "evals.",
    cardTitle: "AI agent testen vóór livegang",
    excerpt: "Een paar geslaagde demo's bewijzen niets. Met vaste evaluaties test je antwoorden, acties, overdracht en regressies vóór klanten ze raken.",
    description: "Praktische gids voor AI evals: testsets, graders, regressietests en live monitoring voor klantcontactagents.",
    intent: "Uitleg over AI agent evaluaties en productiekwaliteit.",
    audience: "Teams die chat-, voice- of follow-upagents bouwen of inkopen.",
    promise: "Je kunt een meetbaar acceptatiekader maken voordat AI live gaat.",
    conversion: "Zet je belangrijkste klantreizen om in een herhaalbare acceptatietest.",
    keywords: ["AI evals", "AI agent testen", "LLM evaluatie", "AI acceptatietest", "voice agent kwaliteit"],
    summary: ["Evals zijn herhaalbare tests waarmee je vooraf definieert wat goed gedrag is en waar een agent moet falen of overdragen.", "Test niet alleen taal, maar ook toolkeuze, verplichte velden, verboden acties, privacy en menselijke fallback.", "Voer dezelfde set opnieuw uit bij wijzigingen aan model, prompt, kennis of koppelingen."],
    sections: [
      { id: "van-demo-naar-test", eyebrow: "Kwaliteit", title: "Een demo toont een mogelijkheid; een eval toont herhaalbaarheid", paragraphs: ["Teams testen vaak met een paar vriendelijke vragen. In productie komen dubbele bedoelingen, ontbrekende gegevens, boze klanten, dialect, typfouten en falende tools voorbij. Daarom moet succes vooraf meetbaar worden gemaakt.", "Maak per klantreis voorbeelden van correcte, onvolledige, risicovolle en vijandige input. Leg de verwachte actie vast: antwoorden, doorvragen, weigeren, bevestigen of overdragen. Zo wordt kwaliteit bespreekbaar in plaats van een gevoel."], bullets: ["Correcte intentie en route.", "Geen verzonnen prijzen, voorraad of afspraken.", "Verplichte bevestiging van kritieke gegevens.", "Juiste tool met juiste argumenten.", "Menselijke overdracht bij lage zekerheid of risico."] },
      { id: "testset", eyebrow: "Testset", title: "Bouw eerst 30 tot 50 scenario's uit de echte operatie", paragraphs: ["Gebruik geanonimiseerde patronen uit mail, chat en telefoongesprekken. Verdeel ze over normale gevallen, uitzonderingen en grensgevallen. Voeg ook ontbrekende informatie en tegenstrijdige instructies toe.", "Beoordeel sommige criteria exact, zoals een verplichte CRM-status. Andere criteria vragen een rubric: correct, veilig, compleet en passend van toon. Laat risicovolle gevallen altijd door een mens beoordelen.", "Bewaar testdata gescheiden van productiegegevens en vermijd directe persoonsgegevens in de evalset." ] },
      { id: "regressie-monitoring", eyebrow: "Na livegang", title: "Gebruik regressietests én productie-indicatoren", paragraphs: ["Draai de vaste set opnieuw bij iedere relevante wijziging. Vergelijk niet alleen totaalscores, maar kijk welk type fout is teruggekomen. Eén foutieve veiligheidsroute kan belangrijker zijn dan tien mooiere formuleringen.", "Monitor na livegang overdrachtspercentage, herhaalvragen, mislukte tools, correcties door medewerkers en klachten. Nieuwe fouten worden daarna nieuwe evalcases. Zo groeit het systeem gecontroleerd mee met de praktijk."] }
    ],
    examples: [{ title: "Agenda-eval", text: "De agent mag pas boeken nadat type afspraak, locatie en expliciete bevestiging aanwezig zijn." }, { title: "Spoed-eval", text: "Bij veiligheidswoorden geeft de agent geen technisch advies maar activeert hij de vastgelegde menselijke route." }],
    faq: [{ question: "Hoeveel testcases zijn genoeg?", answer: "Er is geen universeel aantal. Begin met de belangrijkste routes en risico's, bijvoorbeeld 30 tot 50 diverse cases, en breid uit met fouten uit productie." }, { question: "Kan AI zelf de output beoordelen?", answer: "Voor veel criteria kan een model als grader helpen, maar kritieke veiligheid, beleid en zakelijke acties vragen vaste regels en menselijke steekproeven." }, { question: "Moet ik opnieuw testen bij een modelupdate?", answer: "Ja. Model, prompt, kennis en tools kunnen gedrag veranderen. Herhaal relevante regressietests vóór uitrol." }],
    related: [{ label: "Proces", title: "Bekijk testen en livegang.", href: "/nl/proces/" }, { label: "Product", title: "Bekijk de AI Inboxmedewerker.", href: "/nl/producten/ai-inboxmedewerker/" }, { label: "Afspraak", title: "Ontwerp een eerste testset.", href: "/nl/afspraak/" }],
    sources: [{ label: "OpenAI — Evaluation best practices", href: "https://platform.openai.com/docs/guides/evaluation-best-practices" }, { label: "OpenAI — Agent evals", href: "https://platform.openai.com/docs/guides/agent-evals" }, { label: "OpenAI — Safety best practices", href: "https://platform.openai.com/docs/guides/safety-best-practices" }]
  }),
  article({
    slug: "kennisbank-voor-ai-medewerker-bronbeheer",
    category: "AI kennisbasis",
    title: "Een kennisbank voor je AI-medewerker: bronbeheer zonder chaos.",
    accent: "chaos.",
    cardTitle: "Kennisbank voor een AI-medewerker",
    excerpt: "Betrouwbare AI begint bij actuele, vindbare en begrensde broninformatie — niet bij een map vol verouderde pdf's.",
    description: "Zo bouw je een betrouwbare kennisbank voor een AI agent met bronbeheer, metadata, versies, retrieval en menselijke verantwoordelijkheid.",
    intent: "Praktische gids voor RAG en kennisbankbeheer voor AI agents.",
    audience: "Bedrijven die AI laten antwoorden uit eigen documenten en beleid.",
    promise: "Je krijgt een werkbaar beheerproces voor betrouwbare antwoorden.",
    conversion: "Inventariseer welke bronnen een AI-medewerker wel en niet mag gebruiken.",
    keywords: ["kennisbank AI agent", "RAG kennisbank", "AI bronbeheer", "file search AI", "betrouwbare AI antwoorden"],
    summary: ["Retrieval laat een AI relevante delen uit goedgekeurde bronnen ophalen, maar corrigeert geen slechte of tegenstrijdige documenten.", "Geef iedere bron eigenaar, geldigheidsdatum, onderwerp en toegangslabel.", "Meet niet alleen of een antwoord mooi klinkt, maar of de juiste bron is gebruikt en onzekerheid netjes wordt afgehandeld."],
    sections: [
      { id: "bron-voor-model", eyebrow: "Basis", title: "Maak eerst de bron betrouwbaar, daarna de zoeklaag", paragraphs: ["File search en retrieval kunnen documenten doorzoeken en relevante passages aan een model aanbieden. Dat maakt productinformatie, werkinstructies en FAQ's bruikbaar zonder alles in een prompt te plakken.", "Maar retrieval kiest uit wat je toevoegt. Een oude prijslijst en een nieuwe prijslijst kunnen beide overtuigend klinken. Breng daarom eerst eigenaarschap, versie en geldigheid op orde.", "Verdeel kennis in kleine, duidelijke onderwerpen. Combineer tekst met metadata zoals product, branche, datum, taal en vertrouwelijkheidsniveau. Daarmee kan de agent gerichter zoeken en kun je bronnen vervangen zonder het hele systeem opnieuw te bouwen." ] },
      { id: "beheerproces", eyebrow: "Beheer", title: "Werk met een publicatieroute voor AI-kennis", paragraphs: ["Wijs per domein een inhoudseigenaar aan. Nieuwe of aangepaste informatie gaat via controle naar een goedgekeurde bronset. Verouderde versies worden ingetrokken en niet alleen ergens anders opgeslagen.", "Maak zichtbaar wanneer een bron voor het laatst is beoordeeld. Prijzen, voorwaarden en openingstijden vragen een kortere controlecyclus dan algemene merkverhalen."], bullets: ["Eén eigenaar per bron of onderwerp.", "Versie, datum en status: concept, goedgekeurd of ingetrokken.", "Toegangslabel voor intern, publiek of beperkt.", "Testvragen voor wijzigingen met hoog risico.", "Fallback wanneer geen betrouwbare bron wordt gevonden."] },
      { id: "antwoord-met-grenzen", eyebrow: "Gedrag", title: "Laat de agent onzekerheid herkennen en doorzetten", paragraphs: ["Een goede kennisagent verzint geen ontbrekend beleid. Als betrouwbare informatie ontbreekt of bronnen botsen, vraagt hij door of schakelt hij een medewerker in.", "Sla waar passend bronverwijzingen of document-ID's op bij het antwoord. Dat helpt medewerkers controleren en maakt fouten sneller herstelbaar. Deel interne broninformatie niet automatisch met klanten; bepaal per kanaal wat zichtbaar mag zijn."] }
    ],
    examples: [{ title: "Prijsinformatie", text: "Alleen de actuele, goedgekeurde prijsmatrix is doorzoekbaar; maatwerk wordt naar sales gestuurd." }, { title: "Serviceregel", text: "De agent haalt regio en contractvoorwaarden op en geeft bij conflicten geen toezegging." }],
    faq: [{ question: "Is RAG hetzelfde als een AI trainen?", answer: "Nee. Retrieval haalt tijdens een vraag relevante informatie uit bronnen op. Dat is iets anders dan modeltraining of fine-tuning." }, { question: "Kan ik gewoon alle pdf's uploaden?", answer: "Technisch vaak wel, maar operationeel is dat riskant. Verwijder duplicaten, verouderde versies en informatie die niet voor deze agent bestemd is." }, { question: "Hoe vaak moet kennis worden gecontroleerd?", answer: "Dat hangt af van veranderlijkheid en risico. Prijzen en voorwaarden vaker; stabiele procesuitleg minder vaak. Leg per bron een reviewmoment vast." }],
    related: [{ label: "Product", title: "Bekijk AI Inboxmedewerker.", href: "/nl/producten/ai-inboxmedewerker/" }, { label: "Proces", title: "Van architectuur naar AI-brein.", href: "/nl/proces/" }, { label: "Afspraak", title: "Breng je bronnen in kaart.", href: "/nl/afspraak/" }],
    sources: [{ label: "OpenAI — File search", href: "https://platform.openai.com/docs/guides/tools-file-search" }, { label: "OpenAI — Retrieval", href: "https://platform.openai.com/docs/guides/retrieval" }, { label: "OpenAI — Safety best practices", href: "https://platform.openai.com/docs/guides/safety-best-practices" }]
  }),
  article({
    slug: "menselijke-overdracht-ai-klantcontact",
    category: "AI klantcontact",
    title: "Menselijke overdracht in AI-klantcontact: ontwerp de nooduitgang.",
    accent: "nooduitgang.",
    cardTitle: "Menselijke overdracht in AI-klantcontact",
    excerpt: "Een mens inschakelen is geen mislukking van AI. Het is een bewust ontworpen route voor risico, emotie, uitzonderingen en onzekerheid.",
    description: "Ontwerp menselijke overdracht voor chat- en voice agents met triggers, context, SLA, eigenaarschap en terugkoppeling.",
    intent: "Praktische uitleg over human-in-the-loop voor AI klantcontact.",
    audience: "Service-, sales- en operationele teams die AI inzetten in klantcontact.",
    promise: "Je voorkomt dat klanten vastlopen tussen AI en medewerkers.",
    conversion: "Ontwerp triggers, eigenaar en contextpakket voor iedere overdracht.",
    keywords: ["menselijke overdracht AI", "human in the loop klantcontact", "AI agent fallback", "AI chatbot medewerker", "voice AI escalatie"],
    summary: ["Leg vooraf vast welke signalen altijd naar een medewerker gaan.", "Draag niet alleen het gesprek over, maar ook samenvatting, intentie, verzamelde gegevens en reden van escalatie.", "Meet of overdrachten terecht, snel en compleet zijn — niet alleen hoeveel de AI zelfstandig afhandelt."],
    sections: [
      { id: "wanneer-overdragen", eyebrow: "Triggers", title: "Gebruik inhoudelijke én technische overdrachtstriggers", paragraphs: ["Klachten, dreiging, veiligheid, privacy, juridische toezeggingen en financiële uitzonderingen zijn duidelijke inhoudelijke triggers. Lage zekerheid, herhaalde misverstanden en tegenstrijdige bronnen zijn dat ook.", "Daarnaast zijn er technische triggers: agenda niet bereikbaar, CRM-write mislukt, telefonie valt weg of identiteit kan niet veilig worden bevestigd. De AI moet dan niet improviseren, maar de vastgelegde fallback uitvoeren.", "Geef klanten ook zelf een eenvoudige route naar een mens. Een systeem dat alleen overdraagt wanneer het dat zelf nodig vindt, voelt snel als een fuik." ] },
      { id: "contextpakket", eyebrow: "Overdracht", title: "Stuur een compleet contextpakket naar de juiste eigenaar", paragraphs: ["Een medewerker moet niet opnieuw beginnen. Stuur kanaal, klantvraag, samenvatting, verzamelde gegevens, reeds uitgevoerde acties, ontbrekende informatie en reden van overdracht mee.", "Koppel de overdracht aan een team, wachtrij of concrete eigenaar met responstijd. Alleen een taak aanmaken zonder eigenaar is digitale verplaatsing van het probleem.", "Laat de AI geen gevoelige afleidingen als feiten presenteren. Houd samenvattingen feitelijk en maak het oorspronkelijke gesprek beschikbaar volgens toegangs- en bewaarbeleid."] },
      { id: "terugleren", eyebrow: "Optimalisatie", title: "Gebruik overdrachten als bron voor verbetering", paragraphs: ["Bekijk wekelijks een steekproef: was de overdracht nodig, kwam hij op tijd en was de context compleet? Voeg terugkerende fouten toe aan evaluaties of kennisbeheer.", "Optimaliseer niet blind op een lager overdrachtspercentage. Een stijging kan juist goed zijn wanneer risicovolle gevallen eerder worden herkend. Kwaliteit en klantuitkomst wegen zwaarder dan autonomie als ijdel cijfer." ] }
    ],
    examples: [{ title: "Klacht", text: "De AI bevestigt ontvangst, doet geen schuldtoezegging en draagt met volledige tijdlijn over aan service." }, { title: "Toolstoring", text: "De AI belooft geen afspraak, maakt een terugbelverzoek en meldt dat de agenda tijdelijk niet bevestigd kan worden." }],
    faq: [{ question: "Wanneer moet AI altijd een mens inschakelen?", answer: "Dat bepaalt je risicoanalyse. Veelgebruikte triggers zijn veiligheid, klachten, privacy, juridische of financiële uitzonderingen, lage zekerheid en mislukte kritieke tools." }, { question: "Is meer autonomie altijd beter?", answer: "Nee. Het doel is de juiste klantuitkomst. Een tijdige, complete overdracht kan beter zijn dan een onzekere automatische afhandeling." }, { question: "Wat moet bij de overdracht worden meegestuurd?", answer: "Minimaal vraag, samenvatting, verzamelde gegevens, acties, ontbrekende informatie en reden van overdracht, binnen passend privacybeleid." }],
    related: [{ label: "Proces", title: "Bekijk het interactieve implementatieproces.", href: "/nl/proces/" }, { label: "Product", title: "Bekijk AI Telefoniste.", href: "/nl/producten/ai-telefoniste/" }, { label: "Kennis", title: "Lees hoe je agents test.", href: "/nl/kennisbank/ai-agent-testen-voor-livegang-evals/" }],
    sources: [{ label: "OpenAI — Safety best practices", href: "https://platform.openai.com/docs/guides/safety-best-practices" }, { label: "OpenAI — Agent evals", href: "https://platform.openai.com/docs/guides/agent-evals" }, { label: "Europese Commissie — AI Act", href: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai" }]
  }),
  article({
    slug: "responses-api-tools-ai-agent-bedrijfsacties",
    category: "AI agents",
    title: "Responses API en tools: zo gaat een AI agent van antwoord naar actie.",
    accent: "actie.",
    cardTitle: "Van AI-antwoord naar bedrijfsactie",
    excerpt: "Een agent wordt operationeel wanneer hij gecontroleerd informatie kan ophalen en acties kan uitvoeren in agenda, CRM of andere systemen.",
    description: "Uitleg over Responses API, tool calling en gecontroleerde bedrijfsacties voor AI agents in CRM, planning en klantcontact.",
    intent: "Technische beslisinformatie over AI tools en agents voor bedrijven.",
    audience: "Operations, productowners en technische teams die AI aan systemen koppelen.",
    promise: "Je begrijpt hoe toolrechten, validatie en bevestiging veilige acties mogelijk maken.",
    conversion: "Kies één bedrijfsactie en ontwerp de rechten en controlepunten.",
    keywords: ["Responses API tools", "AI agent tool calling", "AI CRM acties", "AI agenda koppeling", "agent workflow"],
    summary: ["De Responses API kan modellen met tools laten werken, maar jouw applicatie bepaalt welke tools bestaan en welke rechten gelden.", "Splits lezen, voorstellen en schrijven waar risico verschilt.", "Valideer argumenten, vraag bevestiging voor impactvolle acties en log resultaat zonder geheime of onnodige gegevens."],
    sections: [
      { id: "tool-is-recht", eyebrow: "Architectuur", title: "Iedere tool is een expliciet recht, geen algemene toegang", paragraphs: ["Een AI agent voert niet magisch CRM-acties uit. De applicatie biedt een afgebakende functie aan, bijvoorbeeld klant zoeken, beschikbaarheid lezen of afspraak voorstellen. Pas daarna kan het model kiezen of die functie relevant is.", "Ontwerp kleine tools met duidelijke invoer en resultaat. Een algemene functie als beheer_klant is moeilijk te controleren. Losse functies als lees_klant, maak_notitie en voorstel_afspraak maken rechten en fouten beter zichtbaar.", "Geef de agent alleen toegang tot wat voor de taak nodig is. Een intake-agent hoeft geen facturen te verwijderen of gebruikersrechten te wijzigen." ] },
      { id: "validatie", eyebrow: "Controle", title: "Valideer buiten het model en bevestig vóór impact", paragraphs: ["Controleer dataformaten, toegestane statussen, servicegebied en agenda-regels in gewone applicatielogica. Vertrouw niet op alleen een prompt voor harde bedrijfsregels.", "Laat de agent bij impactvolle acties eerst samenvatten wat hij gaat doen. De klant of medewerker bevestigt daarna. Gebruik idempotentie of dubbele-controlelogica zodat een herhaalde toolcall niet twee afspraken of taken maakt."], bullets: ["Schema-validatie voor alle argumenten.", "Autorisatie per tool en rol.", "Bevestiging voor boeken, versturen of wijzigen.", "Heldere foutmelding en fallback.", "Auditlog met minimale noodzakelijke gegevens."] },
      { id: "eerste-use-case", eyebrow: "Start", title: "Begin met een leesactie en één omkeerbare schrijfactie", paragraphs: ["Een veilige eerste route is bijvoorbeeld: klant zoeken, beschikbare blokken lezen en een terugbeltaak maken. Daarmee bewijs je integratie zonder direct complexe planning te automatiseren.", "Test de hele keten, inclusief time-outs en ontbrekende records. Voeg pas nieuwe tools toe wanneer de bestaande route meetbaar betrouwbaar is." ] }
    ],
    examples: [{ title: "CRM", text: "De agent zoekt een klant op e-mailadres, vat de vraag samen en maakt na validatie een opvolgtaak." }, { title: "Agenda", text: "De agent leest passende blokken, laat de klant kiezen en boekt pas na expliciete bevestiging." }],
    faq: [{ question: "Geeft de Responses API automatisch toegang tot mijn CRM?", answer: "Nee. Je bouwt of configureert zelf de tools en autorisatie. Het model kan alleen gebruiken wat de applicatie beschikbaar stelt." }, { question: "Moet iedere actie worden bevestigd?", answer: "Niet noodzakelijk. Stem bevestiging af op impact en omkeerbaarheid. Boeken, verzenden of financiële wijzigingen verdienen strengere controle dan alleen lezen." }, { question: "Wat gebeurt er als een tool faalt?", answer: "De applicatie moet een gecontroleerde fout teruggeven. De agent kan opnieuw proberen binnen grenzen, een alternatief bieden of overdragen aan een medewerker." }],
    related: [{ label: "Product", title: "Bekijk Autopilots CRM.", href: "/nl/producten/autopilots-crm/" }, { label: "Proces", title: "Bekijk koppelingen en architectuur.", href: "/nl/proces/" }, { label: "Kennis", title: "Test acties met evals.", href: "/nl/kennisbank/ai-agent-testen-voor-livegang-evals/" }],
    sources: [{ label: "OpenAI — Responses API", href: "https://platform.openai.com/docs/api-reference/responses" }, { label: "OpenAI — Using tools", href: "https://platform.openai.com/docs/guides/tools" }, { label: "OpenAI — Function calling", href: "https://platform.openai.com/docs/guides/function-calling" }]
  }),
  article({
    slug: "realtime-transcriptie-live-vertaling-klantcontact",
    category: "Voice AI",
    title: "Realtime transcriptie en live vertaling in klantcontact: wat is al bruikbaar?",
    accent: "bruikbaar?",
    cardTitle: "Realtime transcriptie en live vertaling",
    excerpt: "Nieuwe audiomodellen kunnen spraak live transcriberen en vertalen, maar bedrijfswaarde ontstaat pas met toestemming, kwaliteitscontrole en een concrete vervolgactie.",
    description: "Actuele gids over realtime transcriptie en live vertaling voor klantcontact, inclusief privacy, kwaliteit en CRM-verwerking.",
    intent: "Actuele uitleg over AI transcriptie en live vertaling in klantenservice.",
    audience: "Internationale service-, sales- en operationele teams.",
    promise: "Je weet welke use cases rijp zijn voor een pilot en waar controle nodig blijft.",
    conversion: "Kies één taal- of transcriptieknelpunt en meet de volledige klantuitkomst.",
    keywords: ["realtime transcriptie AI", "live vertaling klantcontact", "GPT Realtime Translate", "spraak naar tekst CRM", "meertalige voice AI"],
    summary: ["OpenAI kondigde in mei 2026 realtime modellen aan voor redenerende voice, live vertaling en streaming transcriptie.", "Transcriptie kan samenvattingen en CRM-registratie versnellen; vertaling kan bereik vergroten, maar nuance en vaktaal blijven testpunten.", "Informeer deelnemers, beperk toegang en bewaar audio of transcript alleen zolang dat voor het vastgelegde doel nodig is."],
    sections: [
      { id: "drie-toepassingen", eyebrow: "Audio 2026", title: "Transcriptie, vertaling en gesprek zijn drie verschillende taken", paragraphs: ["Streaming transcriptie zet spraak tijdens het gesprek om naar tekst. Live vertaling zet gesproken taal bijna gelijktijdig om naar een andere taal. Een realtime voice agent voert daarnaast het gesprek en kan acties uitvoeren.", "Maak dit onderscheid bij inkoop en ontwerp. Voor een gespreksverslag is betrouwbare transcriptie belangrijker dan een expressieve stem. Voor internationale opvang tellen taaldekking, vertraging en correcte overdracht. Voor een agent komen daar intentie, tools en beleid bij.", "OpenAI meldde voor GPT-Realtime-Translate ondersteuning voor meer dan zeventig invoertalen en dertien uitvoertalen bij aankondiging. Controleer actuele taalbeschikbaarheid en kwaliteit vóór je een klantbelofte maakt." ] },
      { id: "praktische-waarde", eyebrow: "Waarde", title: "Koppel audio direct aan een beperkte vervolgactie", paragraphs: ["Een transcript zonder route wordt een extra document. Laat het systeem bijvoorbeeld een concept-samenvatting maken, verplichte velden voorstellen en een medewerker laten bevestigen voordat CRM wordt bijgewerkt.", "Bij live vertaling kan de agent een meertalige eerste intake doen en daarna met beide taalversies overdragen. Begin met voorspelbare onderwerpen en vermijd autonome beslissingen waar een vertaalfout grote gevolgen heeft."], bullets: ["Gespreksverslag als concept, niet automatisch als absolute waarheid.", "Vakwoorden, namen en codes expliciet teruglezen.", "Originele taal behouden naast de vertaling.", "Menselijke controle bij klachten, veiligheid en juridische context."] },
      { id: "privacy-kwaliteit", eyebrow: "Controle", title: "Test toestemming, taalvariatie en bewaarbeleid samen", paragraphs: ["Maak duidelijk dat transcriptie of AI-verwerking plaatsvindt en leg een passende grondslag en bewaartermijn vast. Beperk wie audio en transcript kan openen.", "Test met accenten, rumoer, code-switching, vaktermen en slechte verbindingen. Meet niet alleen woordnauwkeurigheid, maar of de juiste klantactie volgt. Een leesbaar transcript met een verkeerde afspraak is operationeel nog steeds fout." ] }
    ],
    examples: [{ title: "Internationale intake", text: "De klant spreekt zijn voorkeurstaal; de planner ontvangt origineel, vertaling en een gecontroleerde samenvatting." }, { title: "Serviceverslag", text: "Na toestemming wordt een conceptverslag gemaakt en pas na medewerkercontrole in CRM opgeslagen." }],
    faq: [{ question: "Kan live vertaling een tolk vervangen?", answer: "Voor eenvoudige klantcontactstromen kan het helpen. Bij juridische, medische of andere hoog-risicocontext blijft een gekwalificeerde menselijke route passend." }, { question: "Moet ik audio bewaren voor een transcript?", answer: "Niet automatisch. Ontwerp opslag op doel, grondslag en noodzakelijkheid. Soms kan audio na verwerking worden verwijderd terwijl een gecontroleerde samenvatting wordt bewaard." }, { question: "Werkt transcriptie met ieder accent even goed?", answer: "Kwaliteit verschilt per taal, accent, microfoon en omgeving. Test met representatieve gesprekken uit je eigen doelgroep." }],
    related: [{ label: "Product", title: "Bekijk AI Telefoniste.", href: "/nl/producten/ai-telefoniste/" }, { label: "Privacy", title: "Lees onze privacyinformatie.", href: "/nl/privacy/" }, { label: "Afspraak", title: "Bespreek een meertalige pilot.", href: "/nl/afspraak/" }],
    sources: [{ label: "OpenAI — Advancing voice intelligence in the API", href: "https://openai.com/index/advancing-voice-intelligence-with-new-models-in-the-api/" }, { label: "OpenAI — Speech to text", href: "https://platform.openai.com/docs/guides/speech-to-text" }, { label: "OpenAI — Realtime API", href: "https://platform.openai.com/docs/guides/realtime" }]
  })
];
