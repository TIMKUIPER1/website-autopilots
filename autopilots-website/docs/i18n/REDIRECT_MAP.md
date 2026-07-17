# Redirect map

Doelmodel: alle historische Nederlandse indexeerbare routes gaan met 301 naar het `/nl/`-equivalent. De implementatie hoort in `public/_redirects` en op het uiteindelijke hostingplatform te worden getest.

| Oud patroon | Nieuw patroon | Status |
|---|---|---|
| /producten/* | /nl/producten/* | na contentpariteitscontrole |
| /voor-wie/* | /nl/voor-wie/* | na contentpariteitscontrole |
| /proces/ | /nl/proces/ | na contentpariteitscontrole |
| /crew/ | /nl/crew/ | na contentpariteitscontrole |
| /kennisbank/* | /nl/kennisbank/* | geblokkeerd tot NL-artikelroutes bestaan |

Er wordt geen catch-all gebruikt die assets, campagnepagina's of onbekende 404's maskeert.
# Definitieve Nederlandse redirectmap

De indexeerbare Nederlandse architectuur staat onder `/nl/`. Netlify voert alle regels uit `public/_redirects` direct als geforceerde 301 uit en bewaart querystrings. URL-fragmenten blijven client-side behouden.

| Oud patroon | Definitief doel |
|---|---|
| `/producten/*` | `/nl/producten/:splat` |
| `/voor-wie/*` | `/nl/voor-wie/:splat` |
| `/kennisbank/*` | `/nl/kennisbank/:splat` |
| `/proces/*` | `/nl/proces/:splat` |
| `/crew/*` | `/nl/crew/:splat` |
| `/afspraak/*` | `/nl/afspraak/:splat` |
| `/bestel-direct/*` | `/nl/bestel-direct/:splat` |
| `/contact/*`, `/privacy/*`, `/voorwaarden/*` | gelijknamige `/nl/` route |
| `/diensten/chat*` | `/nl/producten/ai-inboxmedewerker/` |
| `/diensten/voice*` | `/nl/producten/ai-telefoniste/` |
| `/diensten/follow-up*` | `/nl/producten/ai-leadopvolger/` |
| overige `/diensten/*` | passend product, daarna `/nl/producten/:splat` |

Historische kennisslugs worden afzonderlijk direct naar de inhoudelijk beste bestaande `/nl/kennisbank/`-pagina gestuurd. `scripts/check-redirects.mjs` blokkeert self-loops, chains, ongeldige statussen en ontbrekende exacte doelen.
