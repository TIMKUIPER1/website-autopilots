# Next development tickets

> **Post-repair triage:** WEB-QA-001 t/m 016 zijn in code afgehandeld. Alleen extern werk resteert: Netlifyconfiguratie, GHL staging/live verificatie, Stripe dashboard/webhookcontrole, formele legal review, analyticsproviderbesluit en native locale-review. De oorspronkelijke tickets hieronder zijn het historische backlogspoor.

## WEB-QA-001 — Verwijder publiek persoonlijk samenwerkingsvoorstel

- **Prioriteit:** P0
- **Probleem:** Een persoonlijk voorstel met klantnamen, bedragen, commissie en strategische afspraken staat publiek in de build.
- **Bewijs:** `/voorstel-hasan-embed.html`; bron `public/voorstel-hasan-embed.html`.
- **Routes/bestanden:** genoemde route en bestand.
- **Gewenste oplossing:** verwijderen uit `public/`; zo nodig opslaan in een geauthenticeerde documentomgeving.
- **Buiten scope:** inhoudelijk heronderhandelen van het voorstel.
- **Acceptatiecriteria:** publieke URL 404/410; tekst/naam/bedragen ontbreken uit schone output.
- **Testmethode:** build, routecheck en tekstscan.
- **Risico:** privacy- en commerciële blootstelling.
- **Complexiteit:** XS
- **Afhankelijkheden:** eigenaar beslist waar het archief thuishoort.

## WEB-QA-002 — Kies één canonieke Nederlandse routearchitectuur

- **Prioriteit:** P0
- **Probleem:** Prefixed en unprefixed NL-routes concurreren en verschillen functioneel.
- **Bewijs:** `/producten/` versus `/nl/producten/`; self-canonicals; beide in NL-sitemap.
- **Routes/bestanden:** alle `/nl/*`, legacy NL-routes, `src/i18n/routes.ts`, layouts, sitemaps.
- **Gewenste oplossing:** één route-owner; andere URLs echte 301; canonical/hreflang/sitemap/nav gelijk.
- **Buiten scope:** nieuwe internationale content schrijven.
- **Acceptatiecriteria:** per content-ID exact één 200-route.
- **Testmethode:** volledige crawl, headerstatus, canonical/hreflangreciprociteit.
- **Risico:** SEO-verlies en gebroken conversie.
- **Complexiteit:** L
- **Afhankelijkheden:** expliciet URL/SEO-besluit.

## WEB-QA-003 — Herstel canonieke afspraakflow

- **Prioriteit:** P0
- **Probleem:** Actuele NL-header landt op een pagina zonder kalender.
- **Bewijs:** `/nl/afspraak/` heeft 0 iframe; `/afspraak/` heeft 1.
- **Routes/bestanden:** afspraakroutes, `LocalizedRoutePage.astro`, `GhlEmbed.astro`, Header/Footer.
- **Gewenste oplossing:** volwaardige bookingpagina op canonical NL-route.
- **Buiten scope:** GHL-agenda opnieuw ontwerpen.
- **Acceptatiecriteria:** kalender én fallback zichtbaar; querycontext behouden; testboeking bevestigd.
- **Testmethode:** desktop/mobile E2E in testkalender.
- **Risico:** alle afspraakconversies verloren.
- **Complexiteit:** M
- **Afhankelijkheden:** WEB-QA-002 en GHL-testkalender.

## WEB-QA-004 — Herstel canonieke directe bestelflow

- **Prioriteit:** P0
- **Probleem:** `/nl/bestel-direct/` heeft geen product- of branchekeuze.
- **Bewijs:** locale-route heeft 0 relevante controls; legacyroute bevat vijf productbuttons.
- **Routes/bestanden:** bestel-, niche- en voorstelroutes; commerce/pricing data.
- **Gewenste oplossing:** volledige orderervaring op canonical route.
- **Buiten scope:** nieuwe nicheprijzen verzinnen.
- **Acceptatiecriteria:** product → branche → highlight → proposal → testcheckout.
- **Testmethode:** E2E met alle drie autobedrijfproducten en een niet-directe niche.
- **Risico:** betaalde intentie loopt dood.
- **Complexiteit:** L
- **Afhankelijkheden:** WEB-QA-002 en Stripe testmode.

