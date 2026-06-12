# Autopilots Website Rebuild Blueprint

Doel: een mega strakke, internationale, SEO-proof Autopilots website bouwen in code, met alle bestaande pagina's, niches, forms, calendars en embeds intact.

Deze rebuild vervangt de website als pagebuilder-ervaring door een code-first systeem dat sneller, beter beheerbaar en sterker voor SEO is. GoHighLevel blijft actief voor CRM, forms, calendars, chat, pipelines en opvolging.

## 1. Uitgangspunten

- Alle bestaande pagina's blijven behouden.
- Alle bestaande forms en calendars blijven actief.
- Alle bestaande GoHighLevel embeds blijven bruikbaar.
- Niches krijgen SEO-prioriteit.
- De website wordt internationaal schaalbaar.
- Design en customer journey zijn leidend.
- De site moet via Codex/prompting aanpasbaar blijven.
- De codebase wordt de bron van waarheid.
- GoHighLevel wordt gebruikt als businesslaag, niet als primaire websitebuilder.

## 2. Aanbevolen Stack

Publieke website:

- Astro
- TypeScript waar nuttig
- Component-based structuur
- Content collections voor pagina's, niches, cases en kennisbank
- Cloudflare Pages of Vercel voor hosting

Backend en koppelingen:

- Railway voor API's, webhooks, automations en eventuele custom logic
- GoHighLevel voor CRM, forms, calendars, pipelines en follow-up

Beheer:

- GitHub voor versiebeheer
- Codex voor prompt-based wijzigingen
- Google Search Console voor SEO-monitoring
- Analytics en tracking via nette script wrappers

## 3. Designrichting

Autopilots blijft:

- Premium
- Rustig
- Clean SaaS
- Apple-achtig
- Modulair
- Vertrouwd
- Menselijk
- Commercieel sterk

Designregels:

- Gebroken witte achtergrond
- Witte cards
- Zwarte tekst
- Roestbruin als accentkleur
- Veel witruimte
- Sterke typografische hierarchie
- Duidelijke CTA's
- Subtiele motion
- Geen generieke AI-look
- Geen drukke pagebuilder-layout

Bron voor de stijl:

- `Autopilots Style Stack Kennisbank.md`
- `Autopilots GPT Design Kennisbank.md`

## 4. Customer Journey

De hoofdreis van de bezoeker:

1. Begrijpen wat Autopilots doet
2. Herkennen welk probleem ze hebben
3. Zien welk systeem dit oplost
4. Herkennen dat het past bij hun branche
5. Vertrouwen krijgen door proces, cases en concrete uitleg
6. Een passende dienst of nichepagina openen
7. Een afspraak boeken of formulier invullen
8. In GoHighLevel terechtkomen voor opvolging

Elke belangrijke pagina moet antwoord geven op:

- Voor wie is dit?
- Welk probleem lossen we op?
- Hoe werkt het systeem?
- Wat levert het op?
- Wat gebeurt er na contact?
- Waarom Autopilots?
- Wat is de volgende stap?

## 5. Hoofdstructuur Website

Aanbevolen navigatie:

- Home
- Diensten
  - AI Sales Chat
  - AI Sales Voice
  - AI Follow-up
  - Planning AI
  - Support AI
  - Contact AI
  - Website Translator
- Branches
  - Autobedrijven
  - Makelaars
  - Tandartsen
  - Hotels
  - Restaurants
  - Installatietechniek
  - Dakdekkers
  - Glaszetters
  - Hoveniers
  - Kozijnen
  - Zonnepanelen
  - Vastgoedbeheerders
  - Woningcorporaties
  - Verzekeraars
  - Kapperszaken
  - Cosmetische klinieken
  - Evenementen
  - Non-profit
  - Dierenarts
  - Dierenverzorging
  - Vloerenleggers
- Klantenmachine AI
- Cases
- Kennisbank
- Over Autopilots
- Contact

## 6. Bestaande Pagina's Die Blijven

Home:

- `projecten/homepage/autopilots-homepage-bron.html`
- `home-landing-page/autopilots-homepage-embed.html`
- `home-landing-page/autopilots-homepage-ghl-embed.html`

