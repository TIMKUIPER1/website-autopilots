# Autopilots gedeelde secties

Deze map bevat herbruikbare blokken voor niche-landingspagina's.

## Bestanden

- `systemen-en-samenwerkingen.html` - automatische slider met systemen, kanalen en samenwerkingen.
- `meet-the-crew.html` - horizontale team-slider met ronde teamfoto's.
- `niche-megamenu-ghl-embed.html` - interactieve GHL-proof megamenu met directe links naar alle nichepagina's.
- `diensten-megamenu-ghl-embed.html` - interactieve GHL-proof megamenu-inhoud voor de dienstenpagina.
- `autopilots-shared-sections.css` - styling voor beide blokken.
- `autopilots-shared-sections.js` - klikbare pijlen voor de team-slider.
- `assets/` - gedeelde logo's en teamfoto's.

## Toevoegen aan een landingspagina

Plaats deze regel in de `<head>`:

```html
<link rel="stylesheet" href="shared-sections/autopilots-shared-sections.css">
```

Plak daarna de inhoud van het gewenste HTML-bestand op de plek waar het blok moet komen.

Plaats deze regel onderaan voor de team-slider:

```html
<script src="shared-sections/autopilots-shared-sections.js"></script>
```

## Let op

Als een landingspagina in een submap staat, pas dan de paden aan. Voorbeeld:

```html
<link rel="stylesheet" href="../shared-sections/autopilots-shared-sections.css">
<script src="../shared-sections/autopilots-shared-sections.js"></script>
```

En wijzig in de snippets `shared-sections/assets/...` naar `../shared-sections/assets/...`.
