# Design-system simplification

## Hiërarchie

- Primair: bruine gevulde knop, maximaal één per beslismoment.
- Secundair: tekstlink met pijl; geen concurrerende outlinebutton tenzij het een echte alternatieve taak is.
- Keuzecontrols: alleen button/radio-vorm waar de gebruiker daadwerkelijk een state kiest.
- Navigatielinks: open regels, geen kaartvorm.

## Containers

- Een card is gereserveerd voor interactieve demo's, selecties, prijsinformatie of een inhoudelijk zelfstandig bewijsblok.
- Eenvoudige opsommingen gebruiken scheidingslijnen en witruimte.
- Geen card in een card tenzij de binnenste laag een aantoonbare interactieve state heeft.
- Standaard schaduw is verwijderd of sterk verlaagd; diepte wordt gebruikt voor primaire interactieve modules.

## Typografie en ruimte

- Koppen blijven compact en uitgesproken; bodycopy krijgt meer regelafstand en een begrensde tekstbreedte.
- Secties hebben één visueel beginpunt: kicker, titel, korte uitleg.
- Op mobiel stapelen keuzes lineair; niets ligt permanent over de inhoud.

## Responsive regels

- Twee- en driekoloms open lijsten worden één kolom onder 640–720px.
- Lange woorden gebruiken `overflow-wrap`; grids gebruiken `minmax(0, 1fr)`.
- Interactieve doelen blijven minimaal circa 44px hoog.
- De mobiele vaste CTA-overlay is verwijderd.

## Toegankelijkheid

- Buttons zijn alleen voor acties/state; links voor navigatie.
- Icon-only controls hebben een toegankelijke naam.
- Accordions gebruiken native `details/summary`.
- Radiokeuze gebruikt `role="radiogroup"`, `role="radio"`, `aria-checked` en toetsenbordnavigatie.
