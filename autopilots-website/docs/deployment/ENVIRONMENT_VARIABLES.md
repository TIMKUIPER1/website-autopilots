# Environment variables

| Variabele | Scope | Geheim | Vereist productie | Doel |
|---|---|---:|---:|---|
| `PUBLIC_SITE_URL` | build | nee | ja | canonieke origin |
| `PUBLIC_GHL_CALENDAR_URL` | build | nee | ja | gevalideerde kalenderembed |
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` | build | nee | ja | Stripe Buy Button |
| `PUBLIC_ANALYTICS_PROVIDER` | build | nee | nee | provideradapter; standaard `none` |
| `PUBLIC_ANALYTICS_SITE_ID` | build | nee | alleen bij provider | site/container-ID |
| `GHL_PRIVATE_INTEGRATION_TOKEN` | runtime | ja | ja | contacts/opportunities write |
| `GHL_LOCATION_ID` | runtime | ja | ja | subaccount |
| `GHL_PIPELINE_ID` | runtime | ja | ja | Closers-pipeline |
| `GHL_PIPELINE_STAGE_ID` | runtime | ja | ja | gewenste instroomstage |
| `GHL_FUNNEL_CONTEXT_FIELD_KEY` | runtime | ja | ja | context/custom field |
| `GHL_AUTOBEDRIJVEN_FUNNEL_WEBHOOK_URL` | runtime | ja | nee | oude compatibele webhook |
| `GHL_BOOKING_WEBHOOK_SECRET` | runtime | ja | ja | HMAC boekingsbevestiging |
| `STRIPE_WEBHOOK_SECRET` | runtime | ja | ja | Stripe handtekening |
| `GHL_TEST_MODE` | runtime | nee | preview | dry-run zonder CRM-mutatie |
| `GHL_TEST_CONTACT_PREFIX` | runtime | nee | nee | herkenbare testrecords |
| `ALERT_WEBHOOK_URL` | runtime | ja | nee | foutmelding zonder PII |

Secrets staan uitsluitend in Netlify environment variables. De build faalt in `CONTEXT=production` wanneer kritieke waarden ontbreken.
