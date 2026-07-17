# Autopilots website — pre-launch audit

> **Post-repair update 16 juli 2026:** score **86/100**, status **READY AFTER EXTERNAL CONFIGURATION**. Alle P0-codeproblemen zijn hersteld. De oorspronkelijke 58/100-bevindingen hieronder blijven als baseline/auditspoor staan; actuele bewijzen staan in `REPAIR_IMPLEMENTATION_LOG.md` en `SECOND_PASS_REAUDIT.md`.

Auditdatum: 16 juli 2026  
Scope: repository, schone Astro-productiebuild, 308 gepubliceerde HTML-bestanden, routes, interne links, belangrijke klantreizen, formulieren, integraties, SEO, performance-proxy, accessibility, security, privacy en analytics.  
Oordeel: **58/100 — NOT READY**

## Managementsamenvatting

De website heeft een sterke visuele en inhoudelijke basis op de oorspronkelijke Nederlandse routes. De productiebuild is snel en technisch schoon, de centrale product-, niche- en prijsdata zijn een goede basis, 9.943 interne links doorstaan de bestaande crawler en alle aangetroffen JSON-LD is geldig JSON.

De huidige publieke architectuur is echter gesplitst. De header en taalkeuze sturen Nederlandse bezoekers naar `/nl/...`, terwijl de volwaardige product-, branche-, afspraak- en bestelervaringen op niet-voorziene Nederlandse routes zonder taalprefix staan. De nieuwe `/nl/afspraak/` bevat geen kalender en `/nl/bestel-direct/` bevat geen bestelinteractie. Daardoor falen de twee belangrijkste conversiereizen vanuit de actuele navigatie.

Daarnaast publiceert de build `/voorstel-hasan-embed.html`: een persoonlijk samenwerkingsvoorstel met namen, klantnamen, vergoedingen, commissies en strategische afspraken. `noindex` voorkomt indexatie, maar is geen toegangsbeveiliging. Dit bestand moet vóór iedere publieke deployment uit `public/`.

De advertentiefunnel heeft degelijke client- en servervalidatie, maar geen beschikbare productieconfiguratie in deze omgeving, geen rate limiting en geen idempotency. De repository noemt Cloudflare Pages of Vercel als hosting, terwijl de backend als Netlify Function is geïmplementeerd. Zonder expliciete hostingskeuze en adapter kan `/api/funnel-lead` in productie 404’en.

## Productiereadiness gates

| Gate | Resultaat | Bewijs |
|---|---|---|
| Build | PASS | Schone build: 307 Astro-pagina’s plus één publiek HTML-bestand, 1,90 s naar aparte outputmap |
| Routes | FAIL | Gesplitste NL-routearchitectuur; HTML-redirects zijn geen bewezen server-301’s |
| Conversie | FAIL | `/nl/afspraak/` heeft 0 iframes; `/nl/bestel-direct/` heeft geen bestelcomponent |
| SEO | FAIL | 234 locale-routes zijn dun/generiek; 18 groepen duplicate descriptions; 75 artikelen ontbreken |
| Privacy/security | FAIL | Persoonlijk voorstel publiek; privacyverklaring incompleet; rate limit/idempotency ontbreken |
| Responsive/a11y | CONDITIONAL FAIL | Geen documentoverflow in 320–430 px scan, maar 200%-zoom/visuele browsercontrole is niet schoon afgesloten |
| Performance | CONDITIONAL | Lean JS/CSS, maar geen reproduceerbare Lighthouse-run; Google Fonts en zware teamfoto’s blijven |

## P0 launch blockers

1. **WEB-QA-001 — Verwijder het persoonlijke Hasan-voorstel uit de publieke build.**
2. **WEB-QA-002 — Herstel één canonieke Nederlandse routearchitectuur.**
3. **WEB-QA-003 — Herstel de afspraakflow vanuit de actuele navigatie.**
4. **WEB-QA-004 — Herstel de directe bestelflow vanuit de actuele navigatie.**
5. **WEB-QA-005 — Kies en configureer de productiehost voor de leadfunctie.**
6. **WEB-QA-006 — Verifieer GHL-leadverwerking end-to-end in een veilige testpipeline.**
7. **WEB-QA-007 — Maak privacyinformatie en third-party disclosure launchwaardig.**

## Belangrijkste P1-risico’s

- Locale-content is op 234 routes dun en grotendeels template-identiek; 75 artikelvertalingen ontbreken en 195 generieke pagina’s wachten op native review.
- `public/_redirects` bevat een zelfredirect voor het AI Act-artikel; oude dienstenroutes worden statisch als clientredirect gebouwd.
- De leadendpoint heeft geen rate limiting, request-id/idempotency of expliciete originpolicy.
- Er is geen actieve analyticsprovider of consentplatform; events worden alleen lokaal gedispatcht.
- Afspraak geboekt en succesvolle Stripe-betaling worden niet door eigen tracking bevestigd.
- De GHL-iframe heeft een vaste minimale hoogte en `scrolling="no"`; dynamische kalenderhoogte is niet afgevangen.
- Google Fonts wordt vóór toestemming aangeroepen en is niet in de privacytekst genoemd.
- Twee crewfoto’s zijn circa 0,9 MB elk; dimensions ontbreken op teamafbeeldingen.
- Er is geen aantoonbare CI, deploy preview, monitoring, rollbackprocedure of productie-smoketest.

## Technische sterktes

