# Autopilots GPT Design Kennisbank

Deze kennisbank is bedoeld voor developers, designers en GPT-assistenten die creatives, websites, landingspagina's, voorstelpagina's, dashboards, e-mails of embeds maken voor Autopilots.

Alles wat je maakt moet voelen alsof het uit een helder, premium systeem komt.

Niet schreeuwerig.  
Niet corporate.  
Niet generiek AI.  
Wel strak, slim, menselijk en commercieel sterk.

## 1. Merkgevoel

Autopilots gebruikt een clean SaaS stijl met Apple-achtige rust.

De stijl is:

- Premium
- Rustig
- Scherp
- Modulair
- Veel witruimte
- Sterke cards
- Duidelijke hierarchie
- Zachte borders
- Subtiele shadows
- Roestbruin als herkenbare accentkleur

De pagina moet voelen als een modern SaaS product, niet als een drukke marketingpagina.

De bezoeker moet binnen 5 seconden snappen:

- Wat het aanbod is
- Voor wie het is
- Welk probleem het oplost
- Waarom het werkt
- Wat de volgende stap is

## 2. Brand Tokens

Gebruik altijd deze kleuren.

```css
:root {
  --ap-bg: #f5f5f2;
  --ap-card: #ffffff;
  --ap-soft: #eeeeea;
  --ap-soft-2: #f8f8f5;
  --ap-text: #111111;
  --ap-muted: #656565;
  --ap-line: rgba(0, 0, 0, 0.1);
  --ap-brown: #9f3826;
  --ap-brown-dark: #7d2a1d;
  --ap-black: #111111;
  --ap-white: #ffffff;
  --ap-green-soft: #dce9dd;
}
```

Gebruik:

- Achtergrond: `#f5f5f2`
- Cards: `#ffffff`
- Subcards: `#f8f8f5`
- Tekst: `#111111`
- Secundaire tekst: `#656565`
- Accentkleur: `#9f3826`
- Donkere secties: `#111111`
- Borders: `rgba(0, 0, 0, 0.1)`

Roestbruin is een accentkleur. Gebruik deze voor CTA's, badges, subtiele highlights en belangrijke accenten. Gebruik roestbruin niet als dominante hoofdkleur voor de volledige pagina.

## 3. Typografie

Gebruik altijd Public Sans en Syne.

```css
@import url("https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800;900&family=Syne:wght@500;600;700&display=swap");
```

Gebruik Public Sans voor:

- Titels
- Subtitels
- Body tekst
- Buttons
- Navigatie
- FAQ tekst
- Formulieren
- Labels

Gebruik Syne voor:

- Eyebrows
- Badges
- Cijfers
- Metrics
- Kleine accenten
- Prijsnummers
- Statistieken

Font weights:

- Hero titel: Public Sans 800 of 900
- Sectietitel: Public Sans 800 of 900
- Body tekst: Public Sans 400 tot 500
- Buttons: Public Sans 800
- Badges: Syne 600 of 700
- Cijfers: Syne 600 of 700

Cijfers mogen stevig zijn, maar nooit schreeuwerig of overdreven groot.

## 4. Layout Regels

Container:

- Max width websites en landingspagina's: `1120px`
- Desktop padding: `18px`
- Mobile padding: `14px`

Sections:

- Desktop section padding: `80px 0`
- Mobile section padding: `58px 0`

Cards:

- Border radius: `24px` tot `34px`
- Padding: `24px` tot `30px`
- Background: `#ffffff`
- Border: `1px solid rgba(0, 0, 0, 0.1)`
- Shadow: subtiel, niet zwaar

Buttons:

- Border radius: `999px`
- Primary: bruin met witte tekst
- Secondary: wit met zwarte tekst en border
- Buttons zijn helder, compact en commercieel duidelijk

Grids:

- Desktop: 2 of 3 kolommen
- Mobiel: 1 kolom
- Cards moeten netjes uitlijnen
- Tekst mag nooit uit cards lopen
- Gebruik liever meer witruimte dan te volle cards

## 5. CSS Scoping

Alle losse HTML/CSS moet scoped zijn met een unieke wrapper ID.

Gebruik nooit globale styling zonder wrapper.

Voorbeeld:

```html
<div id="ap-page">
  <!-- content -->
</div>
```

```css
#ap-page {
  background: #f5f5f2;
}

#ap-page .ap-card {
  background: #ffffff;
}
```

Dit voorkomt dat styling botst met GoHighLevel, Webflow, WordPress of andere builders.

## 6. Website Stack Advies

Voor een moderne Autopilots website is de voorkeursrichting:

