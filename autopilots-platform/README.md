# Autopilots Platform

Eerste werkende verticale slice van de Autopilots implementatiemachine. De publieke website blijft in `../autopilots-website`; dit project vormt de aparte beveiligingsgrens voor klantportaal, Control Center en toekomstige agentworkflows.

## Lokaal starten

```bash
npm run check
npm start
```

Open daarna:

- Klantportaal: `http://127.0.0.1:4310/`
- Control Center: `http://127.0.0.1:4310/control-center`
- Health: `http://127.0.0.1:4310/health`

## Wat nu werkt

- tenant-scoped domeinqueries;
- centrale, geteste implementatie-state-machine;
- idempotente statuscommando’s;
- append-only audit events via de store-interface;
- klantportaal met implementatievoortgang;
- intern Control Center met Human Task Inbox;
- securityheaders en een strikte content security policy;
- negatieve test voor cross-tenant mutaties.

## Bewuste grens

Dit is een veilige demo-slice, geen productie-authenticatie. De volgende fase vervangt de in-memory adapter door PostgreSQL/Supabase met row-level policies, voegt managed identity toe en koppelt een duurzame workflow-engine en secrets vault. Echte klantdata en credentials mogen pas daarna worden aangesloten.
