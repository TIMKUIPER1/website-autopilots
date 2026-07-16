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
