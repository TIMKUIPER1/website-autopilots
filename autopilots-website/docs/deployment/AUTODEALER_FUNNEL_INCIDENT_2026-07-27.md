# Productie-incident autobedrijvenfunnel — 27 juli 2026

## Samenvatting

De route `/lp/autobedrijven/ai-medewerker/` publiceerde opnieuw de eenvoudige
oude funnel, terwijl de nieuwere AI-scan op 21 juli al was gebouwd. Het incident
was geen willekeurige Netlify-rollback: de oude variant was opnieuw in `main`
terechtgekomen en Netlify publiceerde die commit correct.

De herstelde funnel staat vanaf commit `f71947f3e033168cf4b0f80e0f061c8d4c9d336e`
weer in de bron. Publicatie daarvan bleef op het moment van dit rapport
geblokkeerd doordat het Netlify-account geen inzetbare productiecredits meer had.

## Vastgestelde hoofdoorzaken

1. De funnel en zijn releasecontrole waren samen wijzigbaar in één pull request.
   Een wijziging kon daardoor zowel de productiepagina als de definitie van
   “correct” aanpassen.
2. De controle keek vooral naar tekstmarkers. Zij bewees niet dat alle kritieke
   funnelbestanden byte-voor-byte gelijk waren aan de goedgekeurde release.
3. De GitHub-ruleset vereiste wel een pull request en groene statuscheck, maar
   nul goedkeuringen. Er was dus geen afzonderlijke bevestiging voor wijzigingen
   aan productiebeleid.
4. Brede website- en i18n-wijzigingen konden de besloten funnel meenemen zonder
   dat dit als afzonderlijke risicowijziging zichtbaar werd.
5. Netlify-credits waren uitgeput. Daardoor kon een correct gemergede
   incidentfix niet meteen naar productie, terwijl de schadelijke vorige release
   online bleef.
6. Er was wel een live-identiteitsendpoint, maar geen preventieve,
   onveranderlijke funnelidentiteit buiten de repository.

## Nieuwe technische beheersmaatregelen

- `config/autodealer-funnel-lock.json` legt de goedgekeurde release-ID,
  verplichte en verboden teksten en SHA-256-hashes van alle kritieke
  funnelbestanden vast.
- De statuscheck `Protect production funnel` draait met
  `pull_request_target`. Hij leest het contract uit de beschermde basiscommit,
  nooit uit de pull request zelf.
- Een pull request mag de funnel en zijn bewaking niet tegelijk wijzigen.
- Iedere afwijking in een vergrendeld bestand wordt geblokkeerd, ook wanneer de
  zichtbare controleteksten toevallig nog aanwezig zijn.
- Een wijziging aan contract, workflow of releasebewaking vereist expliciet de
  label `funnel-contract-change`.
- Netlify productie moet
  `AUTOPILOTS_FUNNEL_RELEASE_ID=autodealer-ai-scan-2026-07-21-v2` bevatten.
  Een afwijkende of ontbrekende externe release-ID stopt de productiebuild.
- De bestaande livecontrole blijft na publicatie de zichtbare funnelmarkers en
  release-identiteit controleren.

## Restrisico's

Een absolute garantie tegen alle mogelijke beheerdersacties bestaat niet. Een
persoon met voldoende GitHub- én Netlify-beheerrechten kan beveiliging bewust
wijzigen. Ook kunnen een accountovername, storing bij GitHub/Netlify of
uitgeputte credits publicatie verhinderen.

Deze risico's worden organisatorisch beperkt door:

- geen bypassactoren op de `main`-ruleset;
- MFA voor productiebeheerders;
- contractwijzigingen als aparte, expliciet gelabelde pull request;
- geen lokale productiepublicaties;
- voldoende Netlify-credits of automatische herlading;
- na iedere merge verificatie van commit, deploy-ID en live funnelmarkers.

## Verplichte wijzigingsprocedure voor deze funnel

1. Wijzig nooit direct een vergrendeld funnelbestand.
2. Maak eerst een aparte contractwijziging met label
   `funnel-contract-change`; deze PR bevat geen funnelwijziging.
3. Bevestig daarin de bedoelde nieuwe release-ID en verwachte hashes.
4. Merge pas na expliciete controle van de gewenste preview.
5. Maak daarna een tweede PR met uitsluitend de vooraf goedgekeurde
   funnelbestanden.
6. Merge alleen wanneer zowel `Verify complete website release` als
   `Protect production funnel` groen zijn.
7. Laat Netlify uitsluitend de gemergede `main`-commit publiceren.
8. Controleer live release-JSON en alle verplichte funnelmarkers.

Een brede website-, vertaal- of Codex-wijziging die deze procedure niet volgt,
kan de productiefunnel niet meer ongemerkt veranderen.
