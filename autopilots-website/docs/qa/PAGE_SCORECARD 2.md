# Page scorecard

Scores zijn gebaseerd op design (20), responsive (15), functionaliteit (15), CRO (20), SEO (15), performance (10) en accessibility (5). Externe boeking/betaling is niet als live geverifieerd.

| Rang | Pagina | Design | Resp. | Funct. | CRO | SEO | Perf. | A11y | Totaal |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | `/voor-wie/autobedrijven/` | 18 | 13 | 14 | 17 | 13 | 8 | 4 | **87** |
| 2 | `/producten/ai-inboxmedewerker/` | 18 | 13 | 13 | 17 | 13 | 8 | 4 | **86** |
| 3 | `/kennisbank/wat-is-een-ai-medewerker/` | 17 | 13 | 12 | 15 | 15 | 8 | 4 | **84** |
| 4 | `/producten/` | 18 | 13 | 13 | 16 | 12 | 8 | 4 | **84** |
| 5 | `/proces/` | 18 | 12 | 14 | 14 | 11 | 8 | 4 | **81** |
| 6 | `/crew/` | 18 | 13 | 12 | 14 | 11 | 7 | 4 | **79** |
| 7 | `/bestel-direct/` | 17 | 12 | 13 | 16 | 10 | 7 | 4 | **79** |
| 8 | `/voorstel/autobedrijven/` | 17 | 12 | 11 | 16 | 8 | 6 | 4 | **74** |
| 9 | `/afspraak/` | 16 | 11 | 9 | 14 | 10 | 6 | 4 | **70** |
| 10 | `/nl/` | 16 | 11 | 10 | 12 | 9 | 8 | 4 | **70** |
| 11 | `/lp/autobedrijven/ai-medewerker/ervaring/` | 17 | 11 | 8 | 13 | 4 | 8 | 4 | **65** |
| 12 | `/lp/autobedrijven/ai-medewerker/` | 16 | 10 | 7 | 13 | 3 | 8 | 4 | **61** |
| 13 | `/` taalkeuze | 16 | 13 | 10 | 6 | 7 | 9 | 4 | **65** |
| 14 | `/nl/producten/ai-inboxmedewerker/` | 12 | 10 | 7 | 7 | 6 | 9 | 4 | **55** |
| 15 | `/nl/voor-wie/autobedrijven/` | 12 | 10 | 6 | 6 | 6 | 9 | 4 | **53** |
| 16 | `/nl/afspraak/` | 11 | 10 | 2 | 3 | 6 | 9 | 4 | **45** |
| 17 | `/nl/bestel-direct/` | 11 | 10 | 2 | 2 | 6 | 9 | 4 | **44** |

## Drie verbeterpunten per paginagroep

### Volwaardige nichepagina’s

1. Maak deze pagina’s eigenaar van de Nederlandse locale-route en canonical.
2. Verifieer alle demo-, ROI-, prijs- en CTA-interacties in één browsermatrix.
3. Voeg bewijsbare social proof toe zonder algemene of ongefundeerde claims.

### Volwaardige productpagina’s

1. Harmoniseer product → niche → voorstel zonder sprong tussen prefixed en unprefixed routes.
2. Verifieer queryparameters, browser back/forward en opgeslagen productkeuze.
3. Voeg product-specifieke structured data toe waar dit zichtbaar en feitelijk klopt.

### Kennisbank en artikelen

1. Houd bronnen en updatedatums redactioneel aantoonbaar actueel.
2. Voeg echte vertalingen pas toe na native review.
3. Meet blog → product en blog → niche met een echte analyticsprovider.

### Afspraak

1. Maak één route-eigenaar en toon daar de GHL-kalender.
2. Voeg dynamische iframehoogte/fallback en een booking-confirmation event toe.
3. Verifieer de volledige afspraak in een testkalender.

### Direct bestellen en voorstel

1. Maak de locale-bestelroute functioneel gelijkwaardig.
2. Verifieer Stripe buy-button IDs en products/prices in Stripe testmode of gecontroleerde live checklist.
3. Voeg server-side/order webhook observability en succes-/annuleringspaden toe.

### Campagnefunnel

1. Configureer de backend op de gekozen host.
2. Voeg rate limiting en idempotency toe.
3. Verifieer mobiel, CRM-upsert, tags, attribution en GHL-agenda met herkenbare testdata.

### Locale-routes

1. Vervang generieke `LocalizedRoutePage` voor Nederlandse commerciële routes door de volwaardige componenten.
2. Maak unieke metadata en inhoud of zet onvoltooide locales tijdelijk noindex.
3. Herstel H1-schaal naar het merkmaximum en rond 200%-zoomtests af.

