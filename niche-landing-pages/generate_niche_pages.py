from __future__ import annotations

import base64
import html
import json
import mimetypes
import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "vastgoedbeheer-landing-page" / "autopilots-vastgoedbeheer-landing-embed.html"
OUT_ROOT = ROOT / "niche-landing-pages"
COMPACT_ASSETS = ROOT / "vastgoedbeheer-landing-page" / "assets-ghl"


NICHES = [
    {
        "slug": "dakdekkers",
        "name": "Dakdekkers",
        "proof": "Dakdekkers",
        "hero": "24/7 bereikbaar voor lekkages. <span class=\"ap-accent\">Zonder je ploeg te onderbreken.</span>",
        "lead": "Een AI dakassistent neemt stormschade, lekkages, offerteaanvragen en onderhoudsvragen direct op. Je team houdt de handen vrij voor inspecties, veiligheid en uitvoering op het dak.",
        "channels": ["Telefoon", "WhatsApp", "Websitechat", "E-mail", "Agenda"],
        "conversation_title": "Klant meldt daklekkage.",
        "conversation_intro": "Kies een land en bekijk hoe dezelfde intake in de taal van de klant verloopt.",
        "chat": {
            "tenant": "Er komt water langs de dakkapel naar binnen.",
            "agent": "Ik help u direct. Is het lek actief en kunt u veilig aangeven of het om plat dak, pannendak of dakkapel gaat?",
            "tenant2": "Het drupt nog. Het is een dakkapel aan de achterzijde, adres Parklaan 18.",
            "agent2": "Dank u. Ik zet dit als spoedlekkage door en vraag direct foto's van binnen en buiten op.",
            "title": "Actie in dakflow",
            "result": "Spoed: daklekkage. Type: dakkapel achterzijde. Adres: Parklaan 18. Team ontvangt foto's, urgentie en terugbelprioriteit.",
        },
        "problem_intro": "Piekdruk ontstaat zodra het regent, stormt of vriest. Juist dan zitten je dakdekkers op het dak en kan niemand rustig intake doen.",
        "problems": [
            ["Stormdagen trekken de lijn vol", "Na harde wind komen lekkages, losliggende pannen en spoedvragen tegelijk binnen."],
            ["Foto's en daktype ontbreken", "Zonder goede intake rijdt je ploeg soms weg met te weinig materiaal of verkeerde prioriteit."],
            ["Offertes blijven liggen", "Nieuwe aanvragen verdwijnen tussen spoedmeldingen, terwijl de concurrent wel direct reageert."],
            ["Veilig werken vraagt focus", "Dakdekkers kunnen niet continu opnemen terwijl ze op hoogte werken of met branders bezig zijn."],
        ],
        "support_kicker": "Veel tijd gaat niet naar dakwerk",
        "support_title": "De lekkage-intake kost planning, rust en marge.",
        "support_text": "De AI vraagt daktype, oorzaak, foto's, bereikbaarheid en urgentie uit, zodat je planner direct weet wat eerst moet.",
        "stats": [["24/7", "bereikbaar bij lekkage"], ["0", "gemiste spoedcalls"], ["15", "talen in intake"]],
        "process": [
            ["Spoedlekkages filteren", "Actieve lekkages, stormschade en gevaarlijke situaties krijgen direct prioriteit."],
            ["Daktype en foto's opvragen", "De AI vraagt pannendak, plat dak, dakkapel, goot of schoorsteen uit met foto-instructies."],
            ["Inspecties plannen", "Beschikbare momenten worden gekoppeld aan regio, ploeg en weersomstandigheden."],
            ["Offertes voorbereiden", "Alle gegevens komen gestructureerd binnen voor snelle calculatie en opvolging."],
        ],
        "fit_kicker": "Voor dakbedrijven die grip willen",
        "fit_title": "Een digitale dakassistent die spoed scheidt van ruis.",
        "fit_text": "Autopilots richt de flow in op daktypes, regio's, ploegen, materiaal, weersituaties en spoedcriteria.",
        "products": [
            ["CHAT", "De 24/7 lekkagebalie", "WhatsApp en websitevragen worden direct uitgevraagd met foto's, daktype en urgentie.", ["Foto's verzamelen", "Daktype bepalen", "Samenvatting naar planning"]],
            ["VOICE", "Altijd opnemen bij storm", "Elke inkomende call wordt opgenomen en echte spoed wordt direct gemarkeerd.", ["Telefonische intake", "Spoedfilter", "Menselijke fallback"]],
            ["PLANNING", "Inspecties zonder heen-en-weer bellen", "De AI plant dakinspecties op basis van regio, ploeg en agenda.", ["Regio checken", "Afspraak bevestigen", "No-shows beperken"]],
            ["COMPLETE", "Van melding naar werkbon", "Voor dakbedrijven die meer aanvragen willen verwerken zonder extra kantooruren.", ["CRM verwerking", "Werkbonvoorbereiding", "Offerte-opvolging"]],
        ],
        "voice": ["Spoedlekkage eerst, offerteaanvraag netjes door.", "De AI vraagt daktype, foto's, veiligheid en urgentie uit voordat je planner belt."],
        "appointment": "Tijdens de afspraak kijken we naar jullie lekkageflow, regio's, ploegen, materiaalvragen en offerteopvolging.",
    },
    {
        "slug": "installatietechniek",
        "name": "Installatietechniek",
        "proof": "Installatietechniek",
        "hero": "24/7 bereikbaar voor storingen. <span class=\"ap-accent\">Zonder extra binnendienst.</span>",
        "lead": "Een AI installatieassistent neemt cv-storingen, warmtepompvragen, onderhoudsverzoeken en offerteaanvragen direct op. Monteurs blijven aan het werk, klanten krijgen direct duidelijkheid.",
        "channels": ["Telefoon", "WhatsApp", "Websitechat", "E-mail", "Agenda"],
        "conversation_title": "Klant meldt cv-storing.",
        "conversation_intro": "Kies een land en bekijk hoe dezelfde storing in de taal van de klant wordt uitgevraagd.",
        "chat": {
            "tenant": "Mijn cv-ketel geeft storing en we hebben geen warm water.",
            "agent": "Ik help u direct. Ziet u een storingscode op de ketel en werkt de verwarming nog?",
            "tenant2": "Code E10. De verwarming doet het ook niet. Adres is Industrieweg 4.",
            "agent2": "Dank u. Ik zet dit als urgente installatiestoring door en voeg de storingscode toe.",
            "title": "Actie in serviceflow",
            "result": "Urgent: cv-storing. Code: E10. Geen warm water en geen verwarming. Team ontvangt storingscode, adres en prioriteit.",
        },
        "problem_intro": "Storingen, onderhoud en offertevragen lopen door elkaar. Zonder goede intake verlies je monteursuren aan terugbellen en verkeerde ritten.",
        "problems": [
            ["Storingscodes komen half binnen", "Zonder merk, type en foutcode kan de planner de juiste monteur of onderdelen niet kiezen."],
            ["Monteurs worden steeds gestoord", "Tijdens installatie of onderhoud gaat de telefoon door met vragen die eerst gefilterd moeten worden."],
            ["Onderhoudsplanning schuift door", "Afspraken, herinneringen en herhaalonderhoud vragen veel handmatige opvolging."],
            ["Offerteaanvragen koelen snel af", "Wie niet snel reageert op warmtepomp, airco of verduurzaming, mist de kans."],
        ],
        "support_kicker": "Veel tijd gaat niet naar techniek",
        "support_title": "De storingsintake kost monteursuren en planning.",
        "support_text": "De AI vraagt merk, type, storingscode, veiligheid, foto's en beschikbaarheid uit voordat je team hoeft te schakelen.",
        "stats": [["24/7", "bereikbaar bij storing"], ["0", "onnodige terugbelrondes"], ["15", "talen in intake"]],
        "process": [
            ["Storingen uitvragen", "Merk, type, foutcode, urgentie en veiligheid worden direct vastgelegd."],
            ["Onderhoud plannen", "De AI plant onderhoudsbezoeken en stuurt bevestigingen en reminders."],
            ["Offertes kwalificeren", "Warmtepomp, airco, cv en laadpaalvragen worden vooraf compleet gemaakt."],
            ["Werkbon voorbereiden", "Alle intakegegevens gaan gestructureerd naar planning of CRM."],
        ],
        "fit_kicker": "Voor installatiebedrijven die grip willen",
        "fit_title": "Een digitale servicecoordinator voor elke storing en aanvraag.",
        "fit_text": "Autopilots richt de flow in op disciplines, storingscodes, servicecontracten, monteursagenda's en spoedcriteria.",
        "products": [
            ["CHAT", "De 24/7 servicebalie", "Vragen via WhatsApp en website worden direct compleet uitgevraagd.", ["Storingscode vragen", "Foto's verzamelen", "Samenvatting naar planning"]],
            ["VOICE", "Geen gemiste storingslijn meer", "De AI neemt elke call op en zet echte spoed direct apart.", ["Telefonische intake", "Spoedfilter", "Menselijke fallback"]],
            ["PLANNING", "Onderhoud strak ingepland", "Afspraken worden gepland op basis van monteur, regio en agenda.", ["Beschikbaarheid checken", "Bevestigingen sturen", "Herinneringen plannen"]],
            ["COMPLETE", "Servicebureau op autopilot", "Voor installatiebedrijven die service, onderhoud en sales willen opschalen.", ["CRM verwerking", "Werkbondata", "Offerte-opvolging"]],
        ],
        "voice": ["Storingscode eerst, monteur gericht op pad.", "De AI vraagt merk, type, foutcode en urgentie uit voordat planning actie neemt."],
        "appointment": "Tijdens de afspraak kijken we naar storingslijnen, servicecontracten, monteursplanning en offerteaanvragen.",
    },
    {
        "slug": "zonnepanelen",
        "name": "Zonnepanelen",
        "proof": "Zonnepanelen",
        "hero": "Meer aanvragen opvolgen. <span class=\"ap-accent\">Zonder salesdrukte.</span>",
        "lead": "Een AI solarassistent kwalificeert offerteaanvragen, storingen, monitoringvragen en onderhoud direct. Zo reageer je snel op serieuze leads en houd je servicevragen beheersbaar.",
        "channels": ["Telefoon", "WhatsApp", "Websitechat", "E-mail", "Agenda"],
        "conversation_title": "Klant vraagt zonnepanelenofferte aan.",
        "conversation_intro": "Kies een land en bekijk hoe dezelfde solar-intake in de taal van de klant verloopt.",
        "chat": {
            "tenant": "Ik wil weten of zonnepanelen interessant zijn voor mijn woning.",
            "agent": "Ik help u graag. Weet u uw jaarverbruik en is het dak schuin of plat?",
            "tenant2": "Ongeveer 4200 kWh per jaar. Het is een schuin dak op het zuiden.",
            "agent2": "Prima. Ik plan een adviesmoment en zet verbruik, dakrichting en daktype klaar.",
            "title": "Actie in solarflow",
            "result": "Lead: zonnepanelen. Verbruik: 4200 kWh. Dak: schuin zuid. Team ontvangt kwalificatie en afspraakvoorstel.",
        },
        "problem_intro": "Solarleads komen vaak in golven binnen. Zonder directe opvolging daalt de conversie en blijft je adviesagenda onnodig leeg.",
        "problems": [
            ["Leads verwachten direct reactie", "Bij subsidie, saldering of energieprijzen vergelijken klanten meerdere aanbieders tegelijk."],
            ["Dakdata ontbreekt", "Zonder verbruik, dakrichting, daktype en meterkastinfo is een offerte nog niet scherp."],
            ["Servicevragen halen sales uit focus", "Omvormerstoringen en monitoringvragen komen tussen nieuwe aanvragen door."],
            ["Adviesgesprekken kosten afstemming", "Beschikbaarheid, adres, verbruik en foto's moeten steeds opnieuw worden opgehaald."],
        ],
        "support_kicker": "Veel tijd gaat niet naar advies",
        "support_title": "Leadopvolging kost snelheid en conversie.",
        "support_text": "De AI vraagt verbruik, daktype, dakrichting, meterkast en planning uit zodat sales alleen warme aanvragen spreekt.",
        "stats": [["24/7", "leadopvolging"], ["0", "koude leads vergeten"], ["15", "talen in intake"]],
        "process": [
            ["Offerteaanvragen kwalificeren", "Verbruik, daktype, dakrichting en motivatie worden vastgelegd."],
            ["Servicevragen scheiden", "Monitoring, omvormer en opbrengstvragen worden apart gerouteerd."],
            ["Adviesgesprekken plannen", "De AI plant adviescalls op basis van echte agenda's."],
            ["Dossier voorbereiden", "Alle data komt klaar te staan voor sales of engineering."],
        ],
        "fit_kicker": "Voor solarbedrijven die sneller willen opvolgen",
        "fit_title": "Een digitale solarassistent die elke aanvraag warm houdt.",
        "fit_text": "Autopilots richt de flow in op verbruik, dakdata, installatietype, regio en adviesagenda.",
        "products": [
            ["CHAT", "De 24/7 solar intake", "Website en WhatsApp leads worden direct gekwalificeerd.", ["Verbruik vragen", "Dakdata verzamelen", "Leadscore naar sales"]],
            ["VOICE", "Elke aanvraag direct opgenomen", "Telefonische leads krijgen meteen intake en afspraakvoorstel.", ["Telefonische intake", "Leadfilter", "Sales fallback"]],
            ["PLANNING", "Adviesgesprekken automatisch gevuld", "De AI plant adviescalls en stuurt bevestigingen.", ["Agenda checken", "Bevestigingen sturen", "No-shows beperken"]],
            ["COMPLETE", "Van lead naar offerteflow", "Voor solarbedrijven die sales willen schalen zonder meer binnendienst.", ["CRM verwerking", "Dossieropbouw", "Offerte-opvolging"]],
        ],
        "voice": ["Warm lead eerst, service apart.", "De AI vraagt verbruik, dakdata en urgentie uit en plant direct een adviesmoment."],
        "appointment": "Tijdens de afspraak kijken we naar leadbronnen, kwalificatievragen, adviesplanning en offerteopvolging.",
    },
]


