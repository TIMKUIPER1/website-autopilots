# Eenmalige GitHub- en Netlify-lockdown

Deze beheerinstellingen maken de repositorycontroles afdwingbaar. De technische
bestanden alleen zijn niet voldoende wanneer een beheerder beveiligingen kan
omzeilen.

## GitHub ruleset voor `main`

Stel één actieve branch ruleset in voor `main`:

- restrict deletions;
- block force pushes;
- require a pull request before merging;
- require at least 1 approval;
- dismiss stale approvals;
- require conversation resolution;
- require status check `Verify complete website release`;
- require status check `Protect production funnel`;
- require branches to be up to date before merging;
- require review from Code Owners;
- do not allow bypass voor normale beheeraccounts.

Laat uitsluitend een afzonderlijk break-glassaccount buiten de normale
werkwijze vallen. Bewaar de toegang daarvan met MFA en gebruik het alleen tijdens
een formeel incident.

## Netlify

- Repository: `TIMKUIPER1/website-autopilots`
- Production branch: `main`
- Base directory: `autopilots-website`
- Build command: `npm run build && npm run release:verify`
- Publish directory: `dist`
- Stop builds wanneer een deploy niet van de gekoppelde repository komt.
- Beperk handmatige production deploys tot het break-glassaccount.
- Gebruik Deploy Previews voor pull requests.
- Gebruik in previews `GHL_TEST_MODE=true`.
- Laat productievariabelen alleen in de production context bestaan.
- Schakel ongebruikte build hooks uit.
- Verplicht MFA voor alle teamleden met productie-toegang.
- Stel in de production-context
  `AUTOPILOTS_FUNNEL_RELEASE_ID=autodealer-ai-scan-2026-07-21-v2` in.
- Schakel automatische kredietherlading of een ruim kredietpakket in, zodat een
  noodzakelijke veiligheidsrelease niet door een leeg creditsaldo wordt
  tegengehouden.

## GitHub Pages

GitHub Pages is niet de hoofdwebsite. De workflow heeft geen automatische
pushtrigger meer. Behoud Pages alleen zolang de GHL-inventaris bevestigt dat
legacy embeds ervan afhankelijk zijn. Verplaats die embeds daarna naar een
afzonderlijk beheerd publicatiepad en schakel Pages uit.

## Bewijs van afronding

De lockdown is pas compleet wanneer:

1. een directe push naar `main` wordt geweigerd;
2. een pull request zonder groene releasecheck niet kan mergen;
3. een force-push wordt geweigerd;
4. Netlify alleen `main` uit de gekoppelde repository als productie accepteert;
5. de live release-JSON dezelfde commit meldt als de goedgekeurde pull request.
6. een PR die een vergrendeld funnelbestand wijzigt faalt op
   `Protect production funnel`;
7. een PR die funnel en funnelbewaking tegelijk wijzigt wordt geweigerd;
8. een Netlify-productiebuild met een verkeerde externe funnel-release-ID wordt
   geweigerd.
