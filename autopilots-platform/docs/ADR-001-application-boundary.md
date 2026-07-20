# ADR-001: afzonderlijke applicatiegrens

## Besluit

Het klantportaal en Control Center worden als `autopilots-platform` gebouwd, los van de publieke Astro-website en het bestaande sales-dashboard.

## Waarom

- De publieke website is statisch en geoptimaliseerd voor marketing en SEO.
- Het platform verwerkt tenantdata, approvals, agentruns en toekomstige secrets.
- Een aparte runtime beperkt de impact van fouten en maakt eigen identity, database, workers en deployment mogelijk.
- De eerste versie is een modulaire monoliet. Modulegrenzen zijn belangrijker dan vroege microservices.

## Productie-evolutie

De huidige in-memory demo-adapter is uitsluitend bedoeld om domeinregels en interface te bewijzen. Vóór echte klantdata worden minimaal toegevoegd: PostgreSQL met row-level policies, managed identity met MFA, een workflow-engine, object storage, een managed secrets vault en append-only auditopslag.