ADDITIONAL = {
    "kozijnen": ("Kozijnen", "24/7 bereikbaar voor inmeet- en offerteaanvragen.", "Een AI kozijnassistent vraagt materiaal, afmetingen, foto's, HR++/triple glass, montagewens en planning uit.", "Klant wil kozijnen vervangen.", "Offerte-intake kost calculatietijd en opvolging."),
    "evenementen": ("Evenementen", "Elke aanvraag direct opgevolgd, ook buiten kantoortijd.", "Een AI eventassistent kwalificeert datum, locatie, gasten, techniek, catering, budget en draaiboekvragen.", "Klant vraagt eventbeschikbaarheid.", "Aanvraagopvolging kost snelheid en boekingen."),
    "tandartsen": ("Tandartsen", "24/7 bereikbaar voor patienten zonder volle balie.", "Een AI praktijkassistent neemt spoedklachten, afspraken, verzetten, controles en intakevragen direct op.", "Patient meldt kiespijn.", "Baliedruk kost rust en behandelcapaciteit."),
    "makelaars": ("Makelaars", "Meer bezichtigingen plannen zonder meer telefoontjes.", "Een AI makelaarsassistent kwalificeert woningzoekers, verkopers, bezichtigingen en taxatieaanvragen direct.", "Kandidaat wil bezichtigen.", "Bezichtigingsdruk kost snelheid en verkoopkansen."),
    "cosmetische-klinieken": ("Cosmetische klinieken", "Nieuwe consulten direct gekwalificeerd en ingepland.", "Een AI kliniekassistent vraagt behandeling, wens, medische aandachtspunten, budget en consultmoment uit.", "Client vraagt fillerconsult.", "Consultaanvragen kosten opvolging en conversie."),
    "hoveniers": ("Hoveniers", "Aanvragen voor tuinen direct uitgevraagd.", "Een AI hoveniersassistent kwalificeert aanleg, onderhoud, snoeiwerk, oppervlak, foto's, budget en planning.", "Klant wil tuinrenovatie.", "Offerte-intake kost avonden en planningsrust."),
    "vloerenleggers": ("Vloerenleggers", "Meer vloerprojecten opvolgen zonder extra kantooruren.", "Een AI vloerassistent vraagt type vloer, m2, ondervloer, planning, foto's en adres uit.", "Klant wil PVC laten leggen.", "Projectintake kost calculatie en planning."),
    "glaszetters": ("Glaszetters", "Direct bereikbaar bij glasschade en HR++ aanvragen.", "Een AI glasassistent vraagt type breuk, afmeting, veiligheid, foto's, verzekeraar en planning uit.", "Klant meldt ruitschade.", "Spoed en offertevragen lopen door elkaar."),
    "hotels": ("Hotels", "24/7 gastvragen en boekingsvragen opgevangen.", "Een AI hotelassistent beantwoordt vragen over kamers, late check-in, parkeren, ontbijt, wijzigingen en groepsaanvragen.", "Gast vraagt late check-in.", "Gastvragen kosten receptietijd en reviews."),
    "restaurants": ("Restaurants", "Reserveringen en gastvragen direct geregeld.", "Een AI restaurantassistent neemt reserveringen, allergievragen, groepsaanvragen, openingstijden en wijzigingen op.", "Gast wil reserveren met allergie.", "Telefoontjes halen service uit de zaak."),
    "autobedrijven": ("Autobedrijven", "Werkplaats en verkoop direct bereikbaar.", "Een AI autoassistent plant onderhoud, proefritten, APK, schade-intake en verkoopvragen.", "Klant wil proefrit plannen.", "Werkplaatsplanning kost telefoontijd en omzet."),
    "kapperszaken": ("Kapperszaken", "Afspraken automatisch gevuld zonder telefoonstress.", "Een AI salonassistent plant knip-, kleur- en behandelafspraken en vraagt voorkeuren uit.", "Klant wil kleurbehandeling plannen.", "Afspraken en wijzigingen kosten salontijd."),
    "woningcorporaties": ("Woningcorporaties", "24/7 bereikbaar voor huurdersmeldingen.", "Een AI corporatieassistent vangt reparatieverzoeken, leefbaarheidsmeldingen, huurvragen en afspraken op.", "Huurder meldt lekkage.", "Meldingen kosten bereikbaarheid en bewonersrust."),
    "verzekeraars": ("Verzekeraars", "Claims sneller compleet en correct binnen.", "Een AI claimassistent vraagt polis, schadeoorzaak, datum, foto's, urgentie en vervolgvragen uit.", "Klant meldt waterschadeclaim.", "Claimintake kost dossierkwaliteit en snelheid."),
    "non-profit": ("Non-profit", "Donateurs, vrijwilligers en hulpvragen direct geholpen.", "Een AI non-profit assistent beantwoordt vragen, kwalificeert aanmeldingen en routeert urgente hulpvragen.", "Vrijwilliger wil zich aanmelden.", "Opvolging kost impact en betrokkenheid."),
    "dierenverzorging": ("Dierenverzorging", "Afspraken en klantvragen direct geregeld.", "Een AI verzorgingsassistent plant trim-, opvang- en verzorgingsafspraken en vraagt ras, gedrag en wensen uit.", "Klant wil trimafspraak.", "Planning kost rust in de salon."),
    "dierenarts": ("Dierenarts", "Triage en afspraken zonder overvolle balie.", "Een AI dierenartsassistent vraagt diersoort, klachten, urgentie, medicatie en afspraakwens uit.", "Eigenaar meldt spoedklacht.", "Telefonische triage kost aandacht en snelheid."),
}


