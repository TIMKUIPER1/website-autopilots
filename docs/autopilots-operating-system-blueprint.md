# Autopilots Operating System Blueprint

## Doel

Autopilots heeft een centraal backend-systeem nodig waarin administratie, sales, marketing, delivery, operations en personeel samenkomen. Niet als losse dashboards naast elkaar, maar als een bedrijfsbrein: iedere klant, factuur, meeting, taak, transcriptie, usage-cost, medewerkeractie en marketingprestatie wordt gekoppeld aan dezelfde waarheid.

Het doel richting 0 tot 1 miljoen omzet:

- Altijd weten waar omzet, marge, cashflow en capaciteit staan.
- Per klant zien wat er verkocht, geleverd, gecommuniceerd, gefactureerd en verbruikt is.
- Per afdeling een dashboard met alleen de beslisinformatie die nodig is.
- Automatisch afwijkingen signaleren voordat ze geld, tijd of klanttevredenheid kosten.
- Minder handwerk, minder zoeken, minder dubbele data, meer sturing.

## Centrale architectuur

### 1 backend als centrale laag

Aanbevolen kern:

- Supabase als centrale database, storage en auth-laag.
- Railway of vergelijkbare Node-backend voor server-side koppelingen en webhooks.
- GoHighLevel als CRM/communicatiebron.
- ClickUp als delivery- en projectbron.
- Stripe als omzet- en factuurbron.
- Wise als betaal- en afboekbron.
- Gmail/Google Workspace als bron voor inkomende facturen, klantmails en documenten.
- Read AI als meeting/transcriptiebron.
- Usage-bronnen: Telnyx, ElevenLabs, Supabase, OpenAI/LLM-providers en overige AI-tools.

De bestaande `sales-dashboard` app blijft behouden en wordt onderdeel van dit grotere operating system.

### Praktische systeemkeuze

Maak geen verzameling losse dashboards met ieder een eigen logica. Bouw 1 centrale app met modules.

Aanbevolen structuur:

- `autopilots-os` als hoofdapp.
- `sales-dashboard` wordt een module binnen deze hoofdapp.
- Supabase bewaart de centrale waarheid.
- De backend haalt data op, normaliseert deze en schrijft alleen schone records weg.
- Iedere externe tool krijgt een eigen sync-laag.
- Iedere sync-laag schrijft eerst naar ruwe importtabellen en daarna pas naar bruikbare bedrijfsdata.

Praktisch betekent dit:

- Eerst data verzamelen.
- Daarna matchen.
- Daarna laten controleren waar nodig.
- Daarna pas dashboards en AI-beslissingen bouwen.

Zo voorkom je dat het systeem mooi oogt, maar op verkeerde data draait.

### Centrale klantkaart

Alles moet uiteindelijk landen op een `customer_id`.

Een klantkaart bevat:

- Bedrijfsnaam
- Domeinnaam
- Hoofdcontacten
- E-maildomeinen
- GHL contact/company IDs
- Stripe customer ID
- ClickUp workspace/list/folder/task IDs
- Contracten en ondertekende documenten
- Facturen, betalingen en openstaande posten
- Usage-kosten per tool
- Meetings, transcripties en samenvattingen
- Mails, afspraken, links en bestanden
- Delivery-status
- Support- en klantcontacthistorie
- Health score
- MRR, marge en risico's

Belangrijk: matching gebeurt primair op klantdomein. Alles van `@klantdomein.nl` wordt automatisch aan dezelfde klantmap gekoppeld, met een handmatige correctie-optie.

### Matching ladder

Niet elke koppeling is even betrouwbaar. Gebruik daarom een vaste matching ladder.

Volgorde:

- Directe externe ID: Stripe customer ID, GHL company ID, ClickUp folder/list ID.
- Geverifieerd klantdomein.
- Factuurgegevens: bedrijfsnaam, btw-nummer, adres, IBAN.
- Contactgegevens: e-mail, telefoon, naam.
- AI-inschatting op documentinhoud of transcriptie.

