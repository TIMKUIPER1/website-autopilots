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
een eigen `HttpOnly` sessiecookie. Supabase bewaart uitsluitend de SHA-256-hash
van die willekeurige cookie. Iedere aanvraag controleert opnieuw profielstatus,
MFA, membership, verloop en revocation; een procesherstart verbreekt de sessie
niet. Access- en refresh-tokens worden niet in de browseropslag of
applicatiesessie bewaard.

Het eerste owner-account is `admin@auto-pilots.io`, met legal-entity-scope
voor Autopilots, AutoReviews, AutoPlanner en RoofPlanner. MFA is verplicht voor
acties. De callback begeleidt een nieuwe owner door TOTP-inrichting of vraagt
bij een bestaand device om de actuele authenticatorcode. Pas nadat Supabase
`aal2` bevestigt, wordt de Autopilots-sessie aangemaakt.

## Herhaalbare software-onboarding

Iedere operating brand heeft in Supabase een herhaalbare onboardingrun met zes
stappen: fundament, website, Supabase, product-API, Stripe en monitoring. Een
nieuwe connector begint altijd met discovery en een read-only healthprobe;
providerwrites, OAuth-promotie en autonome activering horen niet bij deze fase.

De huidige live read-only observatie is eerlijk gelabeld:

- Autopilots: gezond;
- AutoPlanner: bereikbaar maar gedegradeerd door ontbrekende database/queue;
- AutoReviews: legacy aggregate bron momenteel onbereikbaar;
- RoofPlanner: product-API momenteel onbereikbaar.

Deze status is operationele observatie, geen bewijs dat een product of provider
productierijp is. Details staan in
`docs/runbooks/deployments/AP-INT-20260803-001.md`.

Herhaalde waarnemingen kunnen via de server idempotent worden vastgelegd. Eén
actieve fout wordt één incident met een oplopende contextversie, niet een reeks
dubbele meldingen. Menselijke bevestiging is een governed R1-commando met
idempotency, auditbewijs en een kostenregel. Automatisch herstel en externe
writes blijven geblokkeerd. Zie
`docs/runbooks/deployments/AP-OPS-20260803-001.md` en
`docs/runbooks/deployments/AP-OPS-20260803-002.md`.

De lokale managed sandbox kan daarnaast begrensd automatisch monitoren. De
scheduler gebruikt vaste tijdvakken, weigert overlap en schrijft als
`autopilots-health-monitor`; het authority-profiel bepaalt alleen de toegestane
brand-scope en wordt niet als menselijke actor gelogd. De huidige cadence is 15
minuten. Automatische remediation bestaat niet. Zie
`docs/runbooks/deployments/AP-OPS-20260803-003.md`.

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
- `GET /api/v1/onboarding/brands/:slug` — zes onboardingstappen, connectorstatus en laatste geregistreerde foutcode.
- `GET /api/v1/health/brands/:slug` — actuele, read-only productprobe met een stabiele veilige foutcode.
- `GET /api/v1/health/portfolio` — actuele read-only samenvatting van alle toegestane operating brands.
- `GET /api/v1/incidents` — actieve incidenten binnen de server-afgedwongen portfolioscope.
- `GET /api/v1/incidents/brands/:slug` — actieve incidenten binnen één toegestane operating brand.
- `POST /api/v1/monitoring/probe/brands/:slug` — legt een expliciet gestarte read-only probe idempotent vast; vereist MFA en schrijft niet naar het product.
- `POST /api/v1/incidents/:id/acknowledge` — governed R1-bevestiging met actuele contextversie en idempotency-key; vereist MFA.

De API gebruikt expliciete `legalEntityId`, `brandId` en `customerId` velden. Onbekende financiële waarden zijn `null`, niet synthetisch nul. AutoReviews-bronnen blijven geblokkeerd totdat echte sandboxverbindingen en externe mappings zijn gevalideerd.

## Veiligheidsgrens

De productdemo kan geen echte calls, betalingen of externe providerwrites uitvoeren. In Supabase-authmodus kan uitsluitend een echte beveiligde inlogmail worden verstuurd; productintegraties en betalingen blijven gesimuleerd. Approvals worden door serverbeleid en contextversies afgedwongen. Voor productie zijn daarnaast een secrets vault, duurzame workflows, hersteltests en externe auditopslag nodig.

## Preview naar activatie

De klant krijgt vóór betaling een persoonlijke AI Medewerker in een geïsoleerde Preview Sandbox. De implementatie wordt pas geactiveerd nadat de verplichte documentversies zijn geaccepteerd en de veilige demo-checkout een geverifieerde betaling teruggeeft. Daarna opent de Secure Data Room.

De Data Room demonstreert tenant-isolatie, gecontroleerde uploads en een vaultreferentie waarbij de ingevoerde secret nooit wordt teruggegeven of aan agents wordt getoond. Dit zijn productregels in de demo; echte encryptie, malware scanning, Stripe-webhooks en secrets storage moeten in de productiefase via managed infrastructuur worden aangesloten.
