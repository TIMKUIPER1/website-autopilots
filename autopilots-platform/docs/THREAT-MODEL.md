# Threat model — eerste fundament

| Risico | Grens in deze slice | Productie-eis |
|---|---|---|
| Cross-tenant toegang | Iedere query vereist een tenant-id en wordt daarop gefilterd | Database-RLS plus negatieve integratietests |
| Ongeldige statuswissel | Centrale state machine blokkeert ongeldige overgangen | Database-transactie en workflow history |
| Auditmanipulatie | Audit events zijn alleen append-only via de store-interface | Externe immutable auditopslag |
| Secrets in modelcontext | Datamodel bevat uitsluitend `secretReference` | Managed vault en tijdelijke credential broker |
| Prompt injection | Externe tekst heeft geen uitvoeringsbevoegdheid | Tool gateway en policy-engine |
| Onbevoegde productieactie | Production vereist een aparte approvalstatus | Managed identity, MFA en artifact-bound approvals |
| Dubbele acties | Commands accepteren een idempotency key | Duurzame unieke databaseconstraint |

Deze demo bevat bewust geen echte authenticatie, secrets of externe koppelingen. Demo-mode moet in productie hard worden geweigerd.
