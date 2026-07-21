# Interaction & affordance audit

## Beslissingen

- Hero-secondary CTA's zijn tekstlinks waar ze navigeren naar achtergrondinformatie.
- Megamenu-items blijven links; de extra CTA is geen losse gevulde knop meer.
- Productkeuze op bestelpagina blijft een radio-buttonpatroon, omdat de keuze de pagina-state en vervolglinks verandert.
- Processtappen blijven buttons/tabs, omdat ze de rechter detailweergave wijzigen.
- FAQ's en integratiedetails gebruiken native disclosure.
- Crew-sliderpijlen blijven buttons en hebben `aria-label`.
- De volledige mobiele CTA-overlay is verwijderd.

## Geautomatiseerde contracten

- Kernroutes worden gecontroleerd op links zonder `href`.
- Naamloze buttons worden geweigerd.
- Bestelproductkeuze ondersteunt pijltjestoetsen, Home en End.
- Alle 21 branchepagina's worden mobiel op horizontale overflow gecontroleerd.

## Handmatige controle

- Hover/focus verandert kleur of achtergrond op klikbare regels.
- Niet-klikbare informatierijen hebben geen buttonstijl of pointercursor.
- Primaire en secundaire acties zijn visueel onderscheidbaar.
- Sticky inhoudsopgave op artikelen blijft ondersteunend en oogt niet als CTA-grid.
