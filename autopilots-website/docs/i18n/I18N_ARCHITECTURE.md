# I18n architecture

Eén Astro-codebase genereert alle locale-routes. `src/i18n/languages.ts` definieert de zes markten. `src/i18n/routes.ts` koppelt een stabiel content-ID aan zes natuurlijke URL's. `ui.ts` bevat globale UI-copy. Gedeelde pagina's krijgen `locale` en `contentId`; header, footer, CTA's, canonical en hreflang worden daaruit berekend.

`/` is de neutrale x-default taalkeuze. Locale-content begint altijd met `/nl/`, `/en/`, `/es/`, `/de/`, `/it/` of `/fr/`. Geen Nederlandse fallback is toegestaan op niet-Nederlandse routes. Ontbrekende content krijgt status `missing` en mag pas na vertaling en review worden gepubliceerd.

Statussen: `source`, `review-required`, `approved`, `stale`, `missing`. `sourceHash` identificeert de Nederlandse bronversie; `translatedFromHash` maakt zichtbaar tegen welke bron een vertaling is gemaakt. Een afwijkende hash moet de status naar `stale` zetten.