Actieregels:

- 95% tot 100% confidence: automatisch koppelen.
- 75% tot 94% confidence: koppelen, maar zichtbaar markeren als "controle aanbevolen".
- Onder 75% confidence: niet koppelen, maar in review inbox zetten.

Handmatige correcties worden opgeslagen als trainingsregels voor toekomstige matches.

### Single source of truth

Per domein moet vaststaan welke tool leidend is.

- Klantidentiteit: Supabase.
- CRM-status: GoHighLevel.
- Salesactiviteiten: GoHighLevel plus sales-dashboard.
- Projectstatus: ClickUp.
- Verkoopfacturen: Stripe.
- Betaalstatus en banktransacties: Wise.
- Inkomende facturen: Gmail plus documentextractie.
- Contracten en ondertekende documenten: GoHighLevel en Supabase Storage.
- Meetings en transcripties: Read AI.
- Interne acties: ClickUp.
- Managementrapportage: Supabase views.

Supabase vervangt deze tools niet. Supabase verbindt ze.

## Datamodel op hoofdlijnen

Minimaal benodigde tabellen:

- `companies`
- `contacts`
- `customer_domains`
- `documents`
- `emails`
- `meetings`
- `transcripts`
- `contracts`
- `invoices_sales`
- `invoices_purchase`
- `payments`
- `subscriptions`
- `usage_costs`
- `customer_profitability`
- `projects`
- `delivery_milestones`
- `team_members`
- `team_activity`
- `marketing_accounts`
- `marketing_posts`
- `marketing_metrics`
- `ai_agent_logs`
- `audit_log`

Aanvullende praktische tabellen:

- `raw_imports`
- `sync_runs`
- `integration_accounts`
- `matching_rules`
- `review_items`
- `customer_health_scores`
- `customer_mrr`
- `cost_allocations`
- `cashflow_forecasts`
- `department_kpis`
- `alerts`
- `saved_views`

Elke automatische inschatting krijgt:

- `confidence_score`
- `matched_by`
- `source`
- `review_status`
- `manually_corrected_by`
- `corrected_at`

Zo blijft het systeem automatisch, maar controleerbaar.

### Dataregels die vanaf dag 1 nodig zijn

- Elk record heeft `source_system`, `source_id`, `synced_at` en `raw_payload`.
- Elke klant heeft minimaal 1 geverifieerd domein of externe ID.
- Geen enkel document wordt definitief aan een klant gekoppeld zonder matchreden.
- Verwijderen gebeurt soft-delete, niet hard-delete.
- Elke handmatige wijziging komt in `audit_log`.
- Dashboards lezen uit opgeschoonde views, niet rechtstreeks uit ruwe API-data.

### Review inboxen

Er zijn minimaal 3 review inboxen nodig:

- Finance review: facturen, betalingen, abonnementen en prive/zakelijk classificatie.
- Customer match review: onbekende e-mails, documenten, meetings en domeinen.
- Delivery risk review: taken, deadlines, beloftes en blokkades die aandacht vragen.

Elke review item heeft:

- Type
- Bron
- Waarschijnlijk gekoppelde klant
- Confidence score
- Waarom het systeem dit denkt
- Aanbevolen actie
- Knoppen: goedkeuren, aanpassen, negeren, nieuwe klant maken

## Administratie

### Gewenst dashboard

Het administratie-dashboard toont:

- Omzet deze week, maand, kwartaal en jaar.
- Betaalde verkoopfacturen.
- Openstaande verkoopfacturen.
- Achterstallige facturen.
- Inkomende facturen die nog goedgekeurd moeten worden.
- Cashflowprognose voor 7, 30, 60 en 90 dagen.
- Verwachte toolkosten per klant.
- Werkelijke toolkosten per klant.
- Brutomarge per klant.
- Netto marge per klant.
- Privé-uitgaven versus zakelijke uitgaven.
- Wekelijkse uitgaven zakelijk.
- Wekelijkse uitgaven privé.
- Abonnementenoverzicht.
- Financiële alerts.

