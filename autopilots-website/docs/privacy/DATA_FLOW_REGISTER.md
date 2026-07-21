# Data flow register

Stand 16 juli 2026. “Voorbereid” betekent: codepad bestaat, maar is niet als actieve productie-integratie bewezen zonder accountcontrole.

| Leverancier/stroom | Doel | Gegevens | Grondslag | Regio/doorgifte | Bewaren | Toestemming | Status |
|---|---|---|---|---|---|---|---|
| Netlify hosting/functions/blobs | website, beveiliging, herstelbare formulieren | IP-afgeleide hash, aanvraagstatus, contact- en contextdata | precontractueel + beveiligingsbelang | accountinstelling te bevestigen | beleid te bevestigen | nee | voorbereid als productiehost |
| GoHighLevel/LeadConnector | kalender, CRM, contact/opportunity | naam, zakelijk contact, bedrijf, afspraak, product/niche/UTM | precontractueel/overeenkomst | accountregio en DPA te bevestigen | CRM-beleid te bevestigen | nee voor aanvraag | actief in UI; servercredentials extern te bevestigen |
| Stripe | checkout en betaalbevestiging | betaal-/transactiegegevens; website bewaart event-ID | overeenkomst/wettelijk | accountconfiguratie | financieel/wettelijk beleid | nee | drie autobedrijven-offers geconfigureerd |
| ElevenLabs | optionele voice-demo | stem/audio en gesprek na actieve start | toestemming/uitdrukkelijk verzoek | accountregio/DPA te bevestigen | agentinstelling te bevestigen | ja bij starten | click-to-load aanwezig |
| Google Fonts | weblettertypen | technisch verzoek/IP | gerechtvaardigd belang | leverancier kan buiten EER verwerken | providerbeleid | nee | actief |
| Analyticsadapter | geaggregeerde interactie-events zonder formulierinhoud | route, event, product/niche | toestemming | providerafhankelijk | providerafhankelijk | ja | voorbereid; provider standaard `none` |

Niet aangetroffen als actieve webintegratie: Telnyx, Google Calendar, GA/GTM, Meta Pixel, TikTok Pixel, Supabase, Railway runtime, e-mailmarketing, foutmonitoring en vertaalprovider. Activering vereist register- en privacy-update vooraf.