Diensten/projecten:

- `projecten/chat/autopilots-chat-bron.html`
- `projecten/voice/autopilots-voice-bron.html`
- `projecten/follow-up/autopilots-follow-up-bron.html`
- `projecten/planning/autopilots-planning-bron.html`
- `projecten/support/autopilots-support-bron.html`
- `projecten/contact/autopilots-contact-bron.html`
- `projecten/leadsmachine-ai/autopilots-leadsmachine-ai-bron.html`
- `projecten/website-translator/autopilots-website-translator-embed.html`
- `projecten/privacy-policy/autopilots-privacy-policy-embed.html`

Agent service landing pages:

- `agent-service-pages/chat`
- `agent-service-pages/voice`
- `agent-service-pages/follow-up`
- `agent-service-pages/planning`
- `agent-service-pages/support`
- `agent-service-pages/contact`

Niche landing pages:

- `niche-landing-pages/autobedrijven`
- `niche-landing-pages/cosmetische-klinieken`
- `niche-landing-pages/dakdekkers`
- `niche-landing-pages/dierenarts`
- `niche-landing-pages/dierenverzorging`
- `niche-landing-pages/evenementen`
- `niche-landing-pages/glaszetters`
- `niche-landing-pages/hotels`
- `niche-landing-pages/hoveniers`
- `niche-landing-pages/installatietechniek`
- `niche-landing-pages/kapperszaken`
- `niche-landing-pages/kozijnen`
- `niche-landing-pages/makelaars`
- `niche-landing-pages/non-profit`
- `niche-landing-pages/restaurants`
- `niche-landing-pages/tandartsen`
- `niche-landing-pages/vastgoedbeheerders`
- `niche-landing-pages/verzekeraars`
- `niche-landing-pages/vloerenleggers`
- `niche-landing-pages/woningcorporaties`
- `niche-landing-pages/zonnepanelen`

Voorstellen:

- Alle pagina's onder `voorstellen/` blijven behouden als proposal routes of private/shareable pages.

Shared sections:

- `shared-sections/diensten-megamenu-ghl-embed.html`
- `shared-sections/niche-megamenu-ghl-embed.html`
- `shared-sections/meet-the-crew.html`
- `shared-sections/systemen-en-samenwerkingen.html`
- `shared-sections/autopilots-shared-sections.css`
- `shared-sections/autopilots-shared-sections.js`

## 7. Niche SEO Prioriteit

Niches zijn de eerste SEO-groeimotor.

Elke niche krijgt minimaal:

- Een hoofdpagina in het Nederlands
- Een internationale Engelse variant
- Later varianten per land of taal
- Een duidelijke H1
- Unieke title en meta description
- Service schema
- FAQ schema
- Interne links naar relevante diensten
- Interne links naar vergelijkbare branches
- CTA naar afspraak of intake
- Embed wrapper voor actief form/calendar

Voorbeeld structuur:

- `/branches/autobedrijven/`
- `/en/industries/car-dealerships/`
- `/de/branchen/autohaeuser/`
- `/es/sectores/concesionarios/`

Belangrijk: internationale SEO moet niet alleen vertaald zijn. Elke markt moet lokale zoekintentie, woorden en CTA's krijgen.

## 8. Eerste SEO Clusters

Cluster 1: AI voor autobedrijven

- AI voor autobedrijven
- AI chatbot voor autobedrijven
- AI sales medewerker voor autobedrijven
- AI opvolging voor autodealers
- AI afspraken plannen voor autobedrijven
- AI voice agent voor autobedrijven
- Automotive AI sales automation
- AI for car dealerships

Cluster 2: AI voor makelaars en vastgoed

- AI voor makelaars
- AI opvolging voor makelaars
- AI chatbot voor vastgoed
- AI afspraken plannen voor bezichtigingen
- AI voor vastgoedbeheerders
- AI voor woningcorporaties

Cluster 3: AI voor servicebedrijven

- AI voor installatietechniek
- AI voor dakdekkers
- AI voor glaszetters
- AI voor hoveniers
- AI voor kozijnen
- AI voor zonnepanelen

Cluster 4: AI voor hospitality en lokale dienstverlening

