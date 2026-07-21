# Final simplification QA

## Bewijs

- Voorbeelden vóór: `docs/ux/screenshots/before/`.
- Volledige desktop- en mobiele screenshots na: `docs/ux/screenshots/after/`.
- De after-set bevat homepage, producten, voor-wie, branche, productdetail, proces, crew, kennisbank, artikel, afspraak en bestellen.

## Technische controles

| Controle | Uitkomst |
| --- | --- |
| Astro productiebuild | Geslaagd; 322 pagina's |
| TypeScript `--noEmit` | Geslaagd |
| Unit/integratietests | Geslaagd na affordancecontract |
| Playwright browser-QA | 20/20 geslaagd |
| Kernroute-overflow | Desktop en mobiel geslaagd |
| Alle 21 branchepagina's mobiel | Geslaagd zonder horizontale overflow |
| WCAG axe kernpagina | Geslaagd, geen overtredingen |
| Desktop screenshots 1440px | Vastgelegd |
| Mobiele screenshots 390px | Vastgelegd |
| Links/buttons contract | Toegevoegd |
| Gebouwde-sitecontrole | 322 HTML-pagina's en 12.542 interne links geslaagd |
| Redirectcontrole | 48 redirects geslaagd |
| Public safety | Geslaagd |
| Strikte i18n-publicatiecontrole | Geslaagd |

## Visuele controle

- Geen afgebroken branche- of producttitels waargenomen in de screenshotset.
- CTA-hiërarchie is consistent: één gevuld primair doel, rustige secundaire link.
- De vaste mobiele CTA-overlay is verwijderd en bedekt geen content meer.
- Product- en branchenavigatie gebruikt open lijsten; demo's en prijzen behouden cardvorm.
- Lange branchepagina's zijn nog inhoudelijk uitgebreid, maar de zichtbare herhaling is verminderd.

## Bekende beperking

De daadwerkelijke GHL-kalender, betaalprovider en externe analytics moeten in de productieomgeving met echte configuratie en netwerktoegang worden getest. De lokale fallback en embedcontainer zijn wel aanwezig.

## Score

- Clarity: 9/10
- Calm: 8.5/10
- CTA hierarchy: 9/10
- Information architecture: 9/10
- Mobile: 8.5/10
- Visual consistency: 9/10
- Customer journey: 9/10
