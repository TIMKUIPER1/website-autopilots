# Productiearchitectuur

Status: vastgesteld op 16 juli 2026.

- Frontend: Astro `output: static`, gepubliceerd vanuit `dist` op Netlify.
- Serverfuncties: Netlify Functions in `netlify/functions`.
- Duurzame requeststatus: Netlify Blobs (`autopilots-lead-guard` en `autopilots-conversions`).
- CRM en kalender: GoHighLevel/LeadConnector, server-side met secrets behalve de publieke kalender-URL.
- Betaling: Stripe Buy Button op de geverifieerde autobedrijven-configuraties; server-side bevestiging via `/api/webhooks/stripe`.
- Redirects: Netlify leest `public/_redirects`; securityheaders staan in `netlify.toml` en `public/_headers`.
- Preview: Netlify Deploy Preview met aparte testsecrets en `GHL_TEST_MODE=true`.
- Productie: Netlify production context; `scripts/validate-env.mjs` blokkeert deploy wanneer kritieke configuratie ontbreekt.
- Bron van waarheid: uitsluitend `autopilots-website` op de beschermde GitHub
  `main`-branch.
- Releasegate: `.github/workflows/website-quality.yml` moet slagen voordat een
  pull request naar `main` mag worden gemerged.
- Release-identiteit: `/.well-known/autopilots-release.json` rapporteert de
  commit en deploy-identiteit van het live artifact.
- GitHub Pages: uitsluitend legacy embeds en nooit een automatisch
  productiepad voor `auto-pilots.io`.

Railway, Supabase en andere runtimes zijn geen dependency van deze website. Wanneer een klantimplementatie die gebruikt, valt dat buiten deze webdeploy en wordt die dataflow apart vastgelegd.
