# Environment variables

| Variabele | Scope | Geheim | Vereist productie | Doel |
|---|---|---:|---:|---|
| `PUBLIC_SITE_URL` | build | nee | nee | optionele override van canonieke origin |
| `PUBLIC_GHL_CALENDAR_URL` | build | nee | nee | optionele override van gevalideerde kalenderembed |
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` | build | nee | nee | optionele override van Stripe Buy Button-key |
| `PUBLIC_ANALYTICS_PROVIDER` | build | nee | nee | provideradapter; standaard `none` |
| `PUBLIC_ANALYTICS_SITE_ID` | build | nee | alleen bij provider | site/container-ID |
| `GHL_PRIVATE_INTEGRATION_TOKEN` | runtime | ja | ja | contacts/opportunities write |
| `GHL_LOCATION_ID` | runtime | ja | ja | subaccount |
| `GHL_META_PIPELINE_ID` | runtime | ja | ja | Closers-pipeline |
| `GHL_META_NEW_LEAD_STAGE_ID` | runtime | ja | ja | gewenste instroomstage |
| `GHL_FUNNEL_CONTEXT_FIELD_KEY` | runtime | ja | nee | optionele context/custom field |
| `GHL_AUTOBEDRIJVEN_FUNNEL_WEBHOOK_URL` | runtime | ja | nee | oude compatibele webhook |
| `GHL_BOOKING_WEBHOOK_SECRET` | runtime | ja | bij actieve webhook | HMAC boekingsbevestiging; endpoint faalt gesloten zonder waarde |
| `STRIPE_WEBHOOK_SECRET` | runtime | ja | bij actieve webhook | Stripe handtekening; endpoint faalt gesloten zonder waarde |
| `GHL_TEST_MODE` | runtime | nee | preview | dry-run zonder CRM-mutatie |
| `GHL_TEST_CONTACT_PREFIX` | runtime | nee | nee | herkenbare testrecords |
| `ALERT_WEBHOOK_URL` | runtime | ja | nee | foutmelding zonder PII |
| `FUNNEL_ADMIN_USER` | runtime | ja | nee | gebruikersnaam afgeschermd funneloverzicht |
| `FUNNEL_ADMIN_PASSWORD` | runtime | ja | nee | sterk uniek wachtwoord afgeschermd funneloverzicht |

Secrets staan uitsluitend in Netlify environment variables. De build faalt in
`CONTEXT=production` wanneer de actieve CRM-koppeling niet compleet is. Openbare
waarden hebben gecontroleerde defaults in `src/config/publicRuntime.ts`; de
environment variables zijn alleen overrides. Optionele webhook-endpoints geven
zonder bijbehorend secret altijd `401` en kunnen daardoor niet onbeveiligd werken.