CHAT_SCENARIOS = {
    "kozijnen": {
        "tenant": "Ik wil drie houten kozijnen laten vervangen door kunststof.",
        "agent": "Ik help u direct. Gaat het om begane grond of verdieping, en heeft u ongeveer de afmetingen of foto's?",
        "tenant2": "Begane grond aan de voorzijde. Ik heb foto's en wil graag HR++ glas.",
        "agent2": "Dank u. Ik zet dit klaar als inmeet- en offerteaanvraag met materiaal, glaswens en foto's.",
        "title": "Actie in kozijnflow",
        "result": "Offerte: kunststof kozijnen met HR++ glas. Locatie: voorzijde begane grond. Team ontvangt foto's en inmeetverzoek.",
    },
    "evenementen": {
        "tenant": "We willen een bedrijfsfeest organiseren voor ongeveer 120 personen.",
        "agent": "Ik help graag. Heeft u al een datum, locatie en wensen voor catering, techniek of entertainment?",
        "tenant2": "Vrijdag 14 november, regio Utrecht. We zoeken locatie, DJ en borrelhapjes.",
        "agent2": "Prima. Ik zet capaciteit, datum, regio en leverancierswensen klaar voor opvolging.",
        "title": "Actie in eventflow",
        "result": "Aanvraag: bedrijfsfeest 120 personen. Datum: 14 november. Regio: Utrecht. Wensen: locatie, DJ, borrelhapjes.",
    },
    "tandartsen": {
        "tenant": "Ik heb sinds vannacht hevige kiespijn linksboven.",
        "agent": "Dat is vervelend. Heeft u zwelling, koorts of pijn bij dichtbijten?",
        "tenant2": "Geen koorts, wel kloppende pijn en ik kan nauwelijks eten.",
        "agent2": "Dank u. Ik markeer dit als spoedklacht en kijk naar de eerste beschikbare plek.",
        "title": "Actie in praktijkflow",
        "result": "Spoed: hevige kiespijn linksboven. Geen koorts, wel kloppende pijn. Balie ontvangt triage en afspraakprioriteit.",
    },
    "makelaars": {
        "tenant": "Ik wil de woning aan de Lindenlaan 8 graag bezichtigen.",
        "agent": "Ik help u direct. Koopt u voor eigen bewoning en heeft u al een financieringsindicatie?",
        "tenant2": "Ja, eigen bewoning. Mijn hypotheekadviseur heeft tot 475.000 euro bevestigd.",
        "agent2": "Prima. Ik zet u als gekwalificeerde bezichtiger klaar en plan een beschikbaar moment.",
        "title": "Actie in makelaarsflow",
        "result": "Bezichtiging: Lindenlaan 8. Kandidaat: eigen bewoning, financieringsindicatie 475.000. Team ontvangt afspraakvoorstel.",
    },
    "cosmetische-klinieken": {
        "tenant": "Ik wil graag advies over fillers voor mijn kaaklijn.",
        "agent": "Ik help u graag. Heeft u eerder fillers gehad en gebruikt u medicatie of bloedverdunners?",
        "tenant2": "Nog nooit fillers gehad en geen medicatie. Ik wil eerst een consult.",
        "agent2": "Dank u. Ik zet dit klaar als eerste consult voor kaaklijnadvies.",
        "title": "Actie in kliniekflow",
        "result": "Consult: kaaklijn fillers. Nieuwe client, geen medicatie gemeld. Team ontvangt intake en consultwens.",
    },
    "hoveniers": {
        "tenant": "Onze achtertuin moet volledig opnieuw worden aangelegd.",
        "agent": "Ik denk graag mee. Hoe groot is de tuin ongeveer en gaat het om ontwerp, bestrating, beplanting of onderhoud?",
        "tenant2": "Ongeveer 80 m2. We willen bestrating, borders en een overkapping.",
        "agent2": "Mooi. Ik zet dit klaar als tuinrenovatie met oppervlak en wensen.",
        "title": "Actie in hoveniersflow",
        "result": "Aanvraag: tuinrenovatie 80 m2. Wensen: bestrating, borders, overkapping. Team ontvangt projectintake.",
    },
    "vloerenleggers": {
        "tenant": "Ik wil PVC laten leggen in de woonkamer en keuken.",
        "agent": "Ik help u direct. Om hoeveel vierkante meter gaat het en ligt er nu nog een vloer?",
        "tenant2": "Ongeveer 55 m2. Er ligt laminaat dat eruit moet.",
        "agent2": "Dank u. Ik zet dit klaar met m2, verwijderwerk en type vloer.",
        "title": "Actie in vloerflow",
        "result": "Offerte: PVC leggen 55 m2. Bestaande vloer: laminaat verwijderen. Team ontvangt projectdetails.",
    },
    "glaszetters": {
        "tenant": "Er is een ruit gebroken in de achterdeur.",
        "agent": "Ik help u direct. Is het glas enkel, dubbel of veiligheidsglas en is de woning nog veilig afsluitbaar?",
        "tenant2": "Dubbel glas, ongeveer 70 bij 180 cm. De deur kan nog dicht.",
        "agent2": "Dank u. Ik zet dit als glasschade door met afmeting, type glas en veiligheidssituatie.",
        "title": "Actie in glasflow",
        "result": "Glasschade: achterdeur, dubbel glas, 70x180 cm. Woning afsluitbaar. Team ontvangt vervangingsverzoek.",
    },
    "hotels": {
        "tenant": "Wij komen vanavond laat aan, rond 23:45.",
        "agent": "Geen probleem. Op welke naam staat de reservering en wilt u parkeren bij het hotel?",
        "tenant2": "Reservering op De Vries. We hebben ook een parkeerplek nodig.",
        "agent2": "Dank u. Ik zet late check-in en parkeerwens klaar voor de receptie.",
        "title": "Actie in hotelflow",
        "result": "Gastvraag: late check-in 23:45. Reservering: De Vries. Extra: parkeerplek. Receptie ontvangt melding.",
    },
    "restaurants": {
        "tenant": "Ik wil zaterdag reserveren voor zes personen, waarvan een met notenallergie.",
        "agent": "Ik help graag. Hoe laat wilt u komen en gaat het om diner of lunch?",
        "tenant2": "Diner om 19:30. De allergie is serieus.",
        "agent2": "Dank u. Ik zet de reservering en allergienotitie klaar voor het team.",
        "title": "Actie in restaurantflow",
        "result": "Reservering: zaterdag 19:30, 6 personen. Allergie: noten, serieus. Team ontvangt keukenmelding.",
    },
    "autobedrijven": {
        "tenant": "Ik wil graag een proefrit plannen met de Volkswagen Golf uit jullie voorraad.",
        "agent": "Ik help u direct. Wanneer wilt u komen en heeft u een geldig rijbewijs?",
        "tenant2": "Donderdagmiddag rond 15:00. Ja, ik heb een rijbewijs.",
        "agent2": "Prima. Ik zet de proefrit klaar en laat verkoop de beschikbaarheid bevestigen.",
        "title": "Actie in autobedrijvenflow",
        "result": "Proefrit: Volkswagen Golf. Voorkeur: donderdag 15:00. Rijbewijs bevestigd. Sales ontvangt afspraakverzoek.",
    },
    "kapperszaken": {
        "tenant": "Ik wil mijn haar laten kleuren en knippen.",
        "agent": "Ik help u graag. Gaat het om uitgroei, highlights of een volledige kleurbehandeling?",
        "tenant2": "Highlights en puntjes knippen. Mijn haar is schouderlengte.",
        "agent2": "Dank u. Ik plan voldoende behandeltijd en zet de wensen klaar voor de stylist.",
        "title": "Actie in salonflow",
        "result": "Afspraak: highlights en knippen. Haarlengte: schouderlengte. Team ontvangt behandeltijd en voorkeur.",
    },
    "woningcorporaties": {
        "tenant": "Mijn verwarming doet het niet en ik heb kleine kinderen thuis.",
        "agent": "Ik help u direct. Werkt de verwarming helemaal niet en heeft u ook geen warm water?",
        "tenant2": "Geen verwarming, warm water werkt nog wel. Adres is Esdoornstraat 12.",
        "agent2": "Dank u. Ik zet dit door als urgente verwarmingsmelding met gezinssituatie.",
        "title": "Actie in corporatieflow",
        "result": "Urgent: verwarming defect. Warm water werkt. Gezin met kleine kinderen. Reparatieteam ontvangt prioriteit.",
    },
    "verzekeraars": {
        "tenant": "Ik wil waterschade melden na lekkage bij de bovenburen.",
        "agent": "Ik help u direct. Wanneer is de schade ontstaan en heeft u foto's van plafond, vloer of muren?",
        "tenant2": "Gisterenavond. Ik heb foto's van het plafond en de vloer.",
        "agent2": "Dank u. Ik zet de claim klaar met oorzaak, datum en fotobewijs.",
        "title": "Actie in claimflow",
        "result": "Claim: waterschade door bovenburen. Datum: gisterenavond. Bewijs: foto's plafond en vloer. Dossier wordt voorbereid.",
    },
    "non-profit": {
        "tenant": "Ik wil me aanmelden als vrijwilliger voor de voedselactie.",
        "agent": "Wat mooi. Welke dagen bent u beschikbaar en heeft u voorkeur voor sorteren, bezorgen of uitgifte?",
        "tenant2": "Woensdagmiddag en zaterdag. Bezorgen lijkt me goed.",
        "agent2": "Dank u. Ik zet uw aanmelding klaar met beschikbaarheid en voorkeurstaak.",
        "title": "Actie in non-profitflow",
        "result": "Vrijwilliger: beschikbaar woensdagmiddag en zaterdag. Voorkeur: bezorgen. Coordinator ontvangt aanmelding.",
    },
    "dierenverzorging": {
        "tenant": "Ik wil mijn labradoodle laten trimmen.",
        "agent": "Ik help u graag. Hoe oud is de hond en wanneer is hij voor het laatst getrimd?",
        "tenant2": "Hij is twee jaar en ongeveer drie maanden geleden getrimd.",
        "agent2": "Prima. Ik zet ras, vachtstatus en afspraakwens klaar.",
        "title": "Actie in verzorgingsflow",
        "result": "Trimafspraak: labradoodle, 2 jaar. Laatste trimbeurt: 3 maanden geleden. Salon ontvangt intake.",
    },
    "dierenarts": {
        "tenant": "Mijn kat eet niet en verstopt zich sinds gisteren.",
        "agent": "Dat is vervelend. Drinkt de kat nog, braakt hij, en hoe oud is hij?",
        "tenant2": "Hij is 9 jaar, drinkt weinig en heeft een keer gebraakt.",
        "agent2": "Dank u. Ik markeer dit als klacht die vandaag beoordeeld moet worden.",
        "title": "Actie in dierenartsflow",
        "result": "Triage: kat 9 jaar, eet niet, drinkt weinig, eenmaal gebraakt. Praktijk ontvangt afspraakprioriteit vandaag.",
    },
}


