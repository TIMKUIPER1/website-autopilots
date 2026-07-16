# Locale route map

De volledige machineleesbare kaart staat in `src/i18n/routes.ts`. Hoofdstructuur:

| ID | NL | EN | ES | DE | IT | FR |
|---|---|---|---|---|---|---|
| page.home | /nl/ | /en/ | /es/ | /de/ | /it/ | /fr/ |
| page.products | /nl/producten/ | /en/products/ | /es/productos/ | /de/produkte/ | /it/prodotti/ | /fr/produits/ |
| page.niches | /nl/voor-wie/ | /en/industries/ | /es/sectores/ | /de/branchen/ | /it/settori/ | /fr/secteurs/ |
| page.process | /nl/proces/ | /en/process/ | /es/proceso/ | /de/prozess/ | /it/processo/ | /fr/processus/ |
| page.knowledge | /nl/kennisbank/ | /en/knowledge/ | /es/conocimientos/ | /de/wissen/ | /it/conoscenza/ | /fr/connaissances/ |

Product-, branche- en artikelslugs zijn per markt vastgelegd en niet met runtime-vertaling samengesteld.