## WEB-QA-005 — Leg productiehosting en functionruntime vast

- **Prioriteit:** P0
- **Probleem:** README noemt Cloudflare/Vercel; backend is Netlify Function; deployconfig ontbreekt.
- **Bewijs:** `README.md`, `netlify/functions/funnel-lead.mjs`, geen `netlify.toml`.
- **Routes/bestanden:** deployconfig, README, `/api/funnel-lead`.
- **Gewenste oplossing:** kies host en maak adapter/build/publish/functionroute reproduceerbaar.
- **Buiten scope:** CRM-workflow inhoud.
- **Acceptatiecriteria:** preview en productie geven verwachte 405/422/503/200.
- **Testmethode:** deployment smoke met curl en testpayload.
- **Risico:** alle funnel-leads 404/verloren.
- **Complexiteit:** M
- **Afhankelijkheden:** hostingtoegang.

## WEB-QA-006 — Verifieer GHL lead-upsert end-to-end

- **Prioriteit:** P0
- **Probleem:** Productiecredentials ontbreken en CRM-resultaat is niet bewezen.
- **Bewijs:** vier envchecks false; function dry-run eindigt 503.
- **Routes/bestanden:** funnel LP, function, GHL testpipeline.
- **Gewenste oplossing:** veilige testpipeline met upsert, tags, custom field, attribution en alerts.
- **Buiten scope:** ongecontroleerde productiecontacten.
- **Acceptatiecriteria:** één testsubmit wordt exact één contact met juiste data.
- **Testmethode:** herkenbare testlead + CRM-inspectie + retrytest.
- **Risico:** leads verloren of dubbel.
- **Complexiteit:** M
- **Afhankelijkheden:** WEB-QA-005 en GHL-toegang.

## WEB-QA-007 — Maak privacyverklaring volledig

- **Prioriteit:** P0
- **Probleem:** Actieve verwerkers, grondslagen, transfers en concrete retentie ontbreken.
- **Bewijs:** privacy noemt alleen GHL/Stripe; Google Fonts en ElevenLabs ontbreken.
- **Routes/bestanden:** privacyroutes, layouts, vendorcomponents.
- **Gewenste oplossing:** juridische review; controlleridentiteit, doelen/grondslag, ontvangers, transfers, termijnen, rechten en consent.
- **Buiten scope:** juridisch advies door de developer.
- **Acceptatiecriteria:** privacy-eigenaar/legal tekent af en network inventory klopt met tekst.
- **Testmethode:** vendor/network checklist.
- **Risico:** AVG/compliance.
- **Complexiteit:** M
- **Afhankelijkheden:** bedrijfs- en leveranciersinformatie.

## WEB-QA-008 — Corrigeer serverredirects

- **Prioriteit:** P1
- **Probleem:** Zelfredirect en client-side Astro redirectdocumenten.
- **Bewijs:** `public/_redirects`; 15 redirect-HTML’s zonder H1.
- **Routes/bestanden:** `public/_redirects`, dienstenroutes, dierenartsenalias.
- **Gewenste oplossing:** echte 301-regels op gekozen host; verwijder loop/chains.
- **Buiten scope:** nieuwe content.
- **Acceptatiecriteria:** elke oude URL maximaal één 301 naar 200.
- **Testmethode:** curl redirectmatrix.
- **Risico:** loops, soft redirects, SEO-verlies.
- **Complexiteit:** S
- **Afhankelijkheden:** WEB-QA-002/hosting.

## WEB-QA-009 — Zet incomplete locales tijdelijk noindex