def expand_additional() -> list[dict]:
    items = []
    for slug, (name, hero_plain, lead, convo_title, support_title) in ADDITIONAL.items():
        sector = name.lower()
        chat = CHAT_SCENARIOS[slug]
        items.append({
            "slug": slug,
            "name": name,
            "proof": name,
            "hero": f"{hero_plain} <span class=\"ap-accent\">Zonder extra bezetting.</span>",
            "lead": lead,
            "channels": ["Telefoon", "WhatsApp", "Websitechat", "E-mail", "Agenda"],
            "conversation_title": convo_title,
            "conversation_intro": "Kies een land en bekijk hoe dezelfde intake in de taal van de klant verloopt.",
            "chat": chat,
            "problem_intro": f"Bij {sector} komen spoedvragen, planning, offertes en herhaalvragen vaak tegelijk binnen. Daardoor gaat commerciële snelheid verloren.",
            "problems": [
                ["Piekmomenten vullen de lijn", "Juist wanneer het team druk is, komen de meeste vragen en wijzigingen binnen."],
                ["Aanvragen zijn niet compleet", "Zonder goede intake ontbreken foto's, planning, budget, locatie of belangrijke details."],
                ["Opvolging blijft liggen", "Nieuwe kansen koelen snel af als niemand direct reageert of doorvraagt."],
                ["Teamfocus verdwijnt", "Medewerkers worden uit uitvoering, verkoop of klantcontact gehaald voor dezelfde vragen."],
            ],
            "support_kicker": "Veel tijd gaat niet naar de kern",
            "support_title": support_title,
            "support_text": "De AI vangt intake, herhaalvragen en planning op, zodat je team tijd houdt voor het werk dat echt waarde maakt.",
            "stats": [["24/7", "bereikbaar voor klanten"], ["0", "gemiste piekmomenten"], ["15", "talen in intake"]],
            "process": [
                ["Aanvragen uitvragen", "De AI vraagt de juiste gegevens uit voordat je team hoeft op te volgen."],
                ["Urgentie bepalen", "Spoed, normale aanvragen en herhaalvragen worden direct gescheiden."],
                ["Afspraken plannen", "Beschikbaarheid wordt gekoppeld aan agenda, regio en type aanvraag."],
                ["Opvolging klaarzetten", "Samenvatting, contactgegevens en vervolgstap staan direct klaar."],
            ],
            "fit_kicker": f"Voor {sector} met groeiplannen",
            "fit_title": f"Een digitale assistent die precies werkt zoals {sector} nodig hebben.",
            "fit_text": f"Autopilots richt de flow in op jullie diensten, planning, urgenties, klantvragen en overdracht.",
            "products": [
                ["CHAT", "De 24/7 klantbalie", "WhatsApp en websitevragen worden direct beantwoord en compleet gemaakt.", ["Aanvragen uitvragen", "Veelgestelde vragen", "Samenvatting naar team"]],
                ["VOICE", "Geen gemiste telefoontjes meer", "Elke inkomende call wordt opgenomen en de juiste urgentie wordt bepaald.", ["Telefonische intake", "Spoedfilter", "Menselijke fallback"]],
                ["PLANNING", "Afspraken strak geregeld", "De AI plant afspraken op basis van echte beschikbaarheid.", ["Agenda checken", "Bevestigingen sturen", "No-shows beperken"]],
                ["COMPLETE", "Je back-office op autopilot", "Voor teams die willen groeien zonder extra administratieve druk.", ["CRM verwerking", "Dossieropbouw", "Opvolging"]],
            ],
            "voice": ["Aanvraag helder, opvolging direct.", "De AI vraagt door, bepaalt urgentie en zet de juiste vervolgstap klaar."],
            "appointment": f"Tijdens de afspraak kijken we naar jullie klantvragen, planning, intakecriteria en overdracht.",
        })
    return items


COUNTRIES = [
    ("nl", "NL", "Netherlands"), ("en", "UK", "United Kingdom"), ("de", "DE", "Germany"),
    ("fr", "FR", "France"), ("es", "ES", "Spain"), ("it", "IT", "Italy"),
    ("pl", "PL", "Poland"), ("tr", "TR", "Turkey"), ("ar", "MA", "Morocco"),
    ("pt", "PT", "Portugal"), ("ro", "RO", "Romania"), ("uk", "UA", "Ukraine"),
    ("zh", "CN", "China"), ("hi", "IN", "India"), ("id", "ID", "Indonesia"),
]

