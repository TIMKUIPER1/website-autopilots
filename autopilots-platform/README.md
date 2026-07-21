# Autopilots Demo Platform

Veilige, lokale salesdemo voor Curaçao Auto Center. Alle data is synthetisch en iedere actie blijft binnen de demo-store.

De applicatie gebruikt één workspace-shell voor klant en Control Center. Oude losse portalpagina's zijn verwijderd om afwijkende navigatie en `file://`-gebruik te voorkomen.

Officiële productcatalogus: AI Inboxmedewerker, AI Leadopvolger, AI Telefoniste, Autopilots CRM en Leadsmachine AI. Alleen de eerste drie kunnen als primaire AI Medewerker worden geselecteerd.

## Status

Dit is de **governed OS core in sandboxmodus**, niet het boekhoud- of productiesysteem. `sales-dashboard` blijft voorlopig de legacy operationele applicatie en integratiebron. De gekozen lighthouse-route bewijst veilige onboarding en menselijke activatie; externe writes blijven geblokkeerd.

Zie `../PLANS.md` en `docs/architecture/CURRENT_TARGET.md` voor de actuele grens en vervolgstappen.

## Starten

```bash
node src/server.js
```

Open `http://127.0.0.1:4310/login`.

Demoaccount (alleen zichtbaar als voorbeeld in de lokale login):

- E-mail: `demo@curacao-auto.example`
- Democode: `autopilots-demo`

Intern demoaccount:

- E-mail: `operator@autopilots.example`
- Democode: `autopilots-internal`

## Klant

- `/login`
- `/`
- `/demo`
- `/requirements`
- `/voorstel`
- `/documenten`
- `/afrekenen`
- `/betaling-geslaagd`
- `/onboarding`
- `/secure-data-room`
- `/integraties`
- `/testen`
- `/activiteit`

## Intern

- `/control-center`
- `/control-center/implementaties/impl_001`
- `/control-center/tasks`
- `/control-center/approvals`
- `/control-center/agents`

## Veiligheidsgrens

De demo kan geen echte calls, e-mails, betalingen of externe writes uitvoeren. Integraties en betalingen zijn gesimuleerd; approvals worden wel door serverbeleid en contextversies afgedwongen. Voor productie zijn minimaal managed authentication, PostgreSQL met row-level security, een secrets vault, duurzame workflows en externe auditopslag nodig.

## Preview naar activatie

De klant krijgt vóór betaling een persoonlijke AI Medewerker in een geïsoleerde Preview Sandbox. De implementatie wordt pas geactiveerd nadat de verplichte documentversies zijn geaccepteerd en de veilige demo-checkout een geverifieerde betaling teruggeeft. Daarna opent de Secure Data Room.

De Data Room demonstreert tenant-isolatie, gecontroleerde uploads en een vaultreferentie waarbij de ingevoerde secret nooit wordt teruggegeven of aan agents wordt getoond. Dit zijn productregels in de demo; echte encryptie, malware scanning, Stripe-webhooks en secrets storage moeten in de productiefase via managed infrastructuur worden aangesloten.
