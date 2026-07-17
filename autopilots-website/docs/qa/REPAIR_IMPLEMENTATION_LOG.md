# Repair implementation log

| Ticket | Root cause | Oplossing en kernbestanden | Test | Status / afhankelijkheid |
|---|---|---|---|---|
| WEB-QA-001 | persoonlijk voorstel stond in `public` | verwijderd; `check-public-safety.mjs` + CI | `check:public` pass | opgelost; historische gitcommit blijft intern |
| WEB-QA-002 | dubbele NL-route-eigenaren | rijke pagina’s via `LocalizedDutchRoute`; legacy noindex + 301 | 322 routes/12.636 links | opgelost |
| WEB-QA-003 | locale-afspraak was generiek | GHL embedstates, context en duurzaam fallbackformulier | E2E desktop/mobile | UI opgelost; live kalenderbooking extern |
| WEB-QA-004 | locale-bestelling incompleet | vijf stappen, 21 niches, vijf producten, drie bevestigde checkouts | E2E en linkcrawl | checkout-ID live extern verifiëren |
| WEB-QA-005 | Railway/Cloudflare/Netlify door elkaar | Netlify static + Functions + Blobs, `netlify.toml`, runbooks | lokale build + env failure gate | Netlify projectkoppeling extern |
| WEB-QA-006 | GHL alleen simpele upsert | validatie, duurzame opslag, contact-upsert, open opportunity search/update/create, context/tags | unit + code/mocks | `CONFIGURED_NOT_TESTED` zonder secrets |
| WEB-QA-007 | leveranciers/dataflow onvolledig | consent, privacyupdate, register en legal checklist | link + E2E | menselijke legal review vereist |
| WEB-QA-008 | redirects konden chains/loops bevatten | directe geforceerde 301’s + checker | 48 regels pass | opgelost |
| WEB-QA-009/010 | generieke vertalingen indexeerbaar | niet-NL noindex, lege sitemaps, geen hreflang | strict i18n pass | native review vereist voor indexatie |
| WEB-QA-011 | geen misbruik-/duplicatebescherming | Blob rate limit, idempotency, requestfingerprint | unit security pass | live storage via Netlify |
| WEB-QA-012 | events zonder consentarchitectuur | providerneutrale consentlaag en PII-vrije eventbridge | axe/E2E | provider niet gekozen |
| WEB-QA-013 | click werd conversie | signed booking- en Stripe-webhooks met eventdedupe | HMAC unit test | webhooksecrets/dashboards extern |
| WEB-QA-014 | geen reproduceerbare WCAG-run | axe Playwright + acceptatiematrix | 2 projecten pass | menselijke SR-review resteert |
| WEB-QA-015 | geen CWV-bewijs | LHCI config, 3 URL’s × 3 runs | homepage 99; product 84–98; afspraak 72–97; SEO/a11y 100 | GHL beïnvloedt afspraakperformance |
| WEB-QA-016 | geen CI/rollback | GitHub workflow, lockfile, previewtests, rollbackrunbook | lokale equivalent pass | remote Actions na push |
