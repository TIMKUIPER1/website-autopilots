# Rollback runbook

1. Stop bij conversie-, privacy-, routing- of checkoutproblemen verdere promotie.
2. Kies uitsluitend een eerder aantoonbaar goede productie-deploy waarvan commit,
   deploy-ID en geslaagde controles in het launchlog staan. Laat een tweede
   bevoegde persoon de exacte doelrelease bevestigen voordat **Publish deploy**
   wordt gebruikt.
3. Draai geen datareset: Blob-records zijn audit- en herstelgegevens.
4. Pauzeer zo nodig de Stripe- of GHL-webhook in het leveranciersdashboard; verwijder secrets niet zonder incidentbesluit.
5. Reproduceer het probleem op een branch, voeg een regressietest toe en deploy eerst als preview.
6. Controleer na rollback `/nl/`, afspraak, bestelling, kernredirects en functionlogs.
7. Controleer dat `/.well-known/autopilots-release.json` exact de goedgekeurde
   rollbackcommit rapporteert en leg de uitkomst vast.

Rollback-eigenaar: degene met Netlify productie-toegang. Escalatie: eigenaar van GHL/Stripe voor leveranciergerelateerde fouten.
