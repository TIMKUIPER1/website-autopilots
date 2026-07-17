# WCAG 2.2 AA acceptance matrix

| Onderdeel | Methode | Desktop | Mobiel | Uitkomst |
|---|---|---:|---:|---|
| Semantische landmarks/H1 | buildcrawl + axe | pass | pass | één H1 op alle 322 HTML-routes |
| Keyboard CTA/journey | Playwright Chromium | pass | pass | zichtbare CTA selecteerbaar |
| Focus en skiplink | code + browser | pass | pass | skip naar `#main-content` |
| Form labels, required, status | axe + inspectie | pass | pass | fallback heeft labels en live status |
| Contrast homepage | axe/Lighthouse | pass | pass | accessibility 100 |
| Productverkenner ARIA/contrast | Lighthouse, daarna herstel | pass | pass | `div[role=tabpanel]`, donkerder kicker |
| Horizontale overflow | 7 routes × 2 viewports | pass | pass | verschil ≤1 px |
| Reduced motion | CSS/codecontrole | pass | pass | bestaande voorkeur behouden |
| Iframe titel/fallback | inspectie/E2E | pass | pass | titel, error, retry en directe link |
| 200% zoom | layout/overflowmatrix | conditioneel | n.v.t. | geen structurele overflow; menselijke eindcheck aanbevolen |
| Screenreader | vereist menselijke review | open | open | blokkeert volledige WCAG-certificering, niet technische preview |

Geautomatiseerde tooling bewijst geen volledige wettelijke conformiteit. De matrix maakt die grens expliciet.
