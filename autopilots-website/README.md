# Autopilots Website

Code-first website voor Autopilots. Deze map is de enige bron van waarheid voor
`auto-pilots.io`. De productiearchitectuur is eenduidig: Astro static output op
Netlify, met Netlify Functions en Netlify Blobs voor formulieren, webhooks, rate
limiting en idempotency. Railway en GitHub Pages zijn geen impliciete dependency
van deze website.

Doel:

- Alle bestaande pagina's behouden
- Niches SEO-prioriteit geven
- Forms en calendars actief houden via GoHighLevel
- Internationale SEO mogelijk maken
- Website volledig beheerbaar maken via code en Codex

## Stack

- Astro voor de publieke website
- Netlify voor hosting, redirects en functions
- Netlify Blobs voor duurzame requeststatus en deduplicatie
- GoHighLevel voor kalender, CRM en opvolging
- Stripe voor bevestigde checkoutconfiguraties

## Lokaal controleren

```bash
pnpm install --frozen-lockfile
pnpm run format:check
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run test:qa
pnpm run test:e2e
```

Productievariabelen staan zonder waarden in `.env.example`. Zie `docs/deployment/` voor deploy en rollback.

## Veilig wijzigen en publiceren

- Werk nooit rechtstreeks op `main`.
- Laat Codex voor iedere wijziging een aparte branch gebruiken.
- Publiceer alleen via een pull request met de verplichte `Website release gate`.
- Gebruik `release:production` niet voor normale releases. Dit is uitsluitend een
  expliciet goedgekeurde break-glassprocedure.
- De releasecontrole blokkeert verouderde branchbasissen, kritieke verwijderingen,
  ontbrekende routes en builds zonder verifieerbare commit-SHA.

## Eerste routes

- `/` - homepage prototype
- `/voor-wie/autobedrijven/` - eerste SEO-nichepagina
- `/contact/` - contact en booking
- `/privacy/` - placeholder voor privacyinhoud

## Belangrijke componenten

- `src/layouts/BaseLayout.astro` - SEO head, header, footer en pagina shell
- `src/components/layout/Header.astro` - hoofdnav
- `src/components/layout/Footer.astro` - footer
- `src/components/sections/Hero.astro` - herbruikbare hero
- `src/components/embeds/GhlEmbed.astro` - veilige wrapper voor GoHighLevel calendars/forms
- `src/styles/global.css` - Autopilots design tokens en globale UI-stijl

## GHL koppeling

Calendars/forms blijven actief via iframe embeds.

Huidige calendar:

```txt
https://api.leadconnectorhq.com/widget/booking/UaWTV0sdETiXy0refclQ
```

Gebruik in Astro:

```astro
<GhlEmbed
  src="https://api.leadconnectorhq.com/widget/booking/UaWTV0sdETiXy0refclQ"
  title="Plan een afspraak met Autopilots"
  id="autopilots-contact-calendar"
/>
```

### Besloten advertentiefunnel autobedrijven

De routes `/lp/autobedrijven/ai-medewerker/` en `/lp/autobedrijven/ai-medewerker/ervaring/` staan los van de publieke navigatie en sitemap. De leadfunctie staat in `netlify/functions/funnel-lead.mjs` en gebruikt één van deze serverconfiguraties:

```txt
GHL_AUTOBEDRIJVEN_FUNNEL_WEBHOOK_URL
```

Of rechtstreeks via een HighLevel Private Integration:

```txt
GHL_PRIVATE_INTEGRATION_TOKEN
GHL_LOCATION_ID
GHL_FUNNEL_CONTEXT_FIELD_KEY       # optioneel
```

Zet deze waarden uitsluitend als beveiligde omgevingsvariabelen op de hosting en nooit in browsercode. De route `/api/funnel-lead` wordt door de serverfunctie afgehandeld.

## SEO volgorde

Eerst bouwen:

1. Homepage finaliseren
2. Niche template finaliseren
3. AI voor autobedrijven uitbreiden
4. Engelse variant maken: `/en/industries/car-dealerships/`
5. Alle bestaande nichepagina's migreren
6. Servicepagina's migreren
7. Voorstellen en privacy routes migreren
8. Sitemap, redirects en hreflang afmaken

## Development

Installeer dependencies:

```bash
npm install
```

Start lokaal:

```bash
npm run dev
```

Build:

```bash
npm run build
```