LANG_LABELS = {
    "nl": "Nederlands", "en": "English", "de": "Deutsch", "fr": "Francais", "es": "Espanol",
    "it": "Italiano", "pl": "Polski", "tr": "Turkce", "ar": "Arabic", "pt": "Portugues",
    "ro": "Romana", "uk": "Ukrainian", "zh": "Chinese", "hi": "Hindi", "id": "Indonesia",
}


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def country_menu() -> str:
    return "\n".join(
        f'                <button class="ap-country-option{" is-active" if key == "nl" else ""}" type="button" data-lang="{key}"><span class="ap-country-flag">{flag}</span>{name}</button>'
        for key, flag, name in COUNTRIES
    )


def localized_chat(niche: dict) -> dict:
    nl = niche["chat"]
    data = {"nl": {"label": "Nederlands", **nl}}
    templates = {
        "en": ("English", "I have a request and need quick clarity.", "I can help right away. I will ask the key details and route it to the right team.", "It is needed this week. I can send photos and extra details.", "Thank you. I will prepare the right follow-up and confirmation.", "Action in intake flow", "Request captured with urgency, location, details and follow-up priority."),
        "de": ("Deutsch", "Ich habe eine Anfrage und brauche schnell Klarheit.", "Ich helfe sofort und frage die wichtigsten Details fur das richtige Team ab.", "Es wird diese Woche benotigt. Fotos und Zusatzinfos kann ich senden.", "Danke. Ich bereite die richtige Weitergabe und Bestatigung vor.", "Aktion im Intake-Ablauf", "Anfrage mit Dringlichkeit, Ort, Details und Prioritat erfasst."),
        "fr": ("Francais", "J'ai une demande et je souhaite une reponse rapide.", "Je vous aide tout de suite et collecte les details essentiels.", "C'est necessaire cette semaine. Je peux envoyer des photos.", "Merci. Je prepare le bon suivi et la confirmation.", "Action dans le flux d'accueil", "Demande enregistree avec urgence, lieu, details et priorite."),
        "es": ("Espanol", "Tengo una solicitud y necesito claridad rapidamente.", "Le ayudo ahora y recojo los datos clave.", "Lo necesito esta semana. Puedo enviar fotos y detalles.", "Gracias. Preparare el seguimiento correcto.", "Accion en el flujo de entrada", "Solicitud registrada con urgencia, ubicacion, detalles y prioridad."),
        "it": ("Italiano", "Ho una richiesta e vorrei chiarezza rapidamente.", "La aiuto subito e raccolgo i dettagli principali.", "Serve questa settimana. Posso inviare foto e dettagli.", "Grazie. Preparo il seguito corretto.", "Azione nel flusso di intake", "Richiesta registrata con urgenza, luogo, dettagli e priorita."),
        "pl": ("Polski", "Mam zapytanie i potrzebuje szybkiej odpowiedzi.", "Pomoge od razu i zbiorę najwazniejsze dane.", "Potrzebne w tym tygodniu. Mogę wyslac zdjecia.", "Dziekuje. Przygotuje dalszy krok.", "Akcja w procesie intake", "Zgloszenie zapisane z pilnoscia, lokalizacja i priorytetem."),
        "tr": ("Turkce", "Bir talebim var ve hizli netlik istiyorum.", "Hemen yardim ederim ve temel bilgileri alirim.", "Bu hafta gerekli. Fotograf ve detay gonderebilirim.", "Tesekkurler. Dogru takip adimini hazirliyorum.", "Intake akisinda aksiyon", "Talep aciliyet, konum, detay ve oncelikle kaydedildi."),
        "ar": ("Arabic", "&#1604;&#1583;&#1610; &#1591;&#1604;&#1576; &#1608;&#1571;&#1581;&#1578;&#1575;&#1580; &#1573;&#1604;&#1609; &#1608;&#1590;&#1608;&#1581; &#1587;&#1585;&#1610;&#1593;.", "&#1587;&#1571;&#1587;&#1575;&#1593;&#1583;&#1603; &#1601;&#1608;&#1585;&#1575; &#1608;&#1571;&#1580;&#1605;&#1593; &#1575;&#1604;&#1578;&#1601;&#1575;&#1589;&#1610;&#1604; &#1575;&#1604;&#1605;&#1607;&#1605;&#1577;.", "&#1575;&#1604;&#1571;&#1605;&#1585; &#1605;&#1591;&#1604;&#1608;&#1576; &#1607;&#1584;&#1575; &#1575;&#1604;&#1571;&#1587;&#1576;&#1608;&#1593;. &#1610;&#1605;&#1603;&#1606;&#1606;&#1610; &#1573;&#1585;&#1587;&#1575;&#1604; &#1589;&#1608;&#1585;.", "&#1588;&#1603;&#1585;&#1575;. &#1587;&#1571;&#1580;&#1607;&#1586; &#1582;&#1591;&#1608;&#1577; &#1575;&#1604;&#1605;&#1578;&#1575;&#1576;&#1593;&#1577;.", "&#1573;&#1580;&#1585;&#1575;&#1569; &#1601;&#1610; &#1578;&#1583;&#1601;&#1602; &#1575;&#1604;&#1575;&#1587;&#1578;&#1602;&#1576;&#1575;&#1604;", "&#1578;&#1605; &#1578;&#1587;&#1580;&#1610;&#1604; &#1575;&#1604;&#1591;&#1604;&#1576; &#1605;&#1593; &#1575;&#1604;&#1571;&#1608;&#1604;&#1608;&#1610;&#1577; &#1608;&#1575;&#1604;&#1578;&#1601;&#1575;&#1589;&#1610;&#1604;."),
        "pt": ("Portugues", "Tenho um pedido e preciso de clareza rapidamente.", "Ajudo ja e recolho os dados principais.", "E necessario esta semana. Posso enviar fotos.", "Obrigado. Vou preparar o seguimento correto.", "Acao no fluxo de entrada", "Pedido registado com urgencia, local, detalhes e prioridade."),
        "ro": ("Romana", "Am o solicitare si am nevoie de claritate rapid.", "Va ajut imediat si colectez detaliile esentiale.", "Este necesar saptamana aceasta. Pot trimite fotografii.", "Multumesc. Pregatesc pasul urmator.", "Actiune in fluxul de intake", "Solicitare inregistrata cu urgenta, locatie, detalii si prioritate."),
        "uk": ("Ukrainian", "&#1052;&#1072;&#1102; &#1079;&#1072;&#1087;&#1080;&#1090; &#1110; &#1087;&#1086;&#1090;&#1088;&#1110;&#1073;&#1085;&#1072; &#1096;&#1074;&#1080;&#1076;&#1082;&#1072; &#1103;&#1089;&#1085;&#1110;&#1089;&#1090;&#1100;.", "&#1071; &#1076;&#1086;&#1087;&#1086;&#1084;&#1086;&#1078;&#1091; &#1074;&#1110;&#1076;&#1088;&#1072;&#1079;&#1091; &#1110; &#1079;&#1073;&#1077;&#1088;&#1091; &#1076;&#1077;&#1090;&#1072;&#1083;&#1110;.", "&#1055;&#1086;&#1090;&#1088;&#1110;&#1073;&#1085;&#1086; &#1094;&#1100;&#1086;&#1075;&#1086; &#1090;&#1080;&#1078;&#1085;&#1103;. &#1052;&#1086;&#1078;&#1091; &#1085;&#1072;&#1076;&#1110;&#1089;&#1083;&#1072;&#1090;&#1080; &#1092;&#1086;&#1090;&#1086;.", "&#1044;&#1103;&#1082;&#1091;&#1102;. &#1055;&#1110;&#1076;&#1075;&#1086;&#1090;&#1091;&#1102; &#1085;&#1072;&#1089;&#1090;&#1091;&#1087;&#1085;&#1080;&#1081; &#1082;&#1088;&#1086;&#1082;.", "&#1044;&#1110;&#1103; &#1091; &#1087;&#1088;&#1086;&#1094;&#1077;&#1089;&#1110; intake", "&#1047;&#1072;&#1087;&#1080;&#1090; &#1079;&#1072;&#1092;&#1110;&#1082;&#1089;&#1086;&#1074;&#1072;&#1085;&#1086; &#1079; &#1087;&#1088;&#1110;&#1086;&#1088;&#1080;&#1090;&#1077;&#1090;&#1086;&#1084; &#1110; &#1076;&#1077;&#1090;&#1072;&#1083;&#1103;&#1084;&#1080;."),
        "zh": ("Chinese", "&#25105;&#26377;&#19968;&#20010;&#35831;&#27714;&#65292;&#38656;&#35201;&#24555;&#36895;&#30830;&#35748;&#12290;", "&#25105;&#20250;&#31435;&#21363;&#24110;&#24744;&#25910;&#38598;&#20851;&#38190;&#20449;&#24687;&#12290;", "&#26412;&#21608;&#38656;&#35201;&#12290;&#25105;&#21487;&#20197;&#21457;&#36865;&#29031;&#29255;&#21644;&#35814;&#32454;&#20449;&#24687;&#12290;", "&#35874;&#35874;&#12290;&#25105;&#20250;&#20934;&#22791;&#19979;&#19968;&#27493;&#12290;", "&#27969;&#31243;&#25805;&#20316;", "&#35831;&#27714;&#24050;&#35760;&#24405;&#65292;&#21253;&#21547;&#32039;&#24613;&#31243;&#24230;&#12289;&#20301;&#32622;&#21644;&#35814;&#32454;&#20449;&#24687;&#12290;"),
        "hi": ("Hindi", "&#2350;&#2375;&#2352;&#2366; &#2319;&#2325; &#2309;&#2344;&#2369;&#2352;&#2379;&#2343; &#2361;&#2376; &#2324;&#2352; &#2332;&#2354;&#2381;&#2342;&#2368; &#2360;&#2381;&#2346;&#2359;&#2381;&#2335;&#2340;&#2366; &#2330;&#2366;&#2361;&#2367;&#2319;&#2404;", "&#2350;&#2376;&#2306; &#2340;&#2369;&#2352;&#2306;&#2340; &#2350;&#2342;&#2342; &#2325;&#2352;&#2340;&#2366; &#2361;&#2370;&#2306; &#2324;&#2352; &#2350;&#2369;&#ख्य &#2357;&#2367;&#2357;&#2352;&#ण &#2354;&#2375;&#2340;&#2366; &#2361;&#2370;&#2306;&#2404;", "&#2351;&#2361; &#2311;&#2360; &#2361;&#2347;&#2381;&#2340;&#2375; &#2330;&#2366;&#2361;&#2367;&#ए;&#2404; &#2350;&#2376;&#2306; &#2347;&#2379;&#2335;&#2379; &#2349;&#2375;&#2332; &#2360;&#2325;&#2340;&#2366; &#2361;&#2370;&#2306;&#2404;", "&#2343;&#2344;&#2381;&#2351;&#2357;&#2366;&#2342;&#2404; &#2350;&#2376;&#2306; &#2309;&#2327;&#2354;&#2366; &#2325;&#2342;&#2350; &#2340;&#2376;&#2351;&#2366;&#2352; &#2325;&#2352;&#2340;&#2366; &#2361;&#2370;&#2306;&#2404;", "&#2311;&#2306;&#2335;&#2375;&#2325; &#2347;&#2381;&#2354;&#2379; &#2325;&#2368; &#2325;&#2366;&#2352;&#2381;&#2352;&#2357;&#2366;&#ई", "&#2309;&#2344;&#2369;&#2352;&#2379;&#2343; &#2346;&#2381;&#2352;&#2366;&#थमिकता &#2324;&#2352; &#2357;&#2367;&#2357;&#2352;&#ण &#2325;&#2375; &#2360;&#2366;&#थ &#2342;&#र्ज &#2361;&#2376;&#2404;"),
        "id": ("Indonesia", "Saya punya permintaan dan butuh kejelasan cepat.", "Saya bantu segera dan mengumpulkan detail penting.", "Dibutuhkan minggu ini. Saya bisa mengirim foto.", "Terima kasih. Saya siapkan tindak lanjut yang tepat.", "Aksi dalam alur intake", "Permintaan dicatat dengan urgensi, lokasi, detail dan prioritas."),
    }
    for key, values in templates.items():
        data[key] = {
            "label": values[0],
            "tenant": values[1],
            "agent": values[2],
            "tenant2": values[3],
            "agent2": values[4],
            "title": values[5],
            "result": values[6],
        }
    return data