- **Prioriteit:** P1
- **Probleem:** Generieke, dunne locale-content is indexeerbaar.
- **Bewijs:** 195 native reviews en 75 artikelen open; main content vaak 70–100 woorden.
- **Routes/bestanden:** locale generator, sitemaps, i18n status.
- **Gewenste oplossing:** publicatiestatus stuurt robots/sitemap/hreflang.
- **Buiten scope:** vertalingen schrijven.
- **Acceptatiecriteria:** alleen approved locales indexeerbaar/in sitemap.
- **Testmethode:** strict validator + sitemap/robots scan.
- **Risico:** thin/duplicate content.
- **Complexiteit:** M
- **Afhankelijkheden:** SEO-publicatiebeleid.

## WEB-QA-010 — Publiceer unieke native locale-content

- **Prioriteit:** P1
- **Probleem:** Producten, niches en algemene pagina’s delen descriptions en templates.
- **Bewijs:** 18 duplicate-descriptiongroepen; 21 gelijke nichedescriptions per taal.
- **Routes/bestanden:** i18n contentdata/templates.
- **Gewenste oplossing:** native, unieke intentie/content/metadata per route.
- **Buiten scope:** machinevertaling zonder review.
- **Acceptatiecriteria:** strict validation volledig groen en contentowner per taal.
- **Testmethode:** duplicate scan + native review sign-off.
- **Risico:** reputatie en organische zichtbaarheid.
- **Complexiteit:** XL
- **Afhankelijkheden:** vertalers/content owners.

## WEB-QA-011 — Voeg rate limiting en idempotency toe

- **Prioriteit:** P1
- **Probleem:** Funnelendpoint kan gespamd en dubbel ingediend worden.
- **Bewijs:** alleen honeypot/content-length; geen request-id/rate store.
- **Routes/bestanden:** `netlify/functions/funnel-lead.mjs`.
- **Gewenste oplossing:** per-IP/email limiet, idempotency key, retry-safe upsert en logging zonder PII.
- **Buiten scope:** algemene WAF-herbouw.
- **Acceptatiecriteria:** duplicate submit levert één CRM-mutatie; burst wordt 429.
- **Testmethode:** mock concurrency/rate tests.
- **Risico:** spam, kosten en dubbele opvolging.
- **Complexiteit:** M
- **Afhankelijkheden:** host/storagekeuze.

## WEB-QA-012 — Implementeer analyticsprovider en consent

- **Prioriteit:** P1
- **Probleem:** Events worden gedispatcht maar nergens aantoonbaar ontvangen.
- **Bewijs:** geen GA/Plausible/PostHog script; dataLayer alleen conditioneel.
- **Routes/bestanden:** layouts, privacy, consentconfig.
- **Gewenste oplossing:** privacyvriendelijke provider, consentbeleid, eventcontract en debugview.
- **Buiten scope:** dashboards optimaliseren.
- **Acceptatiecriteria:** kern-events exact eenmaal zichtbaar zonder PII.
- **Testmethode:** provider debug + consent on/off.
- **Risico:** blind launchbesluit of non-compliant tracking.
- **Complexiteit:** M
- **Afhankelijkheden:** privacybesluit.

## WEB-QA-013 — Meet afspraak en betaling server-side

- **Prioriteit:** P1
- **Probleem:** Klikken worden gemeten; daadwerkelijke booking/payment niet.
- **Bewijs:** geen GHL/Stripe webhookadapter.
- **Routes/bestanden:** backend/webhooks/analytics.
- **Gewenste oplossing:** gevalideerde webhooks met deduplicatie en conversion events.
- **Buiten scope:** financiële administratie.
- **Acceptatiecriteria:** testboeking en testbetaling koppelen aan juiste funnelcontext.
- **Testmethode:** signed webhook fixtures.
- **Risico:** verkeerde ROAS/CRO-data.
- **Complexiteit:** L
- **Afhankelijkheden:** provider credentials.

## WEB-QA-014 — Rond WCAG 2.2 AA-browsermatrix af