- AI voor restaurants
- AI voor hotels
- AI voor kapperszaken
- AI voor cosmetische klinieken
- AI voor evenementen

Cluster 5: AI voor zorg en welzijn

- AI voor tandartsen
- AI voor dierenarts
- AI voor dierenverzorging
- AI voor non-profit

## 9. Pagina Template Voor Niches

Elke nichepagina krijgt deze customer journey:

1. Hero
   - Branche-specifieke belofte
   - Duidelijk probleem
   - Primaire CTA: afspraak boeken
   - Secundaire CTA: bekijk hoe het werkt

2. Herkenbaar probleem
   - Gemiste leads
   - Trage opvolging
   - Drukte in team
   - Verloren afspraken
   - Te weinig grip op pipeline

3. Autopilots systeem
   - AI Sales Chat
   - AI Voice
   - Follow-up
   - Planning
   - CRM verwerking

4. Branche workflow
   - Wat gebeurt er vanaf eerste contact?
   - Welke vragen stelt de AI?
   - Wanneer wordt een mens ingeschakeld?
   - Hoe komt het in de pipeline?

5. Business case
   - Meer snelheid
   - Minder handwerk
   - Meer afspraken
   - Betere opvolging
   - Minder gemiste kansen

6. Implementatieproces
   - Ontwerp en inrichting
   - Bouw en testen
   - Review en livegang
   - Monitoring en optimalisatie

7. FAQ
   - Branche-specifieke bezwaren
   - Technische vragen
   - Kosten/implementatie
   - Overdracht naar team

8. CTA/booking
   - Actieve GoHighLevel calendar of form

## 9.1 Rijke Conversie Modules

De huidige embeds bevatten sterke interactieve elementen. Die moeten niet verdwijnen in de rebuild, maar juist netter en herbruikbaar worden.

Standaard modules voor nieuwe pagina's:

- Voorbeeldgesprek per branche
- Taalkeuze voor internationale varianten
- Voice AI demo of testformulier
- Impact calculator of prognose
- Branchespecifieke intakeflow
- Proces/implementatie accordion
- Booking/calendar wrapper
- Integratie/samenwerkingen slider
- Team/crew slider
- FAQ met schema markup

Voorbeeldgesprek module:

- Bezoeker kiest branche
- Bezoeker kiest taal
- Chatvoorbeeld past direct aan
- Resultaatblok toont wat er in CRM/agenda/ticket gebeurt

Impact calculator:

- Maximaal 2 tot 3 inputs
- Laat zien: zonder AI, met AI, verschil door AI
- Gebruik duidelijke woorden, geen ingewikkelde financiele taal

Internationale SEO:

- Elke taalvariant krijgt eigen scenario's
- Niet alleen vertalen, maar ook lokale zoekintentie en woorden gebruiken
- Voorbeeld: `AI voor autobedrijven`, `AI for car dealerships`, `KI fuer Autohaeuser`

## 10. Embeds en Koppelingen

Alle bestaande forms/calendars blijven actief.

GoHighLevel wordt gekoppeld via:

- iframe wrappers voor calendars
- form embeds
- chat widget script
- tracking scripts
- CRM pipelines achter de schermen

Regels voor embeds:

- Nooit los in de pagina gooien zonder wrapper
- Altijd responsive container
- Min-height per type vastleggen
- Lazy-load waar mogelijk
- Layout shift voorkomen
- Fallback tekst tonen als embed niet laadt
- Embed visueel laten passen binnen Autopilots design

Voor Astro komt er een component:

- `GhlEmbed.astro`

Met properties:

- `type`
- `src`
- `title`
- `minHeight`
- `trackingId`
- `lazy`

## 11. SEO Techniek

Elke pagina krijgt:

- Unieke title
- Unieke meta description
- Canonical URL
- Open Graph title/image/description
- Twitter card metadata
- 1 H1
- Logische H2/H3 structuur
- Breadcrumbs
- Structured data
- Interne links
- Snelle laadtijd
- Responsive layout

Structured data:

- Organization schema
- WebSite schema
- Service schema
- FAQPage schema
- BreadcrumbList schema
- LocalBusiness alleen waar locatie relevant is

