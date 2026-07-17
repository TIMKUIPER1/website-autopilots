# Launch roadmap

> **Actueel:** codeherstel is afgerond. Resterende volgorde: (1) Netlify project/secrets, (2) GHL staging-E2E zonder klantcommunicatie, (3) Stripe webhook/testevent, (4) legal review, (5) production deploy + smoke, (6) andere talen pas na native review.

## Fase 1 — Launch blockers

Volgorde: WEB-QA-001 → 002 → 003/004 → 005 → 006 → 007.

| Ticket | Probleem | Route/bestand | Oplossing | Acceptatie | Test | Afhankelijkheid | Complexiteit | Expertise |
|---|---|---|---|---|---|---|---|---|
| 001 | Persoonlijk voorstel publiek | `public/voorstel-hasan-embed.html` | Uit publieke assets verwijderen; zo nodig achter authenticated document delivery plaatsen | Publieke URL 404/410; geen persoonsgegevens/commercials in build | Schone build + secret/content scan | Eigenaar bevestigt archiefdoel | XS | Dev/privacy |
| 002 | Dubbele NL-architectuur | routes/i18n/layout | Eén canonical owner per content-ID en echte redirects | Eén 200-route; alternatieven 301; sitemap/canonical/hreflang gelijk | Crawl + headercheck | SEO/URL-besluit | L | Lead dev/SEO |
| 003 | Afspraakroute leeg | `/nl/afspraak/`, GHL | Volwaardige bookingcomponent op canonical route | Kalender/fallback zichtbaar en boeking bevestigbaar | Testkalender E2E desktop/mobile | 002, GHL testkalender | M | Frontend/integratie |
| 004 | Bestelroute leeg | `/nl/bestel-direct/` | Volwaardige ordercomponent en proposalrouting | Product → niche → proposal → test checkout werkt | E2E met testmode | 002, Stripe testmode | L | Frontend/commerce |
| 005 | Function host onduidelijk | README/deployconfig/function | Kies Netlify of porteer functie; leg build/publish/functionroute vast | `/api/funnel-lead` POST bereikbaar in preview/prod | Deployment smoke | Hostingbesluit | M | DevOps/backend |
| 006 | CRM-lead niet bewezen | funnel function/GHL | Testpipeline, credentials, tags/custom fields/upsert en failure alert | Eén herkenbare testlead exact eenmaal verwerkt | Controlled E2E | 005, GHL toegang | M | CRM/backend |
| 007 | Privacy incompleet | privacy/layout/vendors | Juridisch gecontroleerde privacytekst; self-host fonts/consentbesluit | Alle actieve verwerkers, grondslagen, transfers en rechten beschreven | Legal checklist + network scan | Juridische input | M | Privacy/legal/dev |

Definition of done: alle P0’s gesloten, schone previewdeployment, geen publiek vertrouwelijk bestand, afspraak en bestelling slagen met testdata, CRM ontvangt exact één lead en privacy-eigenaar tekent af.

## Fase 2 — Pre-launch hardening

1. WEB-QA-008 serverredirects en redirectloop.
2. WEB-QA-009 incomplete locales noindex/sitemapbeleid.
3. WEB-QA-010 unieke locale-content/native review.
4. WEB-QA-011 rate limiting en idempotency.
5. WEB-QA-012 analyticsprovider/consent/eventcontract.
6. WEB-QA-013 booking/payment server-side events.
7. WEB-QA-014 WCAG-browsermatrix.
8. WEB-QA-015 Lighthouse/CWV-budget.
9. WEB-QA-016 CI/deploy smoke/rollback.

Afhankelijkheden: routebesluit vóór SEO; hosting vóór endpoint/monitoring; consentbesluit vóór analytics.  
Complexiteit: S–XL.  
Expertise: frontend, backend, CRM, SEO, accessibility, DevOps.

Definition of done: geen P1 open; strikte i18ncheck past bij het publicatiebeleid; Lighthouse/axe/E2E draaien in CI; headers en redirects zijn op preview én productie bewezen.

## Fase 3 — Premium polish

1. WEB-QA-017 self-host fonts.
2. WEB-QA-018 optimaliseer crewassets.
3. WEB-QA-019 GHL dynamic height/click-to-load/fallback.
4. WEB-QA-020 verbeter form error semantics.
5. WEB-QA-021 complete analytics funnel.
6. WEB-QA-022 schema/OG social QA.
7. WEB-QA-023 copy/terminologie/native polish.

Complexiteit: XS–M.  
Definition of done: geen belangrijke visuele, performance-, copy- of interaction debt op de kernroutes.

## Fase 4 — Post-launch growth

1. WEB-QA-024 RUM, conversion dashboards en experimentframework.
2. Extra native artikelen en nichefunnels pas publiceren na contentreview.
3. A/B-tests voor CTA, proof, pricing en formfrictie.
4. Internationale Search Console-segmentatie.

Complexiteit: M–XL.  
Definition of done: meetplan heeft eigenaar, experimenten hebben hypothese/guardrails en geen nieuwe locale gaat live zonder dezelfde gates.