### Automatiseringen

- Inkomende facturen uit Gmail herkennen, uitlezen en opslaan.
- Facturen automatisch koppelen aan leverancier, klant, categorie en kostenplaats.
- Stripe verkoopfacturen automatisch importeren.
- Wise transacties importeren en matchen met inkomende facturen.
- Betalingen automatisch afboeken wanneer bedrag, leverancier en datum matchen.
- Bij twijfel markeren als "controle nodig".
- Correcties kunnen handmatig worden aangepast en worden daarna gebruikt om toekomstige matches slimmer te maken.

### Praktische finance-flow

De flow moet als volgt werken:

- Gmail haalt inkomende facturen op uit labels zoals `Facturen`, `Receipts`, `Finance` en leveranciersmails.
- Bijlagen worden opgeslagen in Supabase Storage.
- Metadata wordt uitgelezen: leverancier, factuurnummer, datum, bedrag, valuta, btw, vervaldatum.
- De factuur komt in `invoices_purchase`.
- Het systeem classificeert zakelijk/prive, categorie, leverancier en eventuele klanttoewijzing.
- Wise transacties worden opgehaald.
- Stripe verkoopfacturen worden opgehaald.
- Matching gebeurt op bedrag, datum, leverancier, factuurnummer en IBAN.
- Onzekere matches gaan naar finance review.

Maak in fase 1 geen volledig boekhoudpakket. Maak een cockpit die exact laat zien wat betaald is, wat openstaat, waar cash naartoe gaat en welke kosten aan welke klant hangen.

### Usage en marge

Per klant moet zichtbaar zijn:

- Telnyx kosten
- ElevenLabs kosten
- Supabase kosten
- LLM kosten
- Hosting/infrastructuurkosten
- Overige automatiseringstools
- Verkoopprijs
- MRR
- Eenmalige setup fee
- Brutomarge
- Margepercentage
- Verbruikstrend
- Klanten die onder de margegrens komen

### Abonnementenbeheer

Per abonnement:

- Naam
- Leverancier
- Bedrag
- Frequentie
- Type: software, infrastructuur, marketing, finance, personeel, privé
- Zakelijk of privé
- Betaalmethode
- Verantwoordelijke eigenaar
- Klanten waar het abonnement aan toegerekend wordt
- Opzegdatum of renewal date
- Nut-score: essentieel, handig, twijfel, schrappen

### Extra ideale situaties

- Automatische maandafsluiting met afwijkingen.
- AI-finance-agent die uitlegt waarom marge stijgt of daalt.
- Burn-rate en runway dashboard.
- Klantprijzen vergelijken met werkelijke kosten.
- Alert wanneer usage sneller stijgt dan omzet.
- Automatische winst/verlies per klant.
- Overzicht van abonnementen die dubbel, ongebruikt of te duur zijn.
- Prive/zakelijk split met maandelijkse controlelijst.
- Wekelijkse finance digest: cashpositie, komende betalingen, openstaande facturen en marge-alerts.
- Automatische "prijs moet omhoog" signalen wanneer usage structureel te hoog wordt.

## Sales

### Bestaande basis

Het bestaande project `sales-dashboard` wordt gekoppeld als sales-module. Deze meet al:

- Setters
- Closers
- Ingelogde tijd
- Calls
- Beantwoorde gesprekken
- No-shows
- Stage bewegingen
- Bingo's
- Deals gewonnen/verloren
- Transcripties en AI coaching

### Doorontwikkeling

Toevoegen:

- Lead source attribution.
- CAC per kanaal.
- Pipeline value per fase.
- Conversie per setter, closer, bron en aanbod.
- Snelheid van lead naar call.
- Snelheid van call naar deal.
- Lost reason analyse.
- Follow-up discipline.
- Forecast voor komende 30/60/90 dagen.
- Revenue target tracker richting 1 miljoen.
- AI sales coach per call, per persoon en per week.
- Deal quality score: past deze klant bij Autopilots?

