# Autopilots Website

Nieuwe code-first website voor Autopilots.

Doel:

- Alle bestaande pagina's behouden
- Niches SEO-prioriteit geven
- Forms en calendars actief houden via GoHighLevel
- Internationale SEO mogelijk maken
- Website volledig beheerbaar maken via code en Codex

## Stack

- Astro voor de publieke website
- GoHighLevel voor forms, calendars, CRM en opvolging
- Railway voor backend, webhooks en API's
- Cloudflare Pages of Vercel voor hosting

## Eerste routes

- `/` - homepage prototype
- `/branches/autobedrijven/` - eerste SEO-nichepagina
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