Internationale SEO:

- Taalroutes per markt
- `hreflang` tags
- Canonicals per taalvariant
- Geen automatische machinevertaling zonder lokale review
- Landingspagina's per taal met eigen zoekintentie

## 12. Astro Architectuur

Aanbevolen structuur:

```txt
src/
  components/
    layout/
      Header.astro
      Footer.astro
      SeoHead.astro
    sections/
      Hero.astro
      ProblemSection.astro
      SystemSection.astro
      BusinessCase.astro
      ProcessAccordion.astro
      FaqSection.astro
      CtaSection.astro
      NicheGrid.astro
    embeds/
      GhlEmbed.astro
      ScriptEmbed.astro
    ui/
      Button.astro
      Card.astro
      Badge.astro
      Accordion.astro
  content/
    pages/
    services/
    niches/
    cases/
    knowledge/
  layouts/
    BaseLayout.astro
    MarketingLayout.astro
    NicheLayout.astro
    ProposalLayout.astro
  pages/
    index.astro
    diensten/
    branches/
    en/
    de/
```

## 13. Contentmodel Voor Niches

Elke niche wordt een content record.

Velden:

- `slug`
- `language`
- `country`
- `title`
- `metaTitle`
- `metaDescription`
- `h1`
- `eyebrow`
- `heroText`
- `primaryCta`
- `secondaryCta`
- `problems`
- `workflowSteps`
- `services`
- `businessCase`
- `faqs`
- `relatedNiches`
- `relatedServices`
- `formEmbedId`
- `calendarEmbedId`
- `canonical`
- `hreflang`

Hierdoor kan Codex later nieuwe nichepagina's maken met prompts.

## 14. Bouwvolgorde

Fase 1: Blueprint en inventarisatie

- Alle bestaande pagina's in kaart brengen
- Alle embed URLs en scripts inventariseren
- Route map maken
- SEO-prioriteiten vastleggen

Fase 2: Design prototype in code

- Nieuwe homepage bouwen
- Nieuwe header/navigation bouwen
- Nieuwe footer bouwen
- Nieuwe nichepagina template bouwen
- Nieuwe embed wrapper bouwen
- Mobile experience controleren

Fase 3: Astro codebase

- Project scaffold
- Design tokens
- Layouts
- Components
- Content collections
- SEO componenten
- Sitemap/robots

Fase 4: Migratie bestaande pagina's

- Homepage
- Diensten
- Nichepagina's
- Klantenmachine AI
- Contact
- Privacy
- Voorstellen als aparte routes

Fase 5: Internationale SEO

- Engelse branch templates
- Hreflang structuur
- Internationale metadata
- Land/taal content framework

Fase 6: QA en livegang

- Desktop QA
- Mobile QA
- Embed QA
- Form/calendar test
- SEO metadata check
- Lighthouse/performance check
- Redirects
- DNS/hosting livegang

## 15. Eerste Concrete Deliverable

Eerst bouwen we:

- Nieuwe homepage als design prototype in code
- Nieuwe Autopilots navigation
- Nieuwe branches/niches sectie
- Nieuwe diensten sectie
- Nieuwe customer journey
- Nieuwe CTA/booking wrapper
- Nieuwe footer

Daarna bouwen we:

- Niche template
- Eerste SEO-prioriteit: AI voor autobedrijven
- Engelse variant: AI for car dealerships

## 16. Succescriteria

De rebuild is geslaagd als:

- Alle huidige pagina's bereikbaar blijven
- Alle forms/calendars werken
- De homepage premium en scherp voelt
- De nichepagina's SEO-gericht zijn
- De customer journey logisch en commercieel sterk is
- De site internationaal schaalbaar is
- Codex eenvoudig nieuwe pagina's kan aanpassen of maken
- De website sneller, rustiger en professioneler voelt dan de huidige GHL-setup

## 17. Directe Volgende Stap

Nu eerst:

1. Astro websitebasis maken.
2. Design tokens overzetten.
3. Homepage prototype bouwen.
4. GHL embed component maken.
5. Niche contentmodel maken.
6. Eerste nichepagina bouwen: AI voor autobedrijven.
