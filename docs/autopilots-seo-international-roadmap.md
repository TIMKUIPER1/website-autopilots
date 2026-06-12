# Autopilots SEO & Internationale Website Roadmap

Dit document is bedoeld als kennisbank voor de nieuwe Autopilots website. Gebruik dit naast `Autopilots Style Stack Kennisbank.md`.

## Kernpositie

Autopilots bouwt AI medewerkers voor klantcontact, operatie, planning, support, voice, chat, CRM en follow-up. De site moet internationaal kunnen ranken op niche-intenties zoals:

- AI voor autobedrijven
- AI for car dealerships
- AI voor makelaars
- AI receptionist for dental clinics
- AI customer service for property management
- AI claims intake for insurance companies

De propositie moet menselijk blijven: AI maakt klantcontact persoonlijker doordat ieder contactmoment wordt geregistreerd en omgezet in bruikbare context.

## Internationale URL-structuur

Gebruik locale folders:

- `/nl/`
- `/en/`
- `/de/`
- `/fr/`
- `/es/`
- `/it/`
- `/pt/`
- `/pl/`
- `/sv/`
- `/da/`
- `/no/`
- `/fi/`
- `/tr/`
- `/ar/`
- `/id/`

Per taal krijgt elke niche een eigen slug. Voorbeeld:

- `/nl/branches/autobedrijven/`
- `/en/industries/car-dealerships/`
- `/de/branchen/autohaeuser/`
- `/fr/secteurs/concessions-automobiles/`

SEO-regel: gebruik `hreflang` per taalvariant, een canonical naar de eigen taalpagina en een taalkeuze die crawlbaar blijft. Gebruik IP/browsertaal alleen voor een eerste bezoek op `/`, niet als harde redirect voor alle pagina's.

## Template Per Niche

Elke nichepagina krijgt:

1. Hero met primaire zoekterm.
2. Probleemtekst die de branche herkent.
3. Voorbeeldgesprek in chat/voice.
4. Workflow met systeemacties.
5. AI-brein per niche.
6. Calculator met tijdwinst plus extra klanten/marge.
7. SEO-copy met long-tail zoekwoorden.
8. FAQ's voor rich results.
9. Afspraak CTA met kalenderembed.
10. Schema: `Organization`, `Service`, `FAQPage`, `BreadcrumbList`.

## Bestaande Embed-Content Die Meegenomen Moet Worden

De volgende bestaande lokale embedpagina's zijn bronmateriaal voor de nieuwe code-first website:

- `projecten/voice/autopilots-voice-bron.html`: Voice Agent AI, inbound/outbound bellen, triage, doorverbinden, afspraken plannen en CRM-notities.
- `projecten/chat/autopilots-chat-bron.html`: Chat AI voor websitevragen, WhatsApp/SMS, social DM's, kennisbank, tone of voice en menselijke fallback.
- `projecten/follow-up/autopilots-follow-up-bron.html`: opvolging via WhatsApp, SMS, mail en telefonie, reply-classificatie en professioneel stoppen.
- `projecten/planning/autopilots-planning-bron.html`: agenda, routeoptimalisatie, capaciteit, statusupdates en gaten vullen.
- `projecten/support/autopilots-support-bron.html`: supportvragen, kennisbank, tickets, urgentie en overdracht.
- `projecten/contact/autopilots-contact-bron.html`: receptie, intake, routing en context naar het team.
- `crm-landing-page/autopilots-crm-landing-embed.html`: funnel, salesdata, pipeline, AI opvolging, afspraken, reviews, automatisering en CRM modules.
- `leadsmachine-ai-landing-page/autopilots-leadsmachine-ai-landing-embed.html`: klantenmachine/leadsmachine modules en conversieflow.
- `niche-landing-pages/*`: alle branchespecifieke pijnpunten, voorbeeldgesprekken, voice-test, kalenderembed en CTA-copy.

