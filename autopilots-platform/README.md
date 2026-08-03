# Autopilots Demo Platform

Veilige, lokale salesdemo voor Curaçao Auto Center. Alle data is synthetisch en iedere actie blijft binnen de demo-store.

De applicatie gebruikt één workspace-shell voor klant en Control Center. Oude losse portalpagina's zijn verwijderd om afwijkende navigatie en `file://`-gebruik te voorkomen.

Officiële productcatalogus: AI Inboxmedewerker, AI Leadopvolger, AI Telefoniste, Autopilots CRM en Leadsmachine AI. Alleen de eerste drie kunnen als primaire AI Medewerker worden geselecteerd.

## Status

Dit is de **governed OS core in sandboxmodus**, niet het boekhoud- of productiesysteem. `sales-dashboard` blijft voorlopig de legacy operationele applicatie en integratiebron. De gekozen lighthouse-route bewijst veilige onboarding en menselijke activatie; externe writes blijven geblokkeerd.

Zie `../PLANS.md` en `docs/architecture/CURRENT_TARGET.md` voor de actuele grens en vervolgstappen.

## Duurzame databasefundering

De eerste PostgreSQL/Supabase-fundering staat in
`supabase/migrations/20260803090000_os_foundation.sql` en is op 3 augustus 2026
toegepast op het bestaande Supabase-project **Autopilots**
(`wurycoodzcybaxcgqxps`). Externe writes en live productconnectoren blijven
uitgeschakeld totdat identity, tenant-isolatie en herstel ook via de runtime
zijn getest.

De centrale laag bewaart identiteit, bedrijven, connectoren, brongezondheid,
workflows, approvals, audit en gebruikskosten. Productdata blijft eigendom van
AutoPlanner, AutoReviews en RoofPlanner en wordt via versievaste connectoren
samengevat. Secrets worden alleen als `vault://`-referentie bewaard.

Valideer lokaal met:

```bash
pnpm check
```

Een database-migratie is fail-closed en vereist expliciet
`ALLOW_DATABASE_MIGRATIONS=true`, een wijzigingsnummer en een doel-URL. Zie
`docs/runbooks/DATABASE_FOUNDATION.md`.

## Centrale Supabase-login

De sandbox kan met `AUTH_PROVIDER=supabase` één passwordless login gebruiken.
De server valideert het Supabase access token, haalt profiel, IAM-rol en
bedrijfsscope via een RLS-beveiligde databasefunctie op en zet daarna alleen
een eigen `HttpOnly` sessiecookie. Access- en refresh-tokens worden niet in de
browseropslag of applicatiesessie bewaard.

Het eerste owner-account is `admin@auto-pilots.io`, met legal-entity-scope
voor Autopilots, AutoReviews, AutoPlanner en RoofPlanner. MFA is verplicht voor
acties. De callback begeleidt een nieuwe owner door TOTP-inrichting of vraagt
bij een bestaand device om de actuele authenticatorcode. Pas nadat Supabase
`aal2` bevestigt, wordt de Autopilots-sessie aangemaakt.

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

- `/control-center/portfolio`
- `/control-center`
- `/control-center/implementaties/impl_001`
- `/control-center/tasks`
- `/control-center/approvals`
- `/control-center/agents`

## Canonieke OS API

- `GET /api/v1/os/portfolio` — legal entity, operating brands, owner exceptions en brongezondheid.
- `GET /api/v1/os/brands/:slug` — read-only Brand Digital Twin binnen server-afgedwongen brand scope.

De API gebruikt expliciete `legalEntityId`, `brandId` en `customerId` velden. Onbekende financiële waarden zijn `null`, niet synthetisch nul. AutoReviews-bronnen blijven geblokkeerd totdat echte sandboxverbindingen en externe mappings zijn gevalideerd.

## Veiligheidsgrens

De productdemo kan geen echte calls, betalingen of externe providerwrites uitvoeren. In Supabase-authmodus kan uitsluitend een echte beveiligde inlogmail worden verstuurd; productintegraties en betalingen blijven gesimuleerd. Approvals worden door serverbeleid en contextversies afgedwongen. Voor productie zijn daarnaast een secrets vault, duurzame workflows, hersteltests en externe auditopslag nodig.

## Preview naar activatie

De klant krijgt vóór betaling een persoonlijke AI Medewerker in een geïsoleerde Preview Sandbox. De implementatie wordt pas geactiveerd nadat de verplichte documentversies zijn geaccepteerd en de veilige demo-checkout een geverifieerde betaling teruggeeft. Daarna opent de Secure Data Room.

De Data Room demonstreert tenant-isolatie, gecontroleerde uploads en een vaultreferentie waarbij de ingevoerde secret nooit wordt teruggegeven of aan agents wordt getoond. Dit zijn productregels in de demo; echte encryptie, malware scanning, Stripe-webhooks en secrets storage moeten in de productiefase via managed infrastructuur worden aangesloten.
