# Rollback runbook

1. Stop bij conversie-, privacy-, routing- of checkoutproblemen verdere promotie.
2. Kies in Netlify **Deploys** de laatst aantoonbaar goede productie-deploy en gebruik **Publish deploy**.
3. Draai geen datareset: Blob-records zijn audit- en herstelgegevens.
4. Pauzeer zo nodig de Stripe- of GHL-webhook in het leveranciersdashboard; verwijder secrets niet zonder incidentbesluit.
5. Reproduceer het probleem op een branch, voeg een regressietest toe en deploy eerst als preview.
6. Controleer na rollback `/nl/`, afspraak, bestelling, kernredirects en functionlogs.

Rollback-eigenaar: degene met Netlify productie-toegang. Escalatie: eigenaar van GHL/Stripe voor leveranciergerelateerde fouten.
