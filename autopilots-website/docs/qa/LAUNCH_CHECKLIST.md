# Launch checklist

## Actuele gate (16 juli 2026)

- [x] Build, formatter, lint, typecheck, unit, integratie, route/link/redirect/i18n en E2E
- [x] Vertrouwelijk voorstel uit publieke build + regressieguard
- [x] Canonieke `/nl/` routes en directe legacyredirects
- [x] Afspraak-, fallback- en bestelflow technisch gereed
- [x] Consent, rate limiting, idempotency en signed webhooks
- [x] Netlifyarchitectuur, CI en rollbackdocumentatie
- [ ] Netlify production variables invullen en deploy preview controleren
- [ ] GHL testlocation/pipeline/calendar gecontroleerd end-to-end verifiëren
- [ ] Stripe webhook en drie offers in dashboard verifiëren
- [ ] Juridische checklist laten aftekenen
- [ ] Analyticsprovider kiezen of expliciet `none` handhaven

Launchbesluit: **READY AFTER EXTERNAL CONFIGURATION**.

Legenda: ✅ geslaagd · ❌ blokkeert · ⚠️ open/verificatie nodig.

## Gate 1 — Build

- ✅ Schone productiebuild naar aparte outputmap.
- ✅ TypeScript zonder fouten.
- ✅ 307 Astro-routes gebouwd.
- ✅ Clientbundles klein.
- ⚠️ Geen lint/format-script.
- ⚠️ Geen CI die build/checks afdwingt.
- ❌ Extra persoonlijk HTML-bestand wordt vanuit `public/` meegepubliceerd.

## Gate 2 — Routes

- ✅ 9.943 interne links door bestaande crawler gecontroleerd.
- ✅ 404-pagina aanwezig en noindex.
- ❌ Nederlandse prefixed en unprefixed routearchitectuur concurreren.
- ❌ Actuele NL-afspraak- en bestelroute missen hun kernfunctie.
- ❌ Zelfredirect in `public/_redirects`.
- ⚠️ `Astro.redirect` static output is geen bewezen server-301.
- ⚠️ Queryparameter/trailing-slash matrix op productiehost open.

## Gate 3 — Conversie

- ❌ Afspraakflow via header niet functioneel.
- ❌ Direct bestellen via header niet functioneel.
- ⚠️ GHL-kalender configured, niet live getest.
- ⚠️ Stripe IDs configured, geen gecontroleerde transactietest.
- ❌ Funnelbackend mist productieconfiguratie in deze omgeving.
- ❌ Hostingdoel en function runtime niet vastgelegd.
- ⚠️ Success/failed webhooks en server-side conversies ontbreken.

## Gate 4 — SEO

- ✅ Titles, canonicals, robots en H1-basis aanwezig.
- ✅ JSON-LD parsebaar.
- ✅ Sitemapindex en robots aanwezig.
- ❌ 234 locale-routes zijn generiek/dun.
- ❌ 18 duplicate-descriptiongroepen.
- ❌ Canonical ownership voor NL niet opgelost.
- ❌ 75 artikelvertalingen en 195 native reviews open.
- ⚠️ OG SVG delen op sociale platforms niet getest.

## Gate 5 — Privacy/security

- ❌ Persoonlijk voorstel publiek bereikbaar.
- ❌ Privacytekst mist verwerkingsverantwoordelijke, grondslagen, concrete retentie, transfers, ElevenLabs en Google Fonts.
- ❌ Geen rate limiting/idempotency op funnelendpoint.
- ⚠️ Geen CSP.
- ✅ HSTS, nosniff, referrer, permissions en frameheader gedefinieerd voor ondersteunde host.
- ⚠️ Headerwerking op definitieve host niet bewezen.
- ⚠️ Google Fonts-call zonder consent/self-hosting.

## Gate 6 — Responsive/accessibility

- ✅ Geen documentoverflow in 320–430 px route-scan.
- ✅ Focus, skiplink, reduced motion en keyboardcode aanwezig.
- ⚠️ 200%-zoom/reflow niet geaccepteerd.
- ⚠️ GHL/Stripe/ElevenLabs accessibility niet geverifieerd.
- ⚠️ Axe/NVDA/VoiceOvermatrix open.
- ⚠️ Kleine 8–10 px labels beoordelen.

## Gate 7 — Performance

- ✅ Astro output en client-JS zijn lean.
- ✅ ElevenLabs click-to-load.
- ❌ Geen Lighthouse/CWV-baseline.
- ⚠️ Google Fonts blocking import.
- ⚠️ Twee crewfoto’s circa 0,9 MB.
- ⚠️ Geen expliciete afbeeldingsdimensions.
- ⚠️ Third-party budget ontbreekt.

## Operations

- ❌ Definitieve hostingprovider niet vastgelegd.
- ❌ Geen productiecredentialschecklist.
- ❌ Geen monitoring/alerting.
- ❌ Geen rollback/runbook.
- ❌ Geen analyticsprovider/consentplatform.
- ⚠️ Domein-, DNS-, TLS-, redirects- en header-smoketest open.
- ⚠️ Search Console en sitemap submission open.

## Go/no-go

**NO-GO.** Ga pas naar een gecontroleerde public beta wanneer alle P0-tickets en de P1-route/SEO/privacy/integratietests zijn gesloten.