- **Prioriteit:** P1
- **Probleem:** Geen axe/screenreader/200%-zoom bewijs.
- **Bewijs:** static audit positief, handmatige gate open.
- **Routes/bestanden:** header, forms, demos, calculators, embeds.
- **Gewenste oplossing:** axe + keyboard + VoiceOver/NVDA + zoommatrix; fixes verwerken.
- **Buiten scope:** formele externe certificering.
- **Acceptatiecriteria:** geen critical/serious axe; alle kernflows keyboard/screenreader.
- **Testmethode:** vast testprotocol.
- **Risico:** uitsluiting en juridische exposure.
- **Complexiteit:** L
- **Afhankelijkheden:** functionele routes.

## WEB-QA-015 — Voeg Lighthouse/CWV-budget toe

- **Prioriteit:** P1
- **Probleem:** Geen reproduceerbare performancebaseline.
- **Bewijs:** Lighthouse ontbreekt; CWV onbekend.
- **Routes/bestanden:** CI, performanceconfig.
- **Gewenste oplossing:** mobiele/desktop Lighthouse CI voor tien routes plus budget.
- **Buiten scope:** field data zonder verkeer.
- **Acceptatiecriteria:** afgesproken thresholds groen; rapporten als artifacts.
- **Testmethode:** cold-cache CI-runs.
- **Risico:** onzichtbare regressie.
- **Complexiteit:** M
- **Afhankelijkheden:** previewdeploy.

## WEB-QA-016 — CI, preview smoke en rollbackrunbook

- **Prioriteit:** P1
- **Probleem:** Geen aantoonbare pipeline, monitoring of rollback.
- **Bewijs:** geen workflow/deployconfig in repository.
- **Routes/bestanden:** CI/deploy/docs.
- **Gewenste oplossing:** build/typecheck/crawl/i18n/E2E gates, preview URL, healthcheck en rollback.
- **Buiten scope:** volledige SRE-organisatie.
- **Acceptatiecriteria:** mislukte gate blokkeert deploy; vorige release herstelbaar.
- **Testmethode:** gecontroleerde failed deploy/rollback.
- **Risico:** onbeheerste livegang.
- **Complexiteit:** L
- **Afhankelijkheden:** hostingbesluit.

## WEB-QA-017 — Self-host fonts

- **Prioriteit:** P2
- **Probleem:** Blocking Google Fonts-call op iedere pagina.
- **Bewijs:** `global.css` `@import`.
- **Routes/bestanden:** fonts en global/campaign CSS.
- **Gewenste oplossing:** lokale WOFF2-subsets, preload critical, swap.
- **Buiten scope:** nieuw typografisch merk.
- **Acceptatiecriteria:** geen Google Fonts netwerkrequest; visueel gelijk.
- **Testmethode:** network/Lighthouse/font fallback.
- **Risico:** performance/privacy.
- **Complexiteit:** S
- **Afhankelijkheden:** fontlicenties/assets.

## WEB-QA-018 — Optimaliseer crewbeelden

- **Prioriteit:** P2
- **Probleem:** Twee PNG’s circa 0,9 MB en dimensions ontbreken.
- **Bewijs:** public/team assetmeting.
- **Routes/bestanden:** crew data/page/assets.
- **Gewenste oplossing:** AVIF/WebP srcset + dimensions.
- **Buiten scope:** nieuwe fotoshoot.
- **Acceptatiecriteria:** elk kaartbeeld <120 KB bij relevante breedte; CLS nul door image.
- **Testmethode:** assetbudget + Lighthouse.
- **Risico:** langzame crewpage.
- **Complexiteit:** S
- **Afhankelijkheden:** bronbeelden.

## WEB-QA-019 — Maak GHL-embed robuust

- **Prioriteit:** P2
- **Probleem:** Vaste hoogte en scrolling=no kunnen content afsnijden.
- **Bewijs:** `GhlEmbed.astro`.
- **Routes/bestanden:** afspraak/contact/funnelervaring.
- **Gewenste oplossing:** ondersteunde resize, click-to-load of veilige scroll/fallback.
- **Buiten scope:** GHL-widgetcode.
- **Acceptatiecriteria:** kalender compleet op 320–1440 px en keyboard.
- **Testmethode:** devices + lange validatiestates.
- **Risico:** niet boekbare slots.
- **Complexiteit:** M
- **Afhankelijkheden:** GHL embed-API.

