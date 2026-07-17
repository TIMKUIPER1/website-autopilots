# Customer journey-tests

> **Post-repair:** homepage → afspraak, homepage → bestelling/productcontext, zeven kernroutes, desktop en mobiel zijn in Chromium doorlopen. Formulier/GHL en Stripe zijn veilig geïmplementeerd maar blijven `CONFIGURED_NOT_TESTED` tot externe stagingcredentials beschikbaar zijn.

Statuswaarden: PASS, PARTIAL, FAIL, NOT TESTED.

## Journey A — Homepage naar afspraak

**Resultaat: FAIL op actuele NL-route.**

1. `/nl/` maakt productrollen en CTA’s duidelijk.
2. Header/productlinks openen `/nl/producten/...`.
3. Branchekeuze opent `/nl/voor-wie/...`.
4. “Plan afspraak” opent `/nl/afspraak/`.
5. Die pagina heeft 0 iframes en geen kalender/formulier.

De legacyroute `/afspraak/` heeft wel een GHL-iframe en fallbacklink, maar de nieuwe navigatie stuurt daar niet heen. Externe boekingsbevestiging: CONFIGURED_NOT_TESTED.

## Journey B — Homepage naar direct bestellen

**Resultaat: FAIL op actuele NL-route; PARTIAL op legacyroute.**

- `/nl/bestel-direct/` is een generieke informatiepagina zonder productradiogroep, branchezoeker of voorstelroute.
- `/bestel-direct/` bevat vijf productkeuzes en 21 branches.
- Productkeuze wordt via queryparameter/sessionStorage bewaard.
- Alleen autobedrijven met drie producten hebben een bevestigde directe proposal/Stripe-route.
- Stripe IDs en live publishable key zijn aanwezig; er is geen veilige aankoop uitgevoerd.

## Journey C — Advertentie naar autobedrijven

**Resultaat: PARTIAL.**

- De rijke route `/voor-wie/autobedrijven/` heeft branchespecifieke hero, demo, ROI, pricing, FAQ en CTA.
- UTM en gclid worden in BaseLayout naar afspraak/bestel/voorstel-links doorgegeven.
- fbclid en msclkid worden in de algemene BaseLayout niet meegenomen; de campagnelayout doet dit wel.
- Demo/ROI-code is aanwezig; live browserinteractie is niet volledig gereproduceerd.
- Plan/bestel eindigen in niet-live-geverifieerde GHL/Stripe.

## Journey D — Verborgen advertentiefunnel

**Resultaat: FAIL voor productie, PARTIAL lokaal.**

- Landing heeft naam, bedrijf, e-mail, consent en honeypot.
- Clientvalidatie, loading, error en localhost-fallback zijn aanwezig.
- Server dry-run geeft correct 405/400/422/503.
- Alle vier vereiste GHL-omgevingsvariabelen zijn in deze auditomgeving afwezig.
- Geen rate limiting of idempotency.
- CRM-upsert, tags, custom fields, opportunity/pipeline/stage en afspraakupdate zijn niet live geverifieerd.
- Vervolgpagina bevat drie ElevenLabs agent IDs, ROI en GHL-kalender.

Integratieclassificatie: **MISSING_CONFIGURATION**.

## Journey E — Google naar productpagina

**Resultaat: PARTIAL/PASS op legacyroute.**

`/producten/ai-inboxmedewerker/` is direct begrijpelijk en bevat nichekeuze, demo, ROI, pricing en gerelateerde routes. De locale-equivalenten zijn veel dunner en missen deze functies. De uiteindelijke route-eigenaar bepaalt dus of deze journey slaagt.

## Journey F — Blog naar conversie

**Resultaat: PASS statisch, PARTIAL voor analytics.**

- Kennisbank heeft zoek/filter.
- Artikel heeft inhoudsopgave, bronnen/context, product- en nichelinks en CTA.
- 15 artikelen slagen in de contentcontrole.
- Conversie-events worden gedispatcht, maar er is geen analyticsprovider die ontvangst bewijst.

## Journey G — Mobiel

**Resultaat: PARTIAL.**

- Documentoverflowscan geeft geen horizontale overflow op 430, 390, 360 en 320 px voor geselecteerde hoofd-, product-, niche-, order-, afspraak-, kennis- en funnelroutes.
- CSS bevat relevante breakpoints en touch targets.
- Volledige journey A/B blijft functioneel falen door dezelfde routeproblemen.
- Full-page screenshots zijn bewaard, maar actieve in-app browserzoom maakt ze niet geschikt als finale 200%-zoomacceptatie.
- Relevante visuele vergelijking: [rijke afspraakroute desktop](screenshots/desktop/afspraak-legacy-1440.png), [locale afspraakroute desktop](screenshots/desktop/afspraak-locale-1440.png), [rijke bestelroute mobiel](screenshots/mobile/bestel-direct-legacy-390.png) en [locale bestelroute mobiel](screenshots/mobile/bestel-direct-locale-390.png).

## Formulierinventaris

| Formulier | Route(s) | Clientvalidatie | Server | Privacy/consent | Classificatie |
|---|---|---|---|---|---|
| Campagnelead | LP | Ja | Netlify function | Ja | MISSING_CONFIGURATION |
| ROI calculator | 21 niches + voorstel | Ja, berekening | Geen leadopslag | n.v.t. | VERIFIED_WITH_STATIC_TEST |
| GHL kalender | afspraak/contact/ervaring | Extern | GHL | Privacytekst algemeen | CONFIGURED_NOT_TESTED |
| Direct order | voorstel | Stripe custom element | Stripe | Voorwaarden/privacy links | CONFIGURED_NOT_TESTED |
| Nieuwsbrief | Niet aanwezig | n.v.t. | n.v.t. | n.v.t. | Niet van toepassing |

## Serverfunctietest

| Case | Verwacht | Resultaat |
|---|---:|---:|
| GET | 405 | 405 |
| Ongeldige JSON | 400 | 400 |
| Honeypot gevuld | stille 200 | 200 |
| Ongeldig e-mailadres | 422 | 422 |
| Geldige payload zonder env | 503 | 503 |

## Analytics events

Aanwezig in code: product_viewed, niche_viewed, pricing_viewed, appointment_cta_clicked, direct_order_clicked, product_selected, niche_selected, demo_started, demo_completed, faq_opened, calculator_used, roi_calculator_used, funnel_page_viewed, lead_form_submitted/succeeded/failed, ElevenLabs demo opened en Stripe route opened.

Ontbreekt/niet bewezen: afspraak daadwerkelijk geboekt, betaling geslaagd/mislukt, formulier gestart, ROI gestart versus voltooid, echte providerontvangst, consent gating, deduplicatie en server-side conversie.