### Extra ideale situaties

- Automatische dagstart voor sales: wie moet vandaag gebeld worden?
- AI follow-up schrijver op basis van call transcript.
- Churn-risk check al voor de sale: slechte fit vroeg herkennen.
- Commissie-overzicht per setter/closer.
- Leaderboard met kwaliteit, niet alleen volume.
- Automatische waarschuwing bij pipeline-stilstand.
- Automatische overdracht naar delivery na closed-won met aanbod, prijs, beloftes en scope.
- Sales-to-delivery gap check: alles wat verkocht is moet als taak of milestone bestaan.

## Marketing

### Accounts en onderscheid

Koppel persoonlijke en zakelijke accounts apart:

- LinkedIn persoonlijk
- LinkedIn bedrijf
- Instagram persoonlijk
- Instagram bedrijf
- Facebook persoonlijk/bedrijf
- TikTok persoonlijk/bedrijf
- YouTube persoonlijk/bedrijf

Elk account krijgt:

- Eigenaar
- Kanaal
- Type: persoonlijk of zakelijk
- Doelgroep
- Contentpijler
- Frequentie
- Link met campagnes en leads

### Marketing-dashboard

Toon:

- Dagelijks bereik
- Wekelijks bereik
- Maandelijks bereik
- Groei/daling ten opzichte van vorige periode
- Engagement rate
- Volgersgroei
- Clicks
- Leads
- Calls geboekt
- Deals uit marketing
- Beste posts
- Slechtste posts
- Contentpijlers die werken
- Kanaalbijdrage aan omzet

### Post ranking

Elke post krijgt een score op:

- Hook
- Relevantie
- Bewijs
- Duidelijkheid
- CTA
- Engagement
- Leadwaarde
- Conversie naar afspraak
- Herbruikbaarheid

De AI-agent legt uit:

- Waarom deze post werkte.
- Welke doelgroep erop reageerde.
- Welk format herhaald moet worden.
- Welke post herschreven moet worden.
- Welke contentideeën passen bij de huidige markt.

### Marketing AI-agent

Taken:

- Contentideeën maken.
- Hooks testen.
- Posts herschrijven per kanaal.
- Wekelijkse contentplanning maken.
- Winnaars analyseren.
- Nieuwe angles voorstellen.
- Klantcases omzetten naar content.
- Salescalls vertalen naar contentinzichten.

### Extra ideale situaties

- Content calendar gekoppeld aan ClickUp.
- Automatisch ideeen halen uit salescalls, klantvragen en objections.
- Kanaalrapport per founder/teamlid.
- "What to post today" dashboard.
- Campagne attribution: van post naar lead naar closed deal.
- AI ziet welke niche het meest tractie krijgt.
- Content ROI dashboard: welke posts leveren calls, deals en omzet op.
- Founder-led content score per persoon.
- Hergebruikmachine: winnende post wordt automatisch vertaald naar short, carousel, e-mail en sales angle.

## Delivery

### Bron

ClickUp is leidend voor delivery-status. De centrale backend leest delivery-data uit ClickUp en koppelt deze aan de klantkaart.

### Delivery-dashboard

Toon per klant:

- Projectfase
- Taken afgerond
- Taken open
- Taken geblokkeerd
- Deadlines
- Verantwoordelijke
- Laatste klantupdate
- Volgende mijlpaal
- Interne risico's
- Scope changes
- Opleverdatum
- Health score

### Klantfase model

Aanbevolen fases:

- Sold
- Kickoff gepland
- Intake compleet
- Technische setup
- Automations in bouw
- Testfase
- Livegang
- Nazorg
- Retainer/optimalisatie
- Upsell-ready

### Extra ideale situaties