## WEB-QA-020 — Verbeter formulierfouten en submitstate

- **Prioriteit:** P2
- **Probleem:** Geen veldspecifieke serverfoutkoppeling.
- **Bewijs:** CampaignLeadForm heeft één globale status.
- **Routes/bestanden:** campaign form.
- **Gewenste oplossing:** error summary, `aria-invalid`, `aria-describedby`, focusbeheer.
- **Buiten scope:** form fields uitbreiden.
- **Acceptatiecriteria:** fout is tekstueel, aangekondigd en aan veld gekoppeld.
- **Testmethode:** keyboard/screenreader/serverfixtures.
- **Risico:** formulieruitval.
- **Complexiteit:** S
- **Afhankelijkheden:** geen.

## WEB-QA-021 — Completeer eventcontract

- **Prioriteit:** P2
- **Probleem:** Start/completion en deduplicatie zijn inconsistent.
- **Bewijs:** custom eventcode in layouts.
- **Routes/bestanden:** layouts/components/analytics docs.
- **Gewenste oplossing:** schema met naam, trigger, properties, PII-policy en once semantics.
- **Buiten scope:** attributiemodelanalyse.
- **Acceptatiecriteria:** alle gevraagde events exact eenmaal en gedocumenteerd.
- **Testmethode:** automated event listener E2E.
- **Risico:** onbetrouwbare funneldata.
- **Complexiteit:** M
- **Afhankelijkheden:** WEB-QA-012.

## WEB-QA-022 — Social preview en schema QA

- **Prioriteit:** P2
- **Probleem:** Default OG is SVG en commerce schema beperkt.
- **Bewijs:** BaseLayout default OG; proposal WebPage/global schema.
- **Routes/bestanden:** OG-assets, schema builders.
- **Gewenste oplossing:** 1200×630 rasterpreview en feitelijk Offer/Product-schema.
- **Buiten scope:** fictieve reviews.
- **Acceptatiecriteria:** previews op LinkedIn/WhatsApp/X; schema matcht zichtbare prijs.
- **Testmethode:** share debuggers/schema validator.
- **Risico:** lage CTR/misleidende markup.
- **Complexiteit:** S
- **Afhankelijkheden:** prijsverificatie.

## WEB-QA-023 — Centrale copy- en terminologiepolish

- **Prioriteit:** P2
- **Probleem:** Generieke locale-copy, kleine labels en enkele Engels/Nederlands-mixen.
- **Bewijs:** locale templates en crew “Meet the crew/Built by”.
- **Routes/bestanden:** ui/i18n/pagecopy.
- **Gewenste oplossing:** termlijst, native review, CTA- en capitalisationregels.
- **Buiten scope:** nieuwe positionering.
- **Acceptatiecriteria:** contentowner tekent alle kernroutes af.
- **Testmethode:** copy matrix per taal.
- **Risico:** onprofessionele indruk.
- **Complexiteit:** L
- **Afhankelijkheden:** locale policy.

## WEB-QA-024 — RUM en post-launch experimentframework

- **Prioriteit:** P3
- **Probleem:** Geen field-CWV of gecontroleerde experimenten.
- **Bewijs:** geen RUM/A-B tooling.
- **Routes/bestanden:** analytics/monitoring/experimentdocs.
- **Gewenste oplossing:** privacyvriendelijke RUM, dashboards, hypotheses en guardrails.
- **Buiten scope:** personalisatie-engine.
- **Acceptatiecriteria:** CWV en funnels per route/device; experimenten hebben owner en stopcriteria.
- **Testmethode:** synthetic event + dashboardvalidatie.
- **Risico:** optimaliseren op aannames.
- **Complexiteit:** M
- **Afhankelijkheden:** WEB-QA-012/015/016.