Belangrijk: nieuwe pagina's mogen deze teksten niet letterlijk kwijt raken. Ze mogen compacter en premium herschreven worden, maar de inhoudelijke elementen moeten terugkomen op homepage, dienstenpagina, servicepagina's en nichepagina's.

## Calculatorlogica

Elke calculator moet twee waardes tonen:

- Tijdwinst: volume x minuten handwerk x percentage AI-afhandeling.
- Groei: extra opgevolgde kansen x verwachte conversie x marge per extra klant/opdracht/case.

Voorbeeld labels:

- Autobedrijven: leads/proefritten, marge per extra verkoop.
- Vastgoedbeheer: tickets, tijd per melding, waarde per voorkomen escalatie.
- Verzekeraars: claims/polisvragen, waarde per compleet dossier.
- Tandartsen: patientvragen, receptietijd, marge per extra behandeling.

Vermijd verwarring zoals “met AI blijven 10 kansen liggen”. Gebruik:

- “Gemist zonder AI”
- “Extra opgevolgd door AI”
- “Extra klanten verwacht”
- “Extra marge naast tijdwinst”

## Niche SEO Analyse

| Niche | Primaire pagina | Zoekintentie | Keyword clusters | Calculator focus |
|---|---|---|---|---|
| Autobedrijven | AI voor autobedrijven | Leads sneller opvolgen, proefritten plannen, voorraadvragen beantwoorden | AI voor autobedrijven, AI car dealership, AI lead opvolging auto, proefrit automatisch plannen, automotive AI receptionist | Extra proefritten, extra verkopen, CRM-tijd |
| Makelaars | AI voor makelaars | Bezichtigingen plannen en kandidaten kwalificeren | AI voor makelaars, AI real estate assistant, bezichtiging automatisch plannen, vastgoed lead opvolging | Bezichtigingen, gekwalificeerde kandidaten, extra opdrachten |
| Tandartsen | AI voor tandartsen | Telefoondruk verminderen, afspraken en spoed triage | AI voor tandartsen, AI dental receptionist, tandarts afspraken plannen, spoed triage AI | Receptietijd, extra behandelingen, minder gemiste oproepen |
| Hotels | AI voor hotels | Gastvragen, reserveringen en serviceverzoeken afhandelen | AI hotel receptionist, AI guest support, hotel chatbot, reservering automatiseren | Gastvragen, reserveringen, upsell |
| Restaurants | AI voor restaurants | Reserveringen, groepsaanvragen en dieetwensen | AI restaurant reservations, restaurant chatbot, AI reserveringen, groepsaanvraag restaurant | Reserveringen, groepsboekingen, minder telefoontjes |
| Installatietechniek | AI voor installatiebedrijven | Storingen, werkbonnen en planning voorbereiden | AI voor installateurs, AI service planning, storing intake AI, werkbon automatisch | Werkbonnen, storingsintake, extra serviceklussen |
| Dakdekkers | AI voor dakdekkers | Lekkages en inspecties sneller plannen | AI voor dakdekkers, daklekkage intake, dakinspectie plannen | Inspecties, spoedaanvragen, offertewaarde |
| Glaszetters | AI voor glaszetters | Glasschade veilig triageren en opname plannen | AI voor glaszetters, glasschade intake, ruit vervangen afspraak | Opnames, spoedgevallen, extra opdrachten |
| Hoveniers | AI voor hoveniers | Tuinvragen kwalificeren en intakes plannen | AI voor hoveniers, tuinonderhoud offerte AI, hovenier intake | Intakes, onderhoudscontracten, marge per opdracht |
| Kozijnen | AI voor kozijnenbedrijven | Inmeetafspraken en materiaalwensen vastleggen | AI voor kozijnen, kozijn offerte AI, inmeten afspraak plannen | Inmeetafspraken, extra offertes, marge |
| Zonnepanelen | AI voor zonnepanelenbedrijven | Adviesgesprekken en dakchecks voorbereiden | AI zonnepanelen leads, solar AI assistant, zonnepanelen intake | Adviesgesprekken, extra installaties, leadkwaliteit |
| Vastgoedbeheerders | AI voor vastgoedbeheer | Huurdersmeldingen, tickets en leveranciersrouting | AI vastgoedbeheer, property management AI, huurdersmelding automatisch, onderhoud ticket AI | Tickets, beheerderstijd, voorkomen escalaties |
| Woningcorporaties | AI voor woningcorporaties | Bewonersmeldingen en onderhoudsvragen routeren | AI woningcorporatie, bewonersservice AI, reparatieverzoek automatisch | Meldingen, onderhoudstickets, responstijd |
| Verzekeraars | AI voor verzekeraars | Claims, polisvragen en documentchecks voorbereiden | AI verzekeraars, insurance claims AI, schade intake AI, polisvragen automatiseren | Dossiers, incomplete claims, medewerkerstijd |
| Kapperszaken | AI voor kappers | Afspraken boeken en behandelingen uitvragen | AI kapper afspraken, salon AI receptionist, kapperszaak chatbot | Afspraken, no-shows, extra behandelingen |
| Cosmetische klinieken | AI voor cosmetische klinieken | Consulten kwalificeren en intake voorbereiden | AI cosmetische kliniek, aesthetic clinic AI, consult intake AI | Consulten, behandelintentie, marge |
| Evenementen | AI voor evenementenbedrijven | Aanvragen kwalificeren op datum, budget en locatie | AI event planner, evenementen aanvraag AI, event intake chatbot | Intakes, offertewaarde, responstijd |
| Non-profit | AI voor non-profit | Donateurs, vrijwilligers en algemene vragen routeren | AI non-profit, charity chatbot, vrijwilliger intake AI | Contactmomenten, vrijwilligerintakes, donateurvragen |
| Dierenarts | AI voor dierenartsen | Klachten triageren en consulten plannen | AI dierenarts, veterinary AI receptionist, spoed triage huisdieren | Consulten, triage, receptietijd |
| Dierenverzorging | AI voor dierenverzorging | Boekingen, opvangvragen en intake voorbereiden | AI pet care, dierenopvang chatbot, trimsalon afspraak AI | Boekingen, intakes, capaciteit |
| Vloerenleggers | AI voor vloerenleggers | Opnames plannen en m2/type vloer vastleggen | AI vloerenlegger, vloer offerte AI, vloeropname plannen | Opnames, offertewaarde, extra opdrachten |