- Astro static output; build en TypeScript slagen.
- Centrale datasets voor producten, niches, pricing, commerce en i18n.
- Veilige JSON-serialisatie met `replaceAll("<", "\\u003c")` op dynamische payloads.
- De campagne-endpoint begrenst invoer, valideert e-mail/consent, normaliseert tekst en gebruikt timeouts.
- Formuliervelden hebben labels, autocomplete en live statusfeedback.
- Skiplink, focusstijlen, reduced-motionregels, toetsenbordbesturing voor tabs/radiogroepen en Escape-afhandeling voor het mobiele menu zijn aanwezig.
- Alle 308 HTML-bestanden hebben geen ontbrekende afbeeldings-alt-attributen; alle drie iframes hebben een title.
- 287 routes zijn indexeerbaar en 21 noindex; de sitemapindex verwijst naar zes locale-sitemaps.

## Architectuurbevinding

Er bestaan twee Nederlandse websites naast elkaar:

- **Volwaardige routes:** `/producten/`, `/voor-wie/.../`, `/afspraak/`, `/bestel-direct/`, `/kennisbank/`.
- **Nieuwe locale-routes:** `/nl/producten/`, `/nl/voor-wie/.../`, `/nl/afspraak/`, `/nl/bestel-direct/`, `/nl/kennisbank/`.

De locale-routes gebruiken voor vrijwel alle detailpagina’s één generieke `LocalizedRoutePage.astro` met ongeveer 70–100 woorden hoofdcontent. De volwaardige nichepagina’s hebben gespecialiseerde demo’s, ROI, pricing, FAQ, proof en formulieren. Beide sets zijn indexeerbaar met self-canonical en staan in de Nederlandse sitemap. Dit veroorzaakt commerciële regressie, contentduplicatie en onduidelijke canonical ownership.

## Uitgevoerde tests

- `tsc --noEmit`: exit 0.
- Astro build naar normale `dist/`: exit 0, 307 pagina’s.
- Schone Astro build naar `/tmp/autopilots-audit-dist-20260716`: exit 0, 1,90 s.
- `check-built-site.mjs`: 307 HTML-pagina’s en 9.943 interne links gecontroleerd.
- `check-ai-knowledge.mjs`: 15 artikelen geslaagd.
- `i18n-validate.mjs`: basiscontrole geslaagd.
- `i18n-validate.mjs --strict`: exit 2; 75 ontbrekende artikelen en 195 native reviews.
- Custom route-audit: 308 HTML-bestanden, 287 indexeerbaar, 21 noindex, 0 routes met ontbrekende alt, 0 duplicate ID-routes, 0 ongeldige JSON-LD-routes.
- Serverfunctie dry-run: 405, 400, honeypot 200, validatie 422 en ontbrekende configuratie 503 correct.
- Viewportscan: geen documentbrede horizontale overflow op 430, 390, 360 en 320 px voor de geselecteerde hoofdroutes.

Er is geen betrouwbare Lighthouse-run uitgevoerd omdat Lighthouse niet in de repository aanwezig is en de lokale headless-Chrome-run niet reproduceerbaar afsloot. Performance- en accessibilityscores zijn daarom bewust begrensd.

## Rapporten

- [Website scorecard](WEBSITE_SCORECARD.md)
- [Paginascoren](PAGE_SCORECARD.md)
- [Route inventory](ROUTE_INVENTORY.md)
- [SEO-audit](SEO_AUDIT.md)
- [Performance-audit](PERFORMANCE_AUDIT.md)
- [Accessibility-audit](ACCESSIBILITY_AUDIT.md)
- [Customer journey-tests](CUSTOMER_JOURNEY_TESTS.md)
- [Launch checklist](LAUNCH_CHECKLIST.md)
- [Launch roadmap](LAUNCH_ROADMAP.md)
- [Developmenttickets](NEXT_DEVELOPMENT_TICKETS.md)
- [Machineleesbare resultaten](qa-results.json)
- [Ruwe routegegevens](route-audit.json)

## Noodcorrecties

Er zijn tijdens deze audit **geen websitecorrecties** uitgevoerd. Alleen audittooling, screenshots en rapporten zijn toegevoegd. De blockers vragen architectuur-, privacy- en integratiebesluiten; deze horen als gecontroleerde P0-implementatie te worden uitgevoerd, niet stil tijdens de audit.

## Visuele auditreferenties

- Nederlandse homepage: [desktop](screenshots/desktop/homepage-nl-1440.png) · [mobiel](screenshots/mobile/homepage-nl-390.png)
- Rijke afspraakroute: [desktop](screenshots/desktop/afspraak-legacy-1440.png) · [mobiel](screenshots/mobile/afspraak-legacy-390.png)
- Locale afspraakroute: [desktop](screenshots/desktop/afspraak-locale-1440.png) · [mobiel](screenshots/mobile/afspraak-locale-390.png)
- Rijke bestelroute: [desktop](screenshots/desktop/bestel-direct-legacy-1440.png) · [mobiel](screenshots/mobile/bestel-direct-legacy-390.png)
- Locale bestelroute: [desktop](screenshots/desktop/bestel-direct-locale-1440.png) · [mobiel](screenshots/mobile/bestel-direct-locale-390.png)
- Autobedrijven-landingspagina: [desktop](screenshots/desktop/lp-autobedrijven-1440.png) · [mobiel](screenshots/mobile/lp-autobedrijven-390.png)