- Automatische klantupdate op basis van ClickUp voortgang.
- Delivery bottleneck dashboard.
- Capaciteit per teamlid.
- Klanten zonder update in de laatste 7 dagen.
- Scope creep detectie.
- Automatische overdracht van sales naar delivery.
- Checklist per producttype: voice agent, chat agent, follow-up agent, planning agent.
- Margin guardrail: delivery ziet wanneer extra werk marge opeet.
- Klanttevredenheidspulse na belangrijke milestones.

## Operations

### Klantenmap

Iedere klant krijgt automatisch een digitale klantenmap met:

- Bedrijfsgegevens
- Contactpersonen
- Alle e-mails van gekoppelde domeinen
- Afspraken
- Meeting transcripties
- Read AI samenvattingen
- GHL conversaties
- ClickUp taken
- Stripe facturen
- Wise betalingen
- Contracten
- Verwerkersovereenkomst
- Algemene voorwaarden
- Links
- Bestanden
- Interne notities

### Synchronisatie

Regels:

- Alles met een bekend klantdomein wordt automatisch gekoppeld.
- Stripe invoices worden gekoppeld via Stripe customer, e-mail en domein.
- GHL documenten worden gekoppeld via contact/company.
- Read AI meetings worden gekoppeld via deelnemersdomeinen.
- Mails worden gekoppeld via afzender, ontvanger en domein.
- Bij twijfel komt het item in een review inbox.

### Operations-dashboard

Toon:

- Klanten zonder compleet dossier.
- Klanten zonder verwerkersovereenkomst.
- Klanten zonder algemene voorwaarden.
- Klanten zonder recente communicatie.
- Klanten met openstaande acties.
- Klanten met risico op vertraging.
- Klanten met onduidelijke eigenaarschap.
- Belangrijke links per klant.

### Extra ideale situaties

- AI klantbriefing: "wat speelt er bij deze klant?"
- Automatische meeting samenvatting naar klantkaart.
- Automatische actiepunten uit meetings naar ClickUp.
- Contract-completeness score.
- Zoekfunctie over alle klantcommunicatie.
- Timeline per klant van sale tot nu.
- Alerts wanneer beloftes uit salescalls nog niet in ClickUp staan.
- Centrale zoekfunctie over klant, document, mail, transcriptie, taak en factuur.
- "Laatste 10 gebeurtenissen" per klant voor snelle context.

## Personeel

### Team-dashboard

Toon per medewerker/freelancer:

- Rol
- Actieve klanten
- ClickUp activiteit
- GoHighLevel activiteit
- Taken afgerond
- Taken te laat
- Gemiddelde reactietijd
- Loginfrequentie
- Productieve dagen
- Capaciteitsbelasting
- Documentstatus
- Contractstatus

### Freelancer-flow

Wanneer een freelancer in GoHighLevel wordt aangemaakt in de freelancer pipeline:

- Contact wordt automatisch aangemaakt in de centrale database.
- Profiel wordt aangevuld.
- Freelance overeenkomst wordt opgeslagen.
- Verwerkersovereenkomst wordt opgeslagen.
- Status wordt gekoppeld aan onboardingfase.
- Rechten/checklists worden geactiveerd.

### Productiviteit meten zonder ruis

Niet alleen sturen op "hoe vaak ingelogd", maar combineren:

- Heeft iemand ingelogd?
- Zijn taken vooruit gegaan?
- Zijn deadlines gehaald?
- Is er klantimpact?
- Zijn updates duidelijk?
- Zijn blokkades gemeld?
- Hoeveel werk is opnieuw gedaan?

### Extra ideale situaties

- Capaciteitsplanning per week.
- Freelancer scorecard.
- Automatische onboarding checklist.
- Documenten die verlopen of ontbreken.
- Interne AI-coach voor prioriteiten.
- Team pulse: overbelasting, onderbelasting, bottlenecks.
- Kosten per teamlid versus klantmarge.
- Kwaliteitsscore op output, niet alleen activiteit.
- Automatische waarschuwing wanneer iemand veel taken heeft maar weinig afrondt.