## Contentrichtlijnen Per Niche

Schrijf alsof Autopilots het probleem beter begrijpt dan de bezoeker:

- benoem waar tijd lekt;
- benoem waar klanten afhaken;
- benoem welke informatie vaak ontbreekt;
- benoem welke systemen bijgewerkt moeten worden;
- laat zien wat de AI direct doet;
- sluit af met afspraakplanning.

Gebruik per niche concrete woorden uit het werkproces. Niet alleen “AI chatbot”, maar “proefrit”, “schademelding”, “spoedtriage”, “huurdersmelding”, “werkbon”, “bezichtiging”, “inmeetafspraak”.

## AI-Brein Uitleg

Homepage:

- leg uit wat een AI-brein is;
- leg uit waarom data belangrijk wordt;
- maak duidelijk dat Autopilots AI persoonlijk brengt.

Nichepagina:

- toon het specifieke AI-brein per branche;
- gebruik branchechips;
- toon dat contactdata naar CRM, agenda, tickets en follow-up gaat;
- benoem menselijke fallback.

## Technische SEO Taken

- Locale routes genereren voor alle 15 talen.
- Per locale `hreflang` tags toevoegen.
- Per niche title/description per taal schrijven.
- FAQ schema per niche.
- Sitemap per locale.
- Breadcrumb schema.
- Interne links vanuit diensten naar niches.
- Interne links vanuit niches naar proces en afspraak.
- Geen harde IP-redirect op nichepagina's; alleen taaladvies of eerste bezoek op `/`.