def system_cards(prefix: str) -> str:
    names = ["Exact Online", "Zendesk", "Solvari", "HubSpot", "Autopilots integration", "Monday.com", "Google Calendar", "Outlook Calendar", "Trustoo", "Moneybird", "Bloxs", "Odoo", "Robaws", "Calendar system"]
    cards = []
    for repeat in range(2):
        for i, name in enumerate(names, start=1):
            hidden = ' aria-hidden="true"' if repeat else ""
            alt = "" if repeat else name
            cards.append(f'              <div class="ap-system-card"{hidden}><img src="{prefix}assets/systems/{i}.png" alt="{esc(alt)}"></div>')
    return "\n".join(cards)


def team_cards(prefix: str) -> str:
    people = [
        ("tim-kuiper.png", "Tim Kuiper", "Sales & Partnerships", ""),
        ("rohail-zuberi.webp", "Rohail Zuberi", "AI Specialist", ""),
        ("larissa-rosanna-pen.webp", "Larissa Rosanna Pen", "Head of Operations", ""),
        ("pratt-olan.webp", "Pratt Olan", "AI Specialist", ""),
        ("mit-dong.webp", "Mit Dong", "AI Specialist", ""),
        ("luca-van-der-meer.webp", "Luca van der Meer", "Online Marketeer", ""),
        ("hasan-shabbir.png", "Hasan Shabbir", "Head of Development", " is-hasan"),
    ]
    return "\n".join(
        f'          <div class="ap-team-card"><div class="ap-team-photo{extra}"><img src="{prefix}assets/team/{file}" alt="{esc(name)}"></div><strong>{esc(name)}</strong><span>{esc(role)}</span></div>'
        for file, name, role, extra in people
    )


def li(items: list[str]) -> str:
    return "".join(f"<li>{esc(item)}</li>" for item in items)


def cards(items: list[list[str]]) -> str:
    return "\n".join(f'        <div class="ap-card">\n          <h3>{esc(title)}</h3>\n          <p>{esc(text)}</p>\n        </div>' for title, text in items)


def appointment_accordions(niche: dict) -> str:
    sector = niche["name"].lower()
    items = [
        (
            "We bekijken je huidige klantcommunicatie",
            f"We lopen door waar aanvragen, spoedvragen, wijzigingen en herhaalvragen nu binnenkomen voor {sector}: telefoon, WhatsApp, website, e-mail en agenda.",
        ),
        (
            "We bepalen intake, uitzonderingen en fallback",
            "We leggen vast welke vragen de AI altijd moet stellen, welke situaties direct naar een mens gaan en welke urgenties voorrang krijgen.",
        ),
        (
            "Je krijgt een concrete implementatieroute",
            "Je ziet welke stappen nodig zijn om live te gaan: gespreksflow, agenda, formulieren, CRM-overdracht, testgesprekken en optimalisatie na livegang.",
        ),
    ]
    return "\n".join(
        f'''            <details class="ap-appointment-detail">
              <summary>{esc(title)}</summary>
              <p>{esc(text)}</p>
            </details>'''
        for title, text in items
    )