## Management cockpit

De eigenaar/directie heeft 1 cockpit met:

- MRR
- Setup omzet
- Cash in
- Cash out
- Openstaande facturen
- Brutomarge
- Netto marge
- Pipeline forecast
- Delivery capaciteit
- Klantgezondheid
- Teamproductiviteit
- Marketinggroei
- Salesconversie
- Churn risico
- Top 5 kansen
- Top 5 risico's

De belangrijkste vraag van dit dashboard:

"Wat moet vandaag aandacht krijgen om gezond door te groeien?"

### Eerste 8 CEO-kerncijfers

De eerste versie van de CEO cockpit moet niet 40 cijfers tonen. Begin met 8 cijfers die echt sturen.

- Cashpositie: beschikbaar saldo plus verwachte inkomende betalingen.
- Openstaande facturen: totaalbedrag en aantal dagen te laat.
- MRR: huidige maandelijkse terugkerende omzet.
- Nieuwe sales deze maand: closed-won omzet en setup fees.
- Pipeline forecast: gewogen omzet voor de komende 30 dagen.
- Gemiddelde brutomarge per actieve klant.
- Delivery risk: aantal klanten met deadline-, scope- of communicatie-risico.
- Klantgezondheid: aantal groene, oranje en rode klanten.

Pas als deze 8 betrouwbaar zijn, wordt het dashboard uitgebreid.

### CEO weekrapport

Elke maandagochtend moet het systeem automatisch een korte briefing kunnen maken:

- Wat is er vorige week verkocht?
- Wat is er gefactureerd en betaald?
- Welke klanten zijn verliesgevend of risicovol?
- Welke projecten lopen achter?
- Welke teamleden zitten vol?
- Welke marketingkanalen groeien?
- Welke deals moeten aandacht krijgen?
- Welke 5 beslissingen zijn deze week het belangrijkst?

Dit rapport moet bronlinks bevatten naar klanten, facturen, calls, ClickUp-taken en posts.

## AI-agents in het systeem

Aanbevolen agents:

- Finance agent: facturen, matching, cashflow, marge, abonnementen.
- Sales coach agent: calls, follow-ups, objections, dealkwaliteit.
- Marketing strategist agent: content, bereik, ranking, ideeen.
- Delivery PM agent: voortgang, blokkades, klantupdates.
- Operations librarian agent: documenten, transcripties, klantdossiers.
- Team performance agent: capaciteit, productiviteit, risico's.
- CEO agent: wekelijkse samenvatting met beslissingen en prioriteiten.

Elke agent moet acties loggen in `ai_agent_logs`, inclusief brondata en confidence score.

### AI-regels

AI mag adviseren, samenvatten en classificeren. AI mag niet stilletjes definitieve financiele of juridische beslissingen nemen.

AI mag automatisch:

- Samenvattingen maken.
- Conceptacties voorstellen.
- Facturen classificeren.
- Risico's signaleren.
- Follow-ups en updates schrijven.
- Contentideeen maken.

AI vereist review voor:

- Betaling markeren als definitief afgeboekt wanneer match onzeker is.
- Klantdossier juridisch compleet verklaren.
- Personeelsscore definitief beoordelen.
- Contracten interpreteren.
- Prive/zakelijk kosten definitief labelen bij twijfel.

## Rollen en rechten

Aanbevolen rollen:

- Admin: alles.
- Finance: administratie, betalingen, facturen, abonnementen.
- Sales manager: sales, pipeline, calls, coaching.
- Marketing: marketingaccounts, posts, analytics.
- Delivery manager: klanten, projecten, milestones.
- Operations: documenten, klantmappen, compliance.
- Team member: eigen taken, eigen klanten, beperkte klantdata.
- Freelancer: alleen toegewezen klanten en eigen documenten.

### Privacy en gevoelige data

Omdat dit systeem klantdata, personeelsdata, facturen en transcripties bevat:

