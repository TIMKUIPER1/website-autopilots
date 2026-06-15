# CRM systeem voorstel

Voorstelpagina voor het inrichten van Autopilots CRM.

## Bestanden

- `autopilots-crm-systeem-voorstel-bron.html`
- `autopilots-crm-systeem-voorstel-ghl-embed.html`

## GHL iframe

```html
<iframe
  src="https://timkuiper1.github.io/website-autopilots/voorstellen/crm-systeem/autopilots-crm-systeem-voorstel-ghl-embed.html"
  style="width:100%;border:0;min-height:2200px;display:block;"
  loading="lazy">
</iframe>
```

## Slim aanpassen via Codex

Vraag Codex om wijzigingen altijd eerst in `autopilots-crm-systeem-voorstel-bron.html` te doen en daarna exact te syncen naar `autopilots-crm-systeem-voorstel-ghl-embed.html`.

Veelvoorkomende aanpassingen:

- Prijzen: zoek op `ap-price`.
- Pakketten: zoek op `CRM Start`, `CRM Scale` of `CRM Premium`.
- Funnelknoppen en flows: zoek op `data-crm-flow`.
- FAQ: zoek op `ap-faq-grid`.
- Supportregels: zoek op `support inbegrepen`.

Na elke wijziging moet Codex controleren dat bron en embed gelijk zijn.