def render(niche: dict, asset_prefix: str = "../vastgoedbeheer-landing-page/") -> str:
    style = SOURCE.read_text().split("</style>", 1)[0] + "</style>"
    style = style.replace(
        "</style>",
        """
  #ap-property .ap-section-head h2.ap-title-sm {
    font-size: clamp(34px, 4.5vw, 58px);
    max-width: 760px;
  }

  #ap-property .ap-appointment-accordions {
    display: grid;
    gap: 10px;
    margin-top: 20px;
  }

  #ap-property .ap-appointment-detail {
    border-radius: 18px;
    border: 1px solid var(--ap-line);
    background: var(--ap-soft-2);
    padding: 0;
    overflow: hidden;
  }

  #ap-property .ap-appointment-detail summary {
    cursor: pointer;
    list-style: none;
    padding: 15px 18px;
    color: var(--ap-text);
    font-size: 15px;
    line-height: 1.35;
    font-weight: 900;
  }

  #ap-property .ap-appointment-detail summary::-webkit-details-marker {
    display: none;
  }

  #ap-property .ap-appointment-detail summary::after {
    content: "+";
    float: right;
    color: var(--ap-brown);
    font-family: "Syne", "Public Sans", Arial, sans-serif;
    font-weight: 700;
  }

  #ap-property .ap-appointment-detail[open] summary::after {
    content: "-";
  }

  #ap-property .ap-appointment-detail p {
    padding: 0 18px 16px;
    color: var(--ap-muted);
    font-size: 14px;
    line-height: 1.5;
    font-weight: 600;
  }
</style>""",
    )
    chat_json = json.dumps(localized_chat(niche), ensure_ascii=False, indent=6)
    product_ids = ["chat-agent", "voice-agent", "planning-agent", "complete-agent"]
    product_html = "\n".join(
        f'''        <div class="ap-card ap-product-card" id="{pid}">
          <div>
            <div class="ap-product-label">{esc(label)}</div>
            <h3>{esc(title)}</h3>
            <p>{esc(text)}</p>
          </div>
          <ul class="ap-list">{li(bullets)}</ul>
        </div>'''
        for pid, (label, title, text, bullets) in zip(product_ids, niche["products"])
    )
    process_html = "\n".join(
        f'''            <div class="ap-process-item">
              <span class="ap-step-number">{idx:02d}</span>
              <div>
                <h3>{esc(title)}</h3>
                <p>{esc(text)}</p>
              </div>
            </div>'''
        for idx, (title, text) in enumerate(niche["process"], start=1)
    )
    stat_html = "".join(f'<div class="ap-stat"><strong>{esc(a)}</strong><span>{esc(b)}</span></div>' for a, b in niche["stats"])
    channel_map = {
        "Telefoon": "#voice-agent", "WhatsApp": "#chat-agent", "Websitechat": "#chat-agent",
        "Portaal": "#chat-agent", "E-mail": "#complete-agent", "Agenda": "#planning-agent",
    }
    channels = "\n".join(f'            <a class="ap-channel-pill" href="{channel_map.get(ch, "#chat-agent")}">{esc(ch)}</a>' for ch in niche["channels"])
    html_body = f'''
<div id="ap-property">
  <section class="ap-hero">
    <div class="ap-container">
      <div class="ap-hero-grid">
        <div class="ap-hero-copy">
          <div class="ap-proof"><span></span><strong>{esc(niche["proof"])}</strong></div>
          <div class="ap-eyebrow">Autopilots</div>
          <h1>{niche["hero"]}</h1>
          <p class="ap-lead">{esc(niche["lead"])}</p>
          <div class="ap-channel-row" aria-label="Kanalen">
{channels}
          </div>
          <div class="ap-actions">
            <a class="ap-button ap-button-primary" href="#voice-test">&#9742; Bel direct met een Voice AI</a>
            <a class="ap-button ap-button-secondary" href="#afspraak">Plan een afspraak</a>
          </div>
        </div>

        <div class="ap-language-card" data-ap-property-chat>
          <div class="ap-lang-top">
            <div>
              <div class="ap-kicker">Voorbeeldgesprek</div>
              <h3>{esc(niche["conversation_title"])}</h3>
              <p>{esc(niche["conversation_intro"])}</p>
            </div>
            <div class="ap-country-picker" data-ap-country-picker>
              <button class="ap-country-button" type="button" aria-expanded="false" data-ap-country-button>
                <span class="ap-country-label"><span class="ap-country-flag" data-ap-country-flag>NL</span><span data-ap-country-name>Netherlands</span></span>
                <span class="ap-country-chevron" aria-hidden="true"></span>
              </button>
              <div class="ap-country-menu" role="listbox" aria-label="Choose country for example conversation">
{country_menu()}
              </div>
            </div>
          </div>
          <div class="ap-chat-window" aria-live="polite">
            <div class="ap-chat-meta"><span data-ap-lang-label>Nederlands</span><span class="ap-live-dot">Live intake</span></div>
            <div class="ap-bubble tenant" data-ap-chat-tenant>{esc(niche["chat"]["tenant"])}</div>
            <div class="ap-bubble agent" data-ap-chat-agent>{esc(niche["chat"]["agent"])}</div>
            <div class="ap-bubble tenant" data-ap-chat-tenant2>{esc(niche["chat"]["tenant2"])}</div>
            <div class="ap-bubble agent" data-ap-chat-agent2>{esc(niche["chat"]["agent2"])}</div>
            <div class="ap-chat-result">
              <strong data-ap-chat-result-title>{esc(niche["chat"]["title"])}</strong>
              <span data-ap-chat-result>{esc(niche["chat"]["result"])}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="ap-section">
    <div class="ap-container">
      <div class="ap-section-head">
        <div>
          <div class="ap-kicker">Het probleem</div>
          <h2>Het ligt niet aan de inzet van je team.</h2>
        </div>
        <p class="ap-section-text">{esc(niche["problem_intro"])}</p>
      </div>
      <div class="ap-grid-4">
{cards(niche["problems"])}
      </div>
    </div>
  </section>

  <section class="ap-section">
    <div class="ap-container">
      <div class="ap-dark-band">
        <div class="ap-split">
          <div>
            <div class="ap-kicker">{esc(niche["support_kicker"])}</div>
            <h2 class="ap-title-support" style="font-size:24px!important;line-height:1.08!important;max-width:500px!important;">{esc(niche["support_title"])}</h2>
            <p class="ap-section-text">{esc(niche["support_text"])}</p>
            <div class="ap-stat-row">{stat_html}</div>
          </div>
          <div class="ap-process">
{process_html}
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="ap-section">
    <div class="ap-container">
      <div class="ap-logo-wrap">
        <p>We integreren met de systemen en kanalen die {esc(niche["name"].lower())} al gebruiken.</p>
        <div class="ap-system-shell">
          <div class="ap-system-slider" data-ap-slider="systems" aria-label="System integrations">
            <div class="ap-system-track">
{system_cards(asset_prefix)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="ap-section">
    <div class="ap-container">
      <div class="ap-section-head">
        <div>
          <div class="ap-kicker">{esc(niche["fit_kicker"])}</div>
          <h2 class="ap-title-sm">{esc(niche["fit_title"])}</h2>
        </div>
        <p class="ap-section-text">{esc(niche["fit_text"])}</p>
      </div>
      <div class="ap-grid-4">
{product_html}
      </div>
    </div>
  </section>

  <section class="ap-section" id="voice-test">
    <div class="ap-container">
      <div class="ap-section-head">
        <div>
          <div class="ap-kicker">Ervaar de snelheid</div>
          <h2>Word direct gebeld door een Voice AI.</h2>
        </div>
        <p class="ap-section-text">Test zelf hoe snel de AI opneemt, doorvraagt en het gesprek netjes afrondt. Voor {esc(niche["name"].lower())} draait dit om snelheid, bereikbaarheid en betere intake.</p>
      </div>
      <div class="ap-voice-grid">
        <div class="ap-voice-card">
          <div class="ap-phone-visual" aria-label="Voice AI visual">
            <div class="ap-phone-top"><span>Autopilots Voice AI</span><span>Live</span></div>
            <div class="ap-wave"><span></span><span></span><span></span><span></span><span></span></div>
            <div class="ap-call-status">
              <strong>{esc(niche["voice"][0])}</strong>
              <p>{esc(niche["voice"][1])}</p>
            </div>
          </div>
          <div class="ap-live-panel">
            <div>
              <div class="ap-kicker">Plan een afspraak via onze AI Voice Agent</div>
              <h3>Bel met een agent die klanten direct helpt.</h3>
              <p>Of het nu gaat om spoed, planning of een nieuwe aanvraag: wie direct reageert, wint vertrouwen en marge.</p>
              <ul class="ap-list">
                <li>24/7 bereikbaar voor klanten</li>
                <li>Intake per dienst en urgentie</li>
                <li>Overdracht met samenvatting</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="ap-form-card">
          <h3>Bel direct met een Voice AI</h3>
          <p>Laat je gegevens achter en ervaar de telefonische flow.</p>
          <div class="ap-ghl-frame">
            <iframe src="https://api.leadconnectorhq.com/widget/form/EqeJFQsmD1urhHlceuLu" style="width:100%;height:100%;border:none;border-radius:0px" id="inline-EqeJFQsmD1urhHlceuLu" data-layout="{{'id':'INLINE'}}" data-trigger-type="alwaysShow" data-trigger-value="" data-activation-type="alwaysActivated" data-activation-value="" data-deactivation-type="neverDeactivate" data-deactivation-value="" data-form-name="Website Test Voice AI" data-height="420" data-layout-iframe-id="inline-EqeJFQsmD1urhHlceuLu" data-form-id="EqeJFQsmD1urhHlceuLu" title="Website Test Voice AI"></iframe>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="ap-section" id="afspraak">
    <div class="ap-container">
      <div class="ap-calendar-grid">
        <div class="ap-calendar-copy">
          <div class="ap-kicker">Pak je voorsprong in {esc(niche["name"].lower())}</div>
          <h2>Bekijk waar AI direct werk uit handen neemt.</h2>
          <p class="ap-section-text">{esc(niche["appointment"])}</p>
          <div class="ap-appointment-accordions">
{appointment_accordions(niche)}
          </div>
        </div>
        <div class="ap-calendar-card">
          <iframe src="https://api.leadconnectorhq.com/widget/booking/UaWTV0sdETiXy0refclQ" style="width: 100%;border:none;overflow: hidden;" scrolling="no" id="UaWTV0sdETiXy0refclQ_1780946087456"></iframe>
        </div>
      </div>
    </div>
  </section>

  <section class="ap-section">
    <div class="ap-container">
      <div class="ap-section-head">
        <div>
          <div class="ap-kicker">Meet the crew</div>
          <h2>Built by the Autopilots team.</h2>
        </div>
        <p class="ap-section-text">Een compact team voor strategie, bouw, operations en optimalisatie. Autopilots blijft betrokken na livegang, zodat de AI beter wordt op basis van echte gesprekken.</p>
      </div>
      <div class="ap-team-shell">
        <div class="ap-team-slider" data-ap-slider="team" aria-label="Autopilots team">
{team_cards(asset_prefix)}
        </div>
        <div class="ap-slider-controls" aria-label="Team slider controls">
          <button class="ap-slider-button" type="button" data-ap-slide-prev="team" aria-label="Previous team members">&#8592;</button>
          <button class="ap-slider-button" type="button" data-ap-slide-next="team" aria-label="Next team members">&#8594;</button>
        </div>
      </div>
    </div>
  </section>

  <section class="ap-section ap-final">
    <div class="ap-container">
      <div class="ap-final-box">
        <div class="ap-kicker">Autopilots</div>
        <h2>Bel met een Voice Agent die 24/7 klaarstaat en je groei beschermt.</h2>
        <p class="ap-section-text">Zorg dat je altijd bereikbaar bent voor spoed, aanvragen en planning zonder je team te overbelasten.</p>
        <div class="ap-actions">
          <a class="ap-button ap-button-primary" href="#voice-test">&#9742; Test de Voice AI</a>
          <a class="ap-button ap-button-secondary" href="#afspraak">Plan een afspraak</a>
        </div>
      </div>
    </div>
  </section>
</div>
'''
    script = f'''
<script>
  (function () {{
    var root = document.querySelector("#ap-property");
    if (!root) return;
    var data = {chat_json};
    var wrap = root.querySelector("[data-ap-property-chat]");
    if (!wrap) return;
    var fields = {{
      label: wrap.querySelector("[data-ap-lang-label]"),
      tenant: wrap.querySelector("[data-ap-chat-tenant]"),
      agent: wrap.querySelector("[data-ap-chat-agent]"),
      tenant2: wrap.querySelector("[data-ap-chat-tenant2]"),
      agent2: wrap.querySelector("[data-ap-chat-agent2]"),
      title: wrap.querySelector("[data-ap-chat-result-title]"),
      result: wrap.querySelector("[data-ap-chat-result]")
    }};
    var countryPicker = root.querySelector("[data-ap-country-picker]");
    var countryButton = root.querySelector("[data-ap-country-button]");
    var countryName = root.querySelector("[data-ap-country-name]");
    var countryFlag = root.querySelector("[data-ap-country-flag]");
    var countryOptions = root.querySelectorAll(".ap-country-option");
    function setHtml(el, value) {{ if (el) el.innerHTML = value; }}
    function closeCountryPicker() {{
      if (!countryPicker || !countryButton) return;
      countryPicker.classList.remove("is-open");
      countryButton.setAttribute("aria-expanded", "false");
    }}
    function renderLanguage(key) {{
      var item = data[key] || data.nl;
      setHtml(fields.label, item.label);
      setHtml(fields.tenant, item.tenant);
      setHtml(fields.agent, item.agent);
      setHtml(fields.tenant2, item.tenant2);
      setHtml(fields.agent2, item.agent2);
      setHtml(fields.title, item.title);
      setHtml(fields.result, item.result);
      wrap.setAttribute("data-current-language", key);
      countryOptions.forEach(function (option) {{
        var active = option.getAttribute("data-lang") === key;
        option.classList.toggle("is-active", active);
        if (active) {{
          var flagText = option.querySelector(".ap-country-flag").textContent;
          if (countryName) countryName.textContent = option.textContent.replace(flagText, "").trim();
          if (countryFlag) countryFlag.textContent = flagText;
        }}
      }});
    }}
    if (countryButton && countryPicker) {{
      countryButton.addEventListener("click", function () {{
        var isOpen = countryPicker.classList.toggle("is-open");
        countryButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
      }});
    }}
    countryOptions.forEach(function (option) {{
      option.addEventListener("click", function () {{
        renderLanguage(option.getAttribute("data-lang"));
        closeCountryPicker();
      }});
    }});
    root.querySelectorAll(".ap-channel-row a[href^='#']").forEach(function (link) {{
      link.addEventListener("click", function (event) {{
        var target = root.querySelector(link.getAttribute("href"));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({{ behavior: "smooth", block: "start" }});
        if (window.history && window.history.pushState) window.history.pushState(null, "", link.getAttribute("href"));
      }});
    }});
    document.addEventListener("click", function (event) {{ if (countryPicker && !countryPicker.contains(event.target)) closeCountryPicker(); }});
    document.addEventListener("keydown", function (event) {{ if (event.key === "Escape") closeCountryPicker(); }});
    root.querySelectorAll("[data-ap-slide-prev], [data-ap-slide-next]").forEach(function (button) {{
      button.addEventListener("click", function () {{
        var target = button.getAttribute("data-ap-slide-prev") || button.getAttribute("data-ap-slide-next");
        var slider = root.querySelector('[data-ap-slider="' + target + '"]');
        if (!slider) return;
        var direction = button.hasAttribute("data-ap-slide-next") ? 1 : -1;
        slider.scrollBy({{ left: direction * Math.min(560, slider.clientWidth * 0.86), behavior: "smooth" }});
      }});
    }});
    renderLanguage("nl");
  }})();
</script>

<script src="https://link.msgsndr.com/js/form_embed.js"></script>
'''
    return style + "\n\n" + html_body + "\n" + script


