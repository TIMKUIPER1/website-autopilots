# Deployment runbook

1. Maak een reviewbranch en controleer de diff op persoonsgegevens en secrets.
2. Voer de volledige lokale kwaliteitsreeks uit uit de README.
3. Push en laat GitHub Actions slagen.
4. Controleer de Netlify Deploy Preview op `/nl/`, afspraak, bestelling, één product, één niche en kennisbank.
5. Gebruik in preview `GHL_TEST_MODE=true`; controleer één formulier zonder klantcommunicatie.
6. Bevestig in productie dat alle vereiste Netlify-variabelen aanwezig zijn.
7. Merge naar `main`; Netlify bouwt met `npm run build` en publiceert atomair.
8. Controleer redirects, kalenderload, formulierresponse, Stripe-dashboard en webhookstatus.
9. Noteer deploy-ID, commit en controle-uitkomst in het launchlog.

Nooit secrets, klantnamen of webhookpayloads in screenshots of logs opnemen.
