# Autopilots Website Translator in GHL

Gebruik bij voorkeur de script-versie. Die kun je eenmalig in de body/footer van je website plaatsen. De widget verschijnt linksonder op de pagina en vertaalt de hele pagina.

## Plaats deze script-tag in de body/footer

```html
<script
  src="https://timkuiper1.github.io/website-autopilots/projecten/website-translator/autopilots-translator-widget.js?v=4"
  data-position="bottom-left">
</script>
```

Plaats daarnaast niet ook nog de losse GTranslate float-widget. Die maakt een tweede vertaalmenu aan en kan de styling/positie verstoren.

De widget kiest automatisch de taal op basis van de browsertaal van de bezoeker. Als iemand handmatig een taal kiest, onthoudt de website die keuze.

Let op bij landingspagina's in een iframe: een script op de hoofdsite kan de inhoud van een iframe niet rechtstreeks aanpassen. Daarom staat er in de GHL-embedpagina's een verborgen translator-laag. Die toont geen tweede knop, maar zorgt wel dat de inhoud van de embedpagina vertaald kan worden.

## Footer blijft plakken bij terugscrollen

Als de live website na helemaal naar beneden scrollen de voettekst vast laat staan terwijl je weer omhoog scrolt, plaats dan ook deze globale fix in dezelfde body/footer custom code. Dit zet alleen echte footer-secties terug in de normale paginaflow en laat de Voice & Chat widget ongemoeid.

```html
<script
  src="https://timkuiper1.github.io/website-autopilots/shared-sections/autopilots-ghl-footer-scroll-fix.js?v=20260610">
</script>
```

## Talen

- Netherlands
- English
- German
- French
- Spanish
- Italian
- Portuguese
- Polish
- Turkish
- Arabic
- Chinese
- Hindi
- Indonesian
- Russian
- Ukrainian

## Alternatief: iframe-versie

De iframe-versie bestaat nog, maar die heeft een extra parent-script nodig om de volledige pagina te vertalen. Gebruik daarom liever de script-tag hierboven.