def make_ghl(local_html: str) -> str:
    html_text = local_html
    replacements = {}
    for i in range(1, 15):
        replacements[f'../vastgoedbeheer-landing-page/assets/systems/{i}.png'] = COMPACT_ASSETS / "systems" / f"{i}.jpg"
    team_map = {
        "tim-kuiper.png": "tim-kuiper.jpg",
        "rohail-zuberi.webp": "rohail-zuberi.jpg",
        "larissa-rosanna-pen.webp": "larissa-rosanna-pen.jpg",
        "pratt-olan.webp": "pratt-olan.jpg",
        "mit-dong.webp": "mit-dong.jpg",
        "luca-van-der-meer.webp": "luca-van-der-meer.jpg",
        "hasan-shabbir.png": "hasan-shabbir.jpg",
    }
    for old, new in team_map.items():
        replacements[f"../vastgoedbeheer-landing-page/assets/team/{old}"] = COMPACT_ASSETS / "team" / new
    for old, path in replacements.items():
        mime = mimetypes.guess_type(path.name)[0] or "image/jpeg"
        data = base64.b64encode(path.read_bytes()).decode("ascii")
        html_text = html_text.replace(old, f"data:{mime};base64,{data}")
    return html_text


def main() -> None:
    all_niches = NICHES + expand_additional()
    for niche in all_niches:
        folder = OUT_ROOT / niche["slug"]
        folder.mkdir(parents=True, exist_ok=True)
        local_html = render(niche)
        (folder / f"autopilots-{niche['slug']}-landing-embed.html").write_text(local_html)
        (folder / f"autopilots-{niche['slug']}-landing-ghl-embed.html").write_text(make_ghl(local_html))
    vastgoed_folder = OUT_ROOT / "vastgoedbeheerders"
    vastgoed_folder.mkdir(parents=True, exist_ok=True)
    vastgoed_local = (ROOT / "vastgoedbeheer-landing-page" / "autopilots-vastgoedbeheer-landing-embed.html").read_text()
    vastgoed_local = vastgoed_local.replace('src="assets/', 'src="../vastgoedbeheer-landing-page/assets/')
    (vastgoed_folder / "autopilots-vastgoedbeheerders-landing-embed.html").write_text(vastgoed_local)
    shutil.copyfile(
        ROOT / "vastgoedbeheer-landing-page" / "autopilots-vastgoedbeheer-landing-ghl-embed.html",
        vastgoed_folder / "autopilots-vastgoedbeheerders-landing-ghl-embed.html",
    )
    all_niches = all_niches + [{"slug": "vastgoedbeheerders", "name": "Vastgoedbeheerders"}]
    index_lines = ["# Niche landingspagina's", ""]
    for niche in all_niches:
        index_lines.append(f"- {niche['name']}: `{niche['slug']}/autopilots-{niche['slug']}-landing-ghl-embed.html`")
    (OUT_ROOT / "README.md").write_text("\n".join(index_lines) + "\n")
    print(f"Generated {len(all_niches)} niches in {OUT_ROOT}")


if __name__ == "__main__":
    main()
