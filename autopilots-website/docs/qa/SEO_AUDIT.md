# SEO-audit

> **Post-repair:** `/nl/` is de enige indexeerbare Nederlandse architectuur. Legacy-NL is noindex + directe 301, niet-NL is noindex en uit sitemap/hreflang. Buildcrawl: 322 routes, 12.332 interne links, strict i18n pass. De baseline hieronder is historisch.

## Samenvatting

De technische basis is bovengemiddeld: titles, descriptions, canonicals, robots, Open Graph en globale Organization/WebSite-schema’s worden centraal gezet. De 15 Nederlandse AI-artikelen hebben unieke metadata, geldige schema’s en een eigen inhoudscontrole. De grootste SEO-fout is niet ontbrekende markup, maar route-eigenaarschap en contentkwaliteit.

## Kerncijfers

| Metriek | Resultaat |
|---|---:|
| HTML-bestanden in schone output | 308 |
| Astro-routes | 307 |
| Extra publiek HTML-bestand | 1 |
| Indexeerbaar | 287 |
| Noindex | 21 |
| Interne links gecontroleerd | 9.943 |
| Routes met ontbrekende alt | 0 |
| Routes met duplicate IDs | 0 |
| Routes met ongeldige JSON-LD | 0 |
| H1-afwijkingen | 15; dit zijn statische redirectdocumenten |
| Duplicate-descriptiongroepen | 18 |
| Ontbrekende artikelvertalingen | 75 |
| Generieke locale-routes met native review open | 195 |

## P0/P1 bevindingen

### 1. Dubbele Nederlandse informatiearchitectuur — P0

`/producten/` en `/nl/producten/` zijn beide indexeerbaar met een self-canonical, maar hebben sterk verschillende inhoud. Hetzelfde geldt voor branche-, proces-, crew-, kennisbank-, afspraak- en bestelroutes. De Nederlandse sitemap bevat zowel de 39 locale-routes als 15 aanvullende onprefixed Nederlandse routes.

**Oplossing:** kies één canonieke NL-URL-set. Als onprefixed Nederlands blijft, laat alle NL-hreflang/canonicals en navigatie daarheen wijzen en serverredirect `/nl/*`. Als `/nl/*` blijft, render daar de volwaardige componenten en serverredirect de oude routes.

### 2. Locale-routes zijn thin en template-identiek — P1

De meeste locale-routes hebben 70–100 woorden hoofdcontent. Per taal delen 21 niches exact dezelfde description, vijf producten dezelfde description en twaalf algemene pagina’s dezelfde description. Deze routes zijn indexeerbaar.

**Oplossing:** zet incomplete locales tijdelijk `noindex,follow` en verwijder ze uit sitemaps, of publiceer alleen na unieke, native gereviewde content.

### 3. Redirects zijn niet betrouwbaar server-side — P1

Astro bouwt de oude `/diensten/*` routes als HTML-documenten met clientredirect. Zonder hostingregels is geen HTTP 301 bewezen. `public/_redirects` bevat bovendien:

`/kennisbank/ai-act-2026-chatbot-melden-dat-het-ai-is/ /kennisbank/ai-act-2026-chatbot-melden-dat-het-ai-is/ 301`

Dit is een zelfredirect en kan op Netlify een loop veroorzaken.

### 4. Sitemapstrategie — P1

De sitemapindex bevat zes locale-sitemaps. NL heeft 54 URLs, de overige talen 39. Dat is technisch verklaarbaar, maar de NL-set publiceert twee concurrerende architecturen. Noindex-campagnes staan niet in de locale-sitemaps, wat correct is. Het persoonlijke publieke voorstel is noindex maar blijft bereikbaar.

### 5. Hreflang — P1

Locale-routes hebben zes alternates plus x-default. Niet-gelokaliseerde Nederlandse pagina’s tonen taalswitchlinks, maar zijn niet consequent onderdeel van dezelfde head-alternatecluster. Los eerst canonical ownership op; valideer daarna hreflangreciprociteit opnieuw.

## Schema-overzicht

| Routegroep | Schema aanwezig | JSON geldig | Aanbevolen/vervolg |
|---|---:|---:|---|
| Alle BaseLayout-pagina’s | Ja | Ja | Organization/WebSite behouden |
| Niche detail legacy | Service, Breadcrumb, FAQ | Ja | Alleen zichtbare FAQ’s en feitelijke serviceclaims behouden |
| Artikelen | BlogPosting, Breadcrumb, FAQ waar van toepassing | Ja | Datums en bronnen redactioneel blijven controleren |
| Bestel direct | WebPage | Ja | Offer/Product pas toevoegen wanneer prijs en beschikbaarheid exact zichtbaar zijn |
| Voorstel | Globaal schema | Ja | Offer/Product na Stripe-verificatie |
| Campagne | Nee | n.v.t. | Noindex; geen SEO-schema nodig |
| Redirectdocumenten | Nee | n.v.t. | Vervangen door echte HTTP 301 |

## Metadata

- Geen ontbrekende title/canonical op echte contentpagina’s.
- Beschrijvingen zijn op de generieke locales vaak kort (circa 62–69 tekens) en duplicaat.
- Locale-producttitles zijn uniek door productnaam, maar de descriptions en bodytemplate niet.
- De taalkeuzepagina is indexeerbaar met 45 woorden. Als x-default is dit verdedigbaar, maar hij moet geen organische homepage-intentie overnemen van `/nl/`.
- Alle OG-images wijzen standaard naar een SVG. Verifieer delen op LinkedIn, WhatsApp en X; sommige crawlers behandelen SVG previews minder voorspelbaar dan 1200×630 PNG/JPG.

## Kennisbank

Sterk:

- 15 Nederlandse artikelen met unieke metadata en structuur.
- Bronnen, contextlinks en FAQ-schema worden door een eigen check gecontroleerd.
- Kennisbankfilters en interne conversielinks zijn aanwezig.

Risico’s:

- 75 vertaalde artikelslugs bestaan in de contentarchitectuur maar de pagina’s zijn bewust nog niet gebouwd.
- Publiceer deze niet automatisch; native review is vereist.
- Controleer regelgevingsteksten zoals AI Act en AVG op een inhoudelijke eigenaar en concrete reviewdatum.

## Aanbevolen acceptatietests

1. Eén URL per NL-content-ID geeft 200; alle alternatieven geven een echte 301.
2. Canonical, hreflang en sitemap gebruiken dezelfde route-eigenaar.
3. Geen zelfredirect of chain in de hostingredirects.
4. Incomplete locales zijn noindex en niet in sitemap.
5. Iedere indexeerbare commerciële pagina heeft unieke title, description en branchespecifieke hoofdcontent.
6. Search Console sitemapvalidatie en URL-inspectie op minimaal home, product, niche, artikel, afspraak.