- Astro voor de publieke marketingwebsite
- Cloudflare Pages of Vercel voor hosting
- Railway voor backend, API's, automations en webhooks
- GoHighLevel voor CRM, formulieren, calendar, pipelines en opvolging
- Codex of GPT als prompt-based beheerlaag voor copy, design en componenten

Astro is vooral sterk voor:

- SEO-websites
- Landingspagina's
- Blogs en kennisbanken
- Case studies
- Dienstpagina's
- Snelle marketingpagina's
- Embeds van GoHighLevel, formulieren, calculators en tracking

Next.js is logischer wanneer er veel app-functionaliteit nodig is:

- Login
- Klantportalen
- Dashboards
- Realtime data
- Complexe server-side logic
- SaaS-functionaliteit

Voor Autopilots geldt meestal:

- Publieke website: Astro
- Backend/automations: Railway
- CRM/sales opvolging: GoHighLevel

## 7. Standaard Sales Page Structuur

Gebruik deze volgorde voor bijna elke sales page:

1. Hero  
   Belofte, context en directe CTA.

2. Probleem  
   Waarom de huidige situatie geld, tijd of kansen kost.

3. Business case  
   Waar zit de commerciele winst?

4. Hoe het systeem werkt  
   Top funnel, midden funnel en onder funnel.

5. Openklapbare uitleg  
   Voor bezoekers die meer diepte willen.

6. Calculator of prognose  
   Alleen als dit de beslissing makkelijker maakt.

7. Pakketten of voorstel  
   Duidelijk, koopgericht en niet te druk.

8. Implementatieproces  
   Ontwerp, bouw, review, livegang en optimalisatie.

9. FAQ  
   Bezwaren wegnemen.

10. CTA  
    Start, boek, bevestig of kies pakket.

## 8. Hero Richtlijnen

Een goede Autopilots hero bevat:

- Eyebrow
- Grote titel
- Italic of bruin accent
- Korte duidelijke subtitel
- 1 primaire CTA
- 1 secundaire CTA
- Optioneel 3 cards onder de hero

Voorbeeldstructuur:

```html
<section class="ap-section">
  <div class="ap-container">
    <div class="ap-center">
      <div class="ap-eyebrow">AUTOPILOTS</div>

      <h1 class="ap-hero-title">
        <span>Stel het abonnement samen en start met</span>
        <span class="ap-italic">AI Sales Chat.</span>
      </h1>

      <p class="ap-hero-text">
        Leg in normale taal uit wat het systeem doet, voor wie het is en waarom het waarde oplevert.
      </p>

      <div class="ap-actions">
        <a class="ap-button primary" href="#start">Start direct</a>
        <a class="ap-button secondary" href="#uitleg">Bekijk hoe het werkt</a>
      </div>
    </div>
  </div>
</section>
```

## 9. Copywriting Regels

Schrijf altijd in het Nederlands.

Gebruik korte zinnen. Maak het concreet.

Geen vage AI woorden.  
Geen overdreven claims.  
Geen corporate taal.  
Geen lege marketingzinnen.

Leg altijd uit:

- Wat gebeurt er?
- Waarom werkt het?
- Wat levert het op?
- Wat moet de klant doen?

Tone of voice:

- Menselijk
- Slim
- Eerlijk
- Rustig
- Direct
- Praktisch
- Commercieel sterk
- Niet salesy

Vermijd:

- Revolutionair
- Gamechanger
- Magisch
- Ontgrendel
- Transformeer je business
- AI powered zonder uitleg
- Next level zonder context
- Naadloos tenzij concreet uitgelegd
- State of the art
- De toekomst van
- Ontdek de kracht van
- Revolutionaire oplossing

Woorden die goed passen:

- AI medewerker
- Opvolging
- Afspraakplanning
- Leadkwalificatie
- Sales pipeline
- CRM verwerking
- Gesprekslogica
- Kennisbasis
- Flow
- Funnel
- Bottleneck
- Overdracht
- Context
- Livegang
- Monitoring
- Optimalisatie
- Voorspelbare instroom
- Klantenmachine
- Sales systeem

## 10. Componenten

Gebruik:

- Hero secties
- Cards
- Pricing cards
- FAQ's met `details` en `summary`
- CTA buttons
- Grids
- Badges
- Procesblokken
- Calculators waar nuttig
- Heldere business case blokken
- Funnel visualisaties

Openklapbare cards gebruik je voor:

- FAQ
- Implementatieproces
- Adviesblokken
- Funnelstappen
- Pakketdetails
- Usage voorwaarden

Voorbeeld:

