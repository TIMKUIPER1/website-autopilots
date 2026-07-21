# Performance-audit

> **Post-repair:** LHCI is reproduceerbaar toegevoegd en draaide 3 keer op drie kernroutes. Homepage: **99 performance**, producten: **84–98**, afspraak: **72–97** door de externe GHL-iframe. Accessibility en SEO: **100** in de definitieve run. De baseline hieronder is historisch.

## Meetstatus

Een reproduceerbare Lighthouse-run is **niet beschikbaar**. Lighthouse staat niet in de repository en de lokale headless-Chrome-screenshotrun sloot in deze omgeving niet betrouwbaar af. Daarom zijn geen verzonnen Lighthouse-, LCP-, CLS-, INP- of TBT-scores opgenomen.

De audit gebruikt wel een schone productiebuild, bestandsgroottes, HTML/assetinspectie en browserroute-metrics.

## Productiebuild

| Meting | Resultaat |
|---|---:|
| Schone buildtijd | 1,90 s |
| HTML-routes plus publiek HTML | 308 |
| Totale schone output | 15 MB |
| Totale `_astro` JS/CSS | circa 212 KB ongecomprimeerd op schijf |
| Grootste client-JS | 1,45 KB; overige chunks 1,11 en 0,69 KB |
| Grootste CSS-bestand | circa 36 KB |

## Sterke punten

- Nauwelijks client-side JavaScript en geen groot frameworkruntime.
- De meeste interacties zijn kleine vanilla scripts.
- ElevenLabs wordt pas na gebruikersklik geladen.
- GHL wordt alleen op afspraak/contact/funnelervaring geladen.
- Teamafbeeldingen gebruiken `loading="lazy"`.
- Geen video in de initiële payload.
- Reduced motion is aanwezig.

## Problemen

### P1 — Geen CWV-baseline of performancebudget

Zonder Lighthouse/WebPageTest of RUM kan regressie niet worden geblokkeerd. Voeg een vaste mobiele en desktoprun toe voor minimaal tien kernroutes.

### P1 — Remote Google Fonts op iedere publieke pagina

`global.css` gebruikt een blocking `@import` naar Google Fonts. Dit voegt DNS/TLS/fontrequests toe, kan tekstweergave vertragen en heeft privacyimpact.

**Fix:** self-host Public Sans en Syne als WOFF2, preload alleen kritieke subsets en gebruik `font-display: swap`.

### P1 — Zware crewafbeeldingen

- `tim-kuiper.png`: circa 904 KB.
- `hasan-shabbir.png`: circa 888 KB.
- `albert-verlinden.png`: circa 308 KB.

**Fix:** converteer naar AVIF/WebP, lever responsive `srcset`, zet expliciete width/height en houd een kaartbeeld onder circa 120 KB.

### P1 — GHL-iframe eager op afspraak

De afspraakpagina laadt de GHL-iframe eager. Voor deze conversiepagina is dat functioneel verdedigbaar, maar het kan de main thread, netwerk en privacy belasten voordat de gebruiker interacteert.

**Fix:** meet eerst. Gebruik eventueel click-to-load of laad na de hero, met duidelijke fallback.

### P2 — Stripe-script op volledige voorstelpagina

Stripe wordt async geladen voor alle drie buy-buttons. Verifieer script- en iframekosten en overweeg pas te initialiseren wanneer de voorstelkaarten naderen.

### P2 — Grote statische HTML-documenten

Productdetails zijn circa 112 KB en bestellandingspagina circa 116 KB ongecomprimeerd. Dit is niet extreem, maar herhaalde inline CSS/scripts en uitgebreide DOM kunnen op lagere mobiele apparaten meetellen.

### P2 — Geen afmetingen op contentafbeeldingen

Crewafbeeldingen hebben alt en lazy loading, maar geen expliciete `width` en `height`. Dit kan CLS veroorzaken.

## Vereiste meetmatrix vóór livegang

| Route | Mobiel | Desktop | Third-party variant |
|---|---|---|---|
| `/nl/` of definitieve NL-home | Ja | Ja | fonts lokaal |
| Productoverzicht | Ja | Ja | n.v.t. |
| Productdetail | Ja | Ja | calculators |
| Autobedrijven | Ja | Ja | demo/ROI |
| Tweede niche | Ja | Ja | demo/ROI |
| Bestel direct | Ja | Ja | proposal/Stripe |
| Kennisbank | Ja | Ja | filter |
| Artikel | Ja | Ja | schema |
| Campagnelanding | Ja | Ja | form API |
| Funnelervaring | Ja | Ja | ElevenLabs + GHL |

Registreer Performance, Accessibility, Best Practices, SEO, FCP, LCP, CLS, Speed Index, TBT, totale transfer, JS, CSS, images, fonts en third parties. Stel daarna routebudgetten vast.
