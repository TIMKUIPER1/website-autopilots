# Adding and updating content

Geef ieder nieuw item eerst een stabiel content-ID. Voeg voor alle zes locales een natuurlijke slug toe aan `src/i18n/routes.ts`. Voeg Nederlandse broncopy toe, maak een hash, vertaal met de woordenlijst en laat iedere markt reviewen. Publiceer geen locale met lege velden of Nederlandse fallback.

Na een bronwijziging: markeer afgeleide vertalingen `stale`, hervertaal alleen gewijzigde velden, behoud handmatige locale-aanpassingen, review en draai build plus beide i18n-controles. Voeg de route pas aan sitemap/interne links toe wanneer de status `source` of `approved` is.