```html
<details class="ap-acc" open>
  <summary>
    <span class="ap-stepnr">1</span>
    <div>
      <h3 class="ap-acc-title">Ontwerp en inrichting</h3>
      <p class="ap-acc-sub">We vertalen jullie werkwijze naar een duidelijke AI flow.</p>
    </div>
    <span class="ap-plus">+</span>
  </summary>

  <div class="ap-acc-content">
    <p>
      We bepalen tone of voice, uitzonderingen, kwalificatievragen, overdracht en technische inrichting.
    </p>
  </div>
</details>
```

## 11. Calculator Regels

Een calculator moet simpel blijven.

Niet te veel vakjes.  
Niet te veel cijfers.

Gebruik maximaal:

- 3 input groepen
- 3 overzicht cijfers
- 2 vergelijkingscards
- 1 impact blok

Laat altijd zien:

- Zonder AI
- Met AI
- Het verschil door AI

Gebruik duidelijke woorden. Vermijd ingewikkelde financiele termen als dat niet nodig is.

Als er kosten zijn, wees eerlijk wat wel en niet is meegenomen.

Voorbeelden:

- Gebruikerskosten en implementatie zijn niet meegenomen in deze marge.
- Marge na abonnement, exclusief usage en implementatie.

## 12. Pricing Cards

Pricing cards moeten gelijk uitgelijnd zijn.

Regels:

- Alle pakketnamen op gelijke hoogte
- Alle prijzen op gelijke hoogte
- Korte beschrijvingen ongeveer even lang
- Geen te lange zinnen in bullets
- Usage en voorwaarden in `details`
- Stripe buy buttons onderaan wanneer aangeleverd

Als er 3 pakketten zijn:

- Start links
- Scale midden en highlighted
- Premium rechts

Scale mag bruin zijn. Start en Premium blijven wit.

## 13. Implementatieproces

Standaard implementatieproces:

1. Ontwerp en inrichting  
   We vertalen de werkwijze naar gesprekslogica, tone of voice, uitzonderingen en technische inrichting.

2. Bouw en testen  
   We bouwen de AI medewerker, richten koppelingen in en testen belangrijke scenario's.

3. Review en livegang  
   We lopen alles samen door, verwerken feedback en zetten klaar voor livegang.

4. Monitoring en optimalisatie  
   Na livegang monitoren we prestaties en sturen we bij op basis van echte data.

Gebruik openklapbare cards voor extra uitleg.

## 14. Funnel Visualisatie

Bij funnels altijd denken in 3 lagen.

Top funnel:

- Leads genereren
- Doelgroep bereiken
- Zichtbaarheid opbouwen

Midden funnel:

- Opvolging
- Retargeting
- Kwalificatie
- Interesse opbouwen

Onder funnel:

- CRM systeem
- Afspraken boeken
- Overdracht
- Pipeline updates

Voor Klantenmachine AI:

Top funnel:

- LinkedIn outreach
- Online marketing via Meta

Midden funnel:

- AI opvolging van leads
- Retargeting met passende content

Onder funnel:

- CRM verwerking
- Afspraakplanning

## 15. E-mailmarketing Regels

E-mails zijn anders dan websites.

Gebruik:

- Geen JavaScript
- Maximaal 600px breedte
- Tables voor structuur
- Inline CSS waar mogelijk
- Public Sans met Arial fallback
- Korte tekst
- 1 duidelijke CTA
- Geen zware layout
- Geen openklapbare elementen
- Geen externe scripts

## 16. Output Regels Voor GPT

Wanneer de gebruiker vraagt om code:

- Geef alleen de volledige code in een HTML codeblok
- Geen extra uitleg tenzij gevraagd
- Zorg dat de code direct copy-paste klaar is
- Gebruik pure HTML, CSS en simpele JavaScript
- Gebruik geen frameworks voor losse embeds
- Gebruik geen externe libraries behalve Google Fonts
- Gebruik geen globale CSS
- Scope alles met een unieke wrapper ID
- Gebruik responsive CSS
- Controleer dat alle cards uitlijnen
- Controleer dat tekst niet buiten cards valt
- Controleer mobiel

Wanneer de gebruiker vraagt om een e-mailtemplate:

- Gebruik HTML e-mailcode
- Gebruik tables
- Gebruik inline styling
- Gebruik geen JavaScript
- Gebruik max width 600px
- Gebruik een duidelijke CTA
- Maak het kort en professioneel

## 17. SEO Richtlijnen

Voor websites en landingspagina's:

- Gebruik per pagina een unieke title
- Gebruik per pagina een concrete meta description
- Gebruik 1 duidelijke H1
- Gebruik logische H2/H3 structuur
- Gebruik interne links naar relevante pagina's
- Voeg FAQ schema toe waar FAQ's gebruikt worden
- Voeg Organization schema toe op de hoofdsite
- Voeg Service schema toe op dienstpagina's
- Gebruik canonical URLs
- Zorg voor sitemap.xml en robots.txt
- Houd de pagina snel en licht
- Gebruik zo min mogelijk externe scripts
- Laad embeds pas waar ze nodig zijn

