# Deployment runbook

1. Laat Codex de actuele `origin/main` ophalen en een nieuwe reviewbranch maken.
2. Controleer de diff op persoonsgegevens, secrets en onverwachte verwijderingen.
3. Voer de volledige lokale kwaliteitsreeks uit uit de README.
4. Push uitsluitend de reviewbranch en open een pull request.
5. Merge nooit wanneer `Website release gate` niet groen is.
6. Controleer de Netlify Deploy Preview op `/nl/`, afspraak, bestelling, één
   product, één niche en kennisbank.
7. Gebruik in preview `GHL_TEST_MODE=true`; controleer één formulier zonder
   klantcommunicatie.
8. Merge de goedgekeurde pull request naar de beschermde `main`.
9. Netlify bouwt opnieuw vanaf exact die `main`-commit en publiceert atomair.
10. Vergelijk `/.well-known/autopilots-release.json` met de gemergede commit.
11. Controleer redirects, kalenderload, formulierresponse, Stripe-dashboard en
    webhookstatus.
12. Noteer deploy-ID, commit, goedkeurder en controle-uitkomst in het launchlog.

Verboden in de normale werkwijze:

- rechtstreeks committen of pushen naar `main`;
- force-pushen naar `main`;
- lokaal `netlify deploy --prod` uitvoeren;
- een oude Netlify-deploy publiceren zonder incidentgoedkeuring;
- de verplichte releasechecks omzeilen.

Nooit secrets, klantnamen of webhookpayloads in screenshots of logs opnemen.