- Gebruik role-based access vanaf de eerste versie.
- Toon privekosten alleen aan admin/finance.
- Toon personeelsproductiviteit alleen aan management en de persoon zelf waar passend.
- Sla transcripties en documenten centraal op, maar beperk toegang per klant/rol.
- Log elke download of gevoelige weergave.
- Maak exports mogelijk per klant voor dossiercontrole.

## Prioriteit en bouwvolgorde

### Fase 0: ontwerp en inventarisatie

- Per tool bepalen welke data beschikbaar is.
- Per tool bepalen of sync via API, webhook, export of e-mail nodig is.
- Veldenlijst maken per dashboard.
- Rollen en rechten vastleggen.
- Exacte klantmatch-regels bepalen.

Niet overslaan. Dit voorkomt drie weken bouwen op aannames.

### Integratie-volgorde

Niet elke koppeling is even belangrijk of even makkelijk. Bouw in deze volgorde:

- Eerst: Stripe, GHL, ClickUp en handmatige klantdomeinen.
- Daarna: Gmail facturen en documenten.
- Daarna: Wise transacties.
- Daarna: Read AI.
- Daarna: usage-bronnen zoals Telnyx, ElevenLabs, Supabase en LLM-providers.
- Daarna: marketingkanalen.
- Daarna: personeelsactiviteit en freelancer-flow.

Waarom deze volgorde:

- Stripe, GHL en ClickUp bepalen omzet, sales en delivery.
- Gmail en Wise maken finance bruikbaar.
- Read AI en usage maken klantmarge en dossierkwaliteit scherper.
- Marketing en personeel zijn waardevol, maar pas echt betrouwbaar wanneer klant- en omzetdata al goed staat.

### Fase 1: centrale klantkaart en OS-shell

- Supabase datamodel uitbreiden.
- Companies, contacts, domains en documents opzetten.
- Sales-dashboard koppelen aan centrale klantdata.
- Handmatige klantkaart UI maken.
- Centrale navigatie maken: CEO, Finance, Sales, Marketing, Delivery, Operations, Team.
- Login en rollen toevoegen.
- `sync_runs`, `raw_imports`, `review_items` en `audit_log` toevoegen.

### Fase 2: finance en facturen

- Stripe import.
- Gmail inkomende facturen.
- Wise transacties.
- Matching en review inbox.
- Administratie-dashboard.
- Zakelijk/prive classificatie.
- Abonnementenoverzicht.

### Fase 3: sales inbouwen en overdracht strak maken

- Bestaande sales-dashboard als module toevoegen.
- Deals koppelen aan klantkaart.
- Closed-won overdracht naar delivery.
- Verkochte scope, prijs en beloftes opslaan.
- Pipeline forecast naar CEO cockpit.

### Fase 4: operations klantenmap

- Read AI transcripties.
- GHL documenten.
- Domein-gebaseerde mailkoppeling.
- Klanttimeline.
- Contractstatus.

### Fase 5: delivery

- ClickUp sync.
- Delivery-dashboard.
- Milestones.
- Automatische klantupdates.
- Delivery-risk review inbox.

### Fase 6: usage en marge

- Telnyx, ElevenLabs, Supabase en LLM usage importeren.
- Usage aan klant koppelen.
- Marge-dashboard.
- Alerts bij verliesgevende klanten.

### Fase 7: marketing

- Social account sync.
- Content ranking.
- Marketing AI-agent.
- Post naar lead naar deal attribution.

### Fase 8: personeel

- Team activity.
- Freelancer onboarding.
- Documenten en contracten.
- Capaciteit en productiviteit.

### Fase 9: CEO cockpit

- Alle afdelingsdata samenbrengen.
- Wekelijkse AI management briefing.
- Prioriteiten, risico's en kansen.

## Beslisregels

Belangrijke regels om het systeem professioneel te houden:

