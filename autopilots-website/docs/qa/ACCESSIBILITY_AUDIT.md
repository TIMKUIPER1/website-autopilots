# Accessibility-audit

> **Post-repair:** axe/Playwright draait in desktop- en mobiele Chromiumprojecten; overflowmatrix en kernjourneys slagen. Lighthouse accessibility 96–100; gevonden producttabpanel/contrast is hersteld. Zie `ACCESSIBILITY_ACCEPTANCE_MATRIX.md` voor menselijke restchecks.

Doel: WCAG 2.2 AA.  
Status: basis redelijk, **geen volledige conformiteitsclaim**.

## Geautomatiseerde/static checks

- 308 HTML-bestanden gescand.
- 0 routes met een afbeelding zonder `alt`.
- 0 routes met duplicate IDs.
- Alle drie iframes hebben een `title`.
- Formulierroutes hebben evenveel zichtbare controls als labels in de statische scan.
- Echte contentroutes hebben één H1; 15 H1-afwijkingen zijn redirectdocumenten zonder contentheading.

## Sterke basis

- Skiplink en `main` landmark.
- Zichtbare globale `:focus-visible`.
- Mobiele menuknop heeft `aria-expanded`, `aria-controls` en Escape-herstel.
- Tabs/radiogroepen ondersteunen pijltjestoetsen, Home en End.
- Accordions gebruiken native `details/summary`.
- Reduced-motionregels bestaan globaal en in de campagneomgeving.
- Formulierstatus gebruikt `aria-live="polite"`.
- Minimum touch targets zijn meestal 42–54 px.

## Bevindingen

### P1 — 200%-zoom en browserzoom niet geaccepteerd

De in-app screenshots zijn gemaakt met een actieve browserzoom en laten afgesneden/grote content zien. De documentoverflowscan bij 320–430 px is schoon, maar dat vervangt geen tekstzoomtest. Omdat `body { overflow-x:hidden }` echte overflow kan maskeren, moet 200% zoom expliciet worden getest zonder contentverlies.

Visuele referenties voor de hertest: [homepage desktop](screenshots/desktop/homepage-nl-1440.png), [homepage mobiel](screenshots/mobile/homepage-nl-390.png), [autobedrijven desktop](screenshots/desktop/autobedrijven-nl-1440.png) en [autobedrijven mobiel](screenshots/mobile/autobedrijven-nl-390.png).

**WCAG:** 1.4.10 Reflow.

### P1 — Externe GHL-widget niet toegankelijk geverifieerd

De iframe heeft een title, maar toetsenbordvolgorde, focusindicator, labels, foutmeldingen, contrast en mobiel scrollgedrag binnen de externe kalender zijn niet gecontroleerd.

**WCAG:** 2.1.1 Keyboard, 3.3.x Input Assistance, 4.1.2 Name/Role/Value.

### P1 — Foutmeldingen formuliervelden niet gekoppeld

Clientvalidatie gebruikt browservalidatie; serverfouten komen in één live status. Er zijn geen veldspecifieke `aria-describedby`-koppelingen of foutsummary.

**WCAG:** 3.3.1 Error Identification, 3.3.3 Error Suggestion.

### P2 — Skiplinktekst is “Menu”

`BaseLayout` gebruikt de navigatievertaling als skiplinktekst. Het doel is `#main-content`, dus de toegankelijke naam hoort “Ga naar de inhoud” te zijn.

**WCAG:** 2.4.1 Bypass Blocks, 2.4.6 Headings and Labels.

### P2 — Megamenu state

De product- en nichelinks hebben `aria-haspopup="true"`, maar geen `aria-expanded` of expliciete koppeling naar het paneel. Focus-within maakt het paneel bruikbaar, maar de toestand is niet volledig aangekondigd.

**WCAG:** 4.1.2 Name/Role/Value.

### P2 — Kleine tekst

Verscheidene labels, badges en statusregels gebruiken 8–10 px. Dit kan bij lage zichtbaarheid onvoldoende leesbaar zijn, ook wanneer contrast technisch slaagt.

**WCAG:** 1.4.4 Resize Text en algemene leesbaarheid.

### P2 — Interactieve demo’s

De demo’s veranderen veel visuele state. Niet iedere verandering heeft een live region; completion state is vooral visueel. Screenreaderverificatie ontbreekt.

**WCAG:** 4.1.3 Status Messages.

### P2 — Taalkeuze en landingspagina

De rootpagina heeft eigen markup buiten BaseLayout. Controleer de focusvolgorde, current language en aankondiging van markt/taal in VoiceOver/NVDA.

## Handmatige acceptatiematrix

1. Volledige site met alleen toetsenbord.
2. VoiceOver Safari en NVDA/Chrome: header, taalkeuze, product/nichemenu.
3. 200% browserzoom en 400% tekstzoom op 1280 CSS px.
4. 320 CSS px reflow zonder verborgen inhoud.
5. GHL testkalender: selecteren, fout, bevestigen en terugkeren.
6. Stripe testbuy-button: focus, fout en bevestiging.
7. Demo, calculator, zoekfilter en accordions met screenreader.
8. axe-core op de tien performancekernroutes.

## Conclusie

De eigen componenten hebben een serieuze accessibilitybasis, maar externe widgets, zoom/reflow en foutcommunicatie moeten vóór livegang worden bewezen. Score: **3/5**.