SEO-copy moet concreet blijven. Schrijf voor ondernemers, niet voor zoekmachines alleen.

## 18. Embeds en Integraties

GoHighLevel mag gebruikt worden voor:

- Forms
- Calendars
- Chat widgets
- CRM opvolging
- Pipelines
- Automations
- Tracking waar nodig

De website zelf moet zoveel mogelijk code-first blijven.

Embeds moeten:

- Visueel passen binnen Autopilots stijl
- Niet onnodig vroeg laden
- Geen layout shift veroorzaken
- Op mobiel goed werken
- Niet de hele pagina overnemen

## 19. Kwaliteitscheck

Controleer altijd:

- Is de hero direct duidelijk?
- Is het aanbod binnen 5 seconden te begrijpen?
- Zijn alle cards netjes uitgelijnd?
- Zijn titels niet te lang?
- Is er genoeg witruimte?
- Is de CTA concreet?
- Is de pagina mobiel goed leesbaar?
- Loopt er geen tekst uit cards?
- Zijn Public Sans en Syne goed gebruikt?
- Zijn de kleuren consistent?
- Is het niet te druk?
- Is het geen generieke AI marketing?
- Legt de pagina uit waarom dit werkt?
- Is duidelijk wat de volgende stap is?
- Werken buttons en anchors?
- Zijn embeds responsive?
- Is de pagina technisch SEO-proof?

## 20. Master Prompt

Gebruik deze prompt wanneer je iets in Autopilots stijl wilt laten maken:

```md
Je bent mijn Autopilots design, frontend en conversion engineer.

Maak de gevraagde creative volledig in Autopilots stijl.

Design:
Clean SaaS, Apple-achtig, premium, rustig, veel witruimte, modulair, professioneel, niet schreeuwerig.
Gebruik een gebroken witte achtergrond, witte cards, zwarte tekst, zachte grijze borders en Autopilots roestbruin als accentkleur.

Kleuren:
Background: #f5f5f2
Card: #ffffff
Soft: #eeeeea
Soft 2: #f8f8f5
Text: #111111
Muted: #656565
Line: rgba(0, 0, 0, 0.1)
Autopilots brown: #9f3826
Autopilots brown dark: #7d2a1d
Black: #111111
White: #ffffff

Fonts:
Gebruik Public Sans voor titels, subtitels, body en buttons.
Gebruik Syne voor eyebrows, cijfers, badges en kleine visuele accenten.
Titels mogen groot en strak.
Cijfers mogen Syne bold zijn, maar niet overdreven groot.

Layout:
Max width 1120px voor websites en landingpagina's.
Max width 600px voor e-mails.
Section padding desktop 80px, mobile 58px.
Cards radius 24px tot 34px.
Buttons volledig afgerond.
Gebruik grids met 2 of 3 kolommen op desktop en 1 kolom op mobiel.
Alle CSS moet scoped zijn met een unieke wrapper ID zodat het niet botst met andere pagina elementen.

Contentstijl:
Schrijf in het Nederlands.
Gebruik korte zinnen.
Geen fluff.
Geen corporate taal.
Geen vage AI marketing.
Leg concreet uit wat het systeem doet, waarom het werkt en wat de gebruiker eraan heeft.
Maak het menselijk, duidelijk en praktisch.
Gebruik geen overdreven marketingclaims.
Schrijf alsof je tegen een slimme ondernemer praat.

Componenten:
Gebruik hero secties, cards, pricing cards, openklapbare FAQ's met details en summary, CTA buttons, grids, badges, calculators waar nodig en duidelijke procesblokken.
Maak alles responsive.
Zorg dat alle cards en teksten perfect uitgelijnd zijn.
Voorkom tekst die uit cards loopt.
Gebruik genoeg witruimte.
Gebruik geen externe libraries behalve Google Fonts.
Gebruik geen framework bij losse HTML embeds.

Voor e-mailtemplates:
Gebruik geen JavaScript.
Gebruik tables en inline CSS waar mogelijk.
Maak de breedte maximaal 600px.
Gebruik Public Sans met Arial fallback.
Gebruik korte stukken tekst en duidelijke CTA.
Zorg dat het werkt in zoveel mogelijk e-mailclients.

Output:
Geef alleen de volledige kant-en-klare code in een HTML codeblok.
```

## 21. Belangrijkste Regel

Autopilots creatives moeten altijd voelen als een helder systeem.

Niet als losse marketing.

Elke pagina, e-mail of creative moet laten zien:

- Dit is het probleem
- Dit is het systeem
- Dit is waarom het werkt
- Dit is de volgende stap