- Geen data zonder eigenaar.
- Geen automatische match zonder confidence score.
- Elke AI-inschatting moet handmatig corrigeerbaar zijn.
- Stripe is leidend voor verkoopfacturen.
- Wise is leidend voor betaalstatus.
- ClickUp is leidend voor delivery-status.
- GHL is leidend voor klantcontact en CRM-status.
- Supabase is leidend als centrale bedrijfsdatabase.
- Klantdomein is de primaire sleutel voor klantdossiers.
- Ruwe data wordt bewaard, maar dashboards tonen opgeschoonde data.
- Elke automatische actie moet terug te draaien zijn.
- Liever 80% automatisch met review dan 100% automatisch met stille fouten.
- Eerst geld, klanten en delivery inzichtelijk. Daarna marketing en personeel verdiepen.

## Wat niet in de eerste versie moet

Deze dingen zijn waardevol, maar te zwaar voor de eerste versie:

- Volledige boekhouding vervangen.
- Alle social platforms direct volledig automatiseren.
- Personeel te hard beoordelen op loginactiviteit.
- AI zelfstandig juridische conclusies laten trekken.
- Ieder abonnement automatisch aan klanten verdelen zonder review.
- Een volledig datawarehouse bouwen voordat de eerste dashboards werken.

De eerste versie moet vooral grip geven op omzet, cash, klantdossiers, delivery en marge.

## Eerste concrete bouwticket

Breid `sales-dashboard` uit naar `autopilots-os`, zodat de bestaande salesbasis niet verloren gaat.

Start met:

- Login en rollen.
- Centrale navigatie: CEO, Finance, Sales, Marketing, Delivery, Operations, Team.
- Database-tabellen voor companies, contacts, domains, documents, invoices, integrations, sync runs, raw imports, review items en audit log.
- Klantenoverzicht.
- Klantdetailpagina.
- Finance review inbox.
- Sales-dashboard als ingebouwde module.

Daarna pas de koppelingen stuk voor stuk live maken.

## Eerste MVP-schermenset

De eerste bruikbare versie heeft deze schermen:

- Login.
- CEO overzicht met 8 kerncijfers.
- Klantenlijst.
- Klantdetail met timeline, facturen, documenten, delivery en notes.
- Finance dashboard.
- Finance review inbox.
- Sales dashboard.
- Integratie statuspagina.
- Instellingen voor domeinen, teams en matchingregels.

Alles daarbuiten is fase 2 of later.

## 30-dagen MVP

Een praktische eerste maand ziet er zo uit:

Week 1:

- Datamodel maken.
- Login en rollen maken.
- Centrale OS-layout maken.
- Klantenlijst en klantdetail maken.
- Handmatig klantdomeinen kunnen toevoegen.

Week 2:

- Bestaande sales-dashboard inbouwen.
- GHL klant- en dealdata koppelen.
- Stripe klanten en verkoopfacturen importeren.
- Eerste CEO-kerncijfers tonen.

Week 3:

- Finance review inbox maken.
- Gmail facturen importeren.
- Documenten opslaan bij klanten.
- Matching ladder toepassen.

Week 4:

- ClickUp delivery-status koppelen.
- Klanttimeline maken.
- Integratie statuspagina maken.
- Eerste CEO weekrapport genereren.

Na 30 dagen moet het systeem minimaal antwoord geven op:

- Welke klanten hebben we?
- Wat betalen ze?
- Welke facturen staan open?
- Wat is de status van sales en delivery?
- Welke klantdossiers zijn incompleet?
- Waar zit deze week het grootste risico?

## Belangrijkste risico's

- Te veel koppelingen tegelijk willen bouwen.
- Dashboards bouwen voordat de datakwaliteit klopt.
- Personeel meten op activiteit in plaats van output.
- Social analytics overschatten voordat attribution naar sales werkt.
- Automatisch matchen zonder review-laag.
- Usage-kosten niet goed aan klanten kunnen toewijzen.
- Prive en zakelijk mengen zonder duidelijke rechten.

De praktische regel: eerst betrouwbare kernprocessen, daarna slimme automatisering.
