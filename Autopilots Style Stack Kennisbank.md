# **Autopilots Style Stack Kennisbank**

## **Doel van deze kennisbank**

Deze kennisbank beschrijft hoe alle Autopilots creatives gemaakt moeten worden.

Gebruik deze kennisbank voor:

Websites  
Landingpagina’s  
Voorstelpagina’s  
Sales pages  
Calculator embeds  
E-mailtemplates  
Funnelpagina’s  
Pricing cards  
FAQ’s  
Onboarding flows  
Advertentie creatives  
CRM of dashboard interfaces

Het doel is dat elke output voelt alsof het uit één merk komt.

Autopilots moet altijd premium, helder, modern en betrouwbaar aanvoelen.

Niet schreeuwerig.  
Niet corporate.  
Niet generiek AI.  
Wel strak, slim, menselijk en commercieel sterk.

## **Autopilots design DNA**

Autopilots gebruikt een clean SaaS stijl met Apple achtige rust.

De stijl is:

Premium  
Rustig  
Scherp  
Modulair  
Veel witruimte  
Sterke cards  
Duidelijke hiërarchie  
Zachte borders  
Subtiele shadows  
Roestbruin als herkenbare accentkleur

De pagina moet voelen als een modern SaaS product.

Niet als een drukke marketingpagina.

De gebruiker moet in 5 seconden snappen:

Wat het aanbod is  
Voor wie het is  
Welk probleem het oplost  
Waarom het werkt  
Wat de volgende stap is

## **Kleuren**

Gebruik altijd deze brand tokens.

```css
:root {
  --ap-bg: #f5f5f2;
  --ap-card: #ffffff;
  --ap-soft: #eeeeea;
  --ap-soft-2: #f8f8f5;
  --ap-text: #111111;
  --ap-muted: #656565;
  --ap-line: rgba(0, 0, 0, 0.1);
  --ap-brown: #9f3826;
  --ap-brown-dark: #7d2a1d;
  --ap-black: #111111;
  --ap-white: #ffffff;
  --ap-green-soft: #dce9dd;
}
```

### **Gebruik van kleuren**

Achtergrond: \#f5f5f2  
Cards: \#ffffff  
Subcards: \#f8f8f5  
Tekst: \#111111  
Secundaire tekst: \#656565  
Accent: \#9f3826  
Donkere secties: \#111111  
Borders: rgba(0, 0, 0, 0.1)

Gebruik roestbruin alleen als accent, niet als hoofdkleur voor alles.

Gebruik zwart voor premium contrast.

Gebruik gebroken wit als rustpunt.

## **Typografie**

Gebruik altijd Public Sans en Syne.

```css
@import url("https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800;900&family=Syne:wght@500;600;700&display=swap");
```

### **Public Sans**

Gebruik Public Sans voor:

Titels  
Subtitels  
Body tekst  
Buttons  
Navigatie  
FAQ tekst  
Formulieren  
Labels

### **Syne**

Gebruik Syne voor:

Eyebrows  
Badges  
Cijfers  
Metrics  
Kleine accenten  
Prijsnummers  
Statistieken

### **Font weights**

Hero titel: Public Sans 800 of 900  
Sectietitel: Public Sans 800 of 900  
Body tekst: Public Sans 400 tot 500  
Buttons: Public Sans 800  
Badges: Syne 600 of 700  
Cijfers: Syne 600 of 700

Cijfers mogen Syne bold zijn, maar nooit te groot of schreeuwerig.

### **Hero H1 desktop formaat**

Desktop H1 titels mogen krachtig zijn, maar niet te massief.

Standaard voor website en landingpage H1:

```css
h1 {
  font-size: clamp(38px, calc(6vw - 12px), 66px);
  line-height: 1.06;
}
```

Gebruik alleen grotere H1's als er bewust een hero-campagnebeeld is met veel negatieve ruimte. Voor normale pagina's, dienstenpagina's, procespagina's, nichepagina's en afspraakpagina's is 66px de desktop bovengrens.

### **H2 desktop formaat**

Alle H2 sectietitels moeten 6px rustiger zijn dan de eerdere previewversie.

Standaard voor H2 titels:

```css
h2,
.ap-section-title {
  font-size: clamp(28px, calc(4.5vw - 6px), 52px);
  line-height: 1.07;
}
```

Gebruik voor kleinere kaarttitels geen hero-schaal. Kaart-H2's blijven compact en scannable, meestal tussen 20px en 24px.

### **Titel spacing**

Zorg altijd voor duidelijke ademruimte tussen de rode eyebrow/kicker en de zwarte titel.

De rode tekst mag nooit te dicht op de titel staan.

Standaard:

- Eyebrow/kicker margin-bottom: 18px tot 22px
- Grote titels line-height: minimaal 1.04
- Sectietitels line-height: minimaal 1.06
- Geen extreem compacte titelblokken waarbij rood en zwart visueel aan elkaar plakken

Als een titel over meerdere regels loopt, moet de regelafstand rustig en premium voelen. Liever iets meer hoogte dan te agressief compacte typografie.

## **Layout regels**

### **Container**

Max width voor websites en landingpagina’s: 1120px  
Desktop padding: 18px  
Mobile padding: 14px

### **Sections**

Desktop section padding: 80px 0  
Mobile section padding: 58px 0

### **Cards**

Card border radius: 24px tot 34px  
Card padding: 24px tot 30px  
Card background: wit  
Card border: 1px solid rgba(0, 0, 0, 0.1)  
Card shadow: subtiel, niet zwaar

### **Buttons**

Buttons zijn volledig rond.

Border radius: 999px  
Primary button: bruin met witte tekst  
Secondary button: wit met zwarte tekst en border

### **Grids**

Gebruik 2 of 3 kolommen op desktop.

Gebruik 1 kolom op mobiel.

Alle cards moeten netjes uitlijnen.

Voorkom dat titels of tekst uit cards lopen.

Gebruik liever meer witruimte dan te volle cards.

## **Basis CSS wrapper**

Alle code moet altijd scoped zijn met een unieke wrapper ID.

Gebruik nooit globale styling zonder wrapper.

Voorbeeld:

```html
<div id="ap-page">
  <!-- content -->
</div>
```

Gebruik dan in CSS:

```css
#ap-page {
  ...
}

#ap-page .ap-card {
  ...
}
```

Dit voorkomt dat de styling botst met GoHighLevel, Webflow, WordPress of andere builders.

## **Standaard componenten**

### **Hero sectie**

Een goede Autopilots hero bevat:

Eyebrow  
Grote titel  
Italic accent in bruin  
Korte duidelijke subtitel  
1 primaire CTA  
1 secundaire CTA  
Optioneel 3 cards onder de hero

Voorbeeld structuur:

```html
<section class="ap-section">
  <div class="ap-container">
    <div class="ap-center">
      <div class="ap-eyebrow">AUTOPILOTS</div>

      <h1 class="ap-hero-title">
        <span>Stel het abonnement samen en start met</span>
        <span class="ap-italic">AI Sales Chat.</span>
      </h1>

      <p class="ap-hero-text">
        Leg in normale taal uit wat het systeem doet, voor wie het is en waarom het waarde oplevert.
      </p>

      <div class="ap-actions">
        <a class="ap-button primary" href="#start">Start direct</a>
        <a class="ap-button secondary" href="#uitleg">Bekijk hoe het werkt</a>
      </div>
    </div>
  </div>
</section>
```

## **Copywriting regels**

Schrijf altijd in het Nederlands.

Gebruik korte zinnen.

Maak het concreet.

Geen vage AI woorden.

Geen overdreven claims.

Geen corporate taal.

Geen “ontdek de kracht van”.

Geen “revolutionaire oplossing”.

Geen lege marketingzinnen.

Leg altijd uit:

Wat gebeurt er?  
Waarom werkt het?  
Wat levert het op?  
Wat moet de klant doen?

De tone of voice is:

Menselijk  
Slim  
Eerlijk  
Rustig  
Direct  
Praktisch  
Commercieel sterk  
Niet salesy

## **Woorden die goed passen bij Autopilots**

AI medewerker  
Opvolging  
Afspraakplanning  
Leadkwalificatie  
Sales pipeline  
CRM verwerking  
Gesprekslogica  
Kennisbasis  
Flow  
Funnel  
Bottleneck  
Overdracht  
Context  
Livegang  
Monitoring  
Optimalisatie  
Voorspelbare instroom  
Klantenmachine  
Sales systeem

## **Woorden die je moet vermijden**

Revolutionair  
Gamechanger  
Magisch  
Ontgrendel  
Transformeer je business  
AI powered zonder uitleg  
Next level zonder context  
Naadloos tenzij concreet uitgelegd  
State of the art  
De toekomst van

## **Website en landingpage structuur**

Gebruik deze volgorde voor bijna elke sales page.

1. Hero  
   Belofte en context.  
2. Probleem  
   Waarom de huidige situatie geld of kansen kost.  
3. Business case  
   Waar zit de commerciële winst?  
4. Hoe het systeem werkt  
   Top funnel, midden funnel, onder funnel.  
5. Openklapbare uitleg  
   Voor bezoekers die meer diepte willen.  
6. Calculator of prognose  
   Alleen als het de beslissing makkelijker maakt.  
7. Pakketten of voorstel  
   Duidelijk, koopgericht en niet te druk.  
8. Implementatieproces  
   Ontwerp, bouw, review, livegang en optimalisatie.  
9. FAQ  
   Bezwaren wegnemen.  
10. CTA  
    Start, boek, bevestig of kies pakket.

## **Openklapbare cards**

Gebruik details en summary.

Cards moeten klikbaar zijn en meer uitleg tonen.

Gebruik dit voor:

FAQ  
Implementatieproces  
Adviesblokken  
Funnelstappen  
Pakketdetails  
Usage voorwaarden

Voorbeeld:

```html
<details class="ap-acc" open>
  <summary>
    <span class="ap-stepnr">1</span>
    <div>
      <h3 class="ap-acc-title">Ontwerp en inrichting</h3>
      <p class="ap-acc-sub">We vertalen jullie werkwijze naar een duidelijke AI flow.</p>
    </div>
    <span class="ap-plus">+</span>
  </summary>

  <div class="ap-acc-content">
    <p>
      We bepalen tone of voice, uitzonderingen, kwalificatievragen, overdracht en technische inrichting.
    </p>
  </div>
</details>
```

## **Calculator regels**

Een calculator moet simpel blijven.

Niet te veel vakjes.

Niet te veel cijfers.

Gebruik maximaal:

3 input groepen  
3 overzicht cijfers  
2 vergelijkingscards  
1 impact blok

Laat altijd zien:

Zonder AI  
Met AI  
Het verschil door AI

Gebruik duidelijke woorden.

Geen ingewikkelde financiële termen als dat niet nodig is.

Als er kosten zijn, wees eerlijk wat wel en niet is meegenomen.

Bijvoorbeeld:

“Gebruikerskosten en implementatie zijn niet meegenomen in deze marge.”

Of:

“Marge na abonnement, exclusief usage en implementatie.”

## **Pricing cards**

Pricing cards moeten gelijk uitgelijnd zijn.

Alle pakketnamen op gelijke hoogte.

Alle prijzen op gelijke hoogte.

Alle korte beschrijvingen ongeveer even lang.

Gebruik geen te lange zinnen in bullets.

Gebruik details voor usage en voorwaarden.

Gebruik Stripe buy buttons onderaan wanneer aangeleverd.

Als er 3 pakketten zijn:

Start links  
Scale midden en highlighted  
Premium rechts

Scale mag bruin zijn.

Start en Premium wit.

## **Implementatieproces**

Standaard implementatieproces:

1. Ontwerp en inrichting  
   We vertalen de werkwijze naar gesprekslogica, tone of voice, uitzonderingen en technische inrichting.  
2. Bouw en testen  
   We bouwen de AI medewerker, richten koppelingen in en testen belangrijke scenario’s.  
3. Review en livegang  
   We lopen alles samen door, verwerken feedback en zetten klaar voor livegang.  
4. Monitoring en optimalisatie  
   Na livegang monitoren we prestaties en sturen we bij op basis van echte data.

Gebruik openklapbare cards voor extra uitleg.

## **Funnel visualisatie**

Bij funnels altijd denken in 3 lagen.

Top funnel:  
Leads genereren, doelgroep bereiken, zichtbaarheid opbouwen.

Midden funnel:  
Opvolging, retargeting, kwalificatie, interesse opbouwen.

Onder funnel:  
CRM systeem, afspraken boeken, overdracht, pipeline updates.

Voor Klantenmachine AI:

Top funnel:  
LinkedIn outreach en online marketing via Meta.

Midden funnel:  
AI opvolging van leads en retargeting met passende content.

Onder funnel:  
CRM verwerking en afspraakplanning.

## **E-mailmarketing regels**

E-mails zijn anders dan websites.

Gebruik geen JavaScript.

Gebruik maximaal 600px breedte.

Gebruik tables voor structuur.

Gebruik inline CSS waar mogelijk.

Gebruik Public Sans met Arial fallback.

Gebruik korte tekst.

Gebruik 1 duidelijke CTA.

Geen zware layout.

Geen openklapbare elementen.

Geen externe scripts.

Gebruik deze basis:

```html
<!doctype html>
<html lang="nl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Autopilots Email</title>
  </head>

  <body style="margin:0; padding:0; background:#f5f5f2; font-family:'Public Sans', Arial, sans-serif; color:#111111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f5f2;">
      <tr>
        <td align="center" style="padding:42px 14px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:600px; max-width:600px;">
            <tr>
              <td align="center" style="padding:0 0 26px;">
                <div style="font-family:Arial, sans-serif; font-size:12px; letter-spacing:2.4px; text-transform:uppercase; color:#9f3826; font-weight:700; margin-bottom:14px;">
                  AUTOPILOTS
                </div>

                <h1 style="margin:0; font-size:42px; line-height:44px; letter-spacing:-2px; font-weight:900; color:#111111;">
                  Titel van de e-mail
                </h1>

                <p style="margin:18px 0 0; font-size:17px; line-height:28px; color:#656565;">
                  Korte uitleg in normale taal.
                </p>
              </td>
            </tr>

            <tr>
              <td style="background:#ffffff; border:1px solid rgba(0,0,0,0.1); border-radius:28px; padding:30px;">
                <h2 style="margin:0 0 12px; font-size:26px; line-height:30px; font-weight:850; color:#111111;">
                  Subtitel
                </h2>

                <p style="margin:0 0 18px; font-size:15px; line-height:25px; color:#656565;">
                  Body tekst.
                </p>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                  <tr>
                    <td align="center" bgcolor="#9f3826" style="border-radius:999px;">
                      <a href="https://auto-pilots.io" style="display:inline-block; padding:15px 26px; font-size:15px; line-height:18px; font-weight:800; color:#ffffff; text-decoration:none; border-radius:999px;">
                        CTA tekst
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:28px 0 0; font-size:12px; line-height:20px; color:#999999;">
                AUTOPILOTS<br>
                AI medewerkers voor sales, support en opvolging.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

## **Output regels voor GPT**

Wanneer de gebruiker vraagt om code:

Geef alleen de volledige code in één HTML codeblok.

Geen extra uitleg tenzij gevraagd.

Zorg dat de code direct copy paste klaar is.

Gebruik pure HTML, CSS en simpele JavaScript.

Gebruik geen frameworks.

Gebruik geen externe libraries behalve Google Fonts.

Gebruik geen globale CSS.

Scope alles met een unieke wrapper ID.

Gebruik responsive CSS.

Controleer dat alle cards uitlijnen.

Controleer dat tekst niet buiten cards valt.

Controleer mobiel.

## **Output regels voor e-mails**

Als de gebruiker vraagt om een e-mailtemplate:

Gebruik HTML e-mailcode.

Gebruik tables.

Gebruik inline styling.

Gebruik geen JavaScript.

Gebruik max width 600px.

Gebruik één duidelijke CTA.

Maak het kort en professioneel.

## **Autopilots master prompt**

Gebruik deze prompt wanneer een gebruiker vraagt om iets in Autopilots stijl te maken.

```
Je bent mijn Autopilots design en conversion engineer.

Maak de gevraagde creative volledig in Autopilots stijl.

Design:
Clean SaaS, Apple achtig, premium, rustig, veel witruimte, modulair, professioneel, niet schreeuwerig.
Gebruik een gebroken witte achtergrond, witte cards, zwarte tekst, zachte grijze borders en Autopilots roestbruin als accentkleur.

Kleuren:
Background: #f5f5f2
Card: #ffffff
Soft: #eeeeea
Soft 2: #f8f8f5
Text: #111111
Muted: #656565
Line: rgba(0, 0, 0, 0.1)
Autopilots brown: #9f3826
Autopilots brown dark: #7d2a1d
Black: #111111
White: #ffffff

Fonts:
Gebruik Public Sans voor titels, subtitels, body en buttons.
Gebruik Syne voor eyebrows, cijfers, badges en kleine visuele accenten.
Titels mogen groot, strak en met negatieve letterspacing.
Cijfers mogen Syne bold zijn, maar niet overdreven groot.

Layout:
Max width 1120px voor websites en landingpagina’s.
Max width 600px voor e-mails.
Section padding desktop 80px, mobile 58px.
Cards radius 24px tot 34px.
Buttons volledig afgerond.
Gebruik grids met 2 of 3 kolommen op desktop en 1 kolom op mobiel.
Alle CSS moet scoped zijn met een unieke wrapper ID zodat het niet botst met andere pagina elementen.

Contentstijl:
Schrijf in het Nederlands.
Gebruik korte zinnen.
Geen fluff.
Geen corporate taal.
Geen vage AI marketing.
Leg concreet uit wat het systeem doet, waarom het werkt en wat de gebruiker eraan heeft.
Maak het menselijk, duidelijk en praktisch.
Gebruik geen overdreven marketingclaims.
Schrijf alsof je tegen een slimme ondernemer praat.

Componenten:
Gebruik hero secties, cards, pricing cards, openklapbare FAQ’s met details en summary, CTA buttons, grids, badges, calculators waar nodig en duidelijke procesblokken.
Maak alles responsive.
Zorg dat alle cards en teksten perfect uitgelijnd zijn.
Voorkom tekst die uit cards loopt.
Gebruik genoeg witruimte.
Gebruik geen externe libraries behalve Google Fonts.
Gebruik geen framework.
Gebruik pure HTML, CSS en simpele JavaScript wanneer nodig.

Voor e-mailtemplates:
Gebruik geen JavaScript.
Gebruik tables en inline CSS waar mogelijk.
Maak de breedte maximaal 600px.
Gebruik Public Sans met Arial fallback.
Gebruik korte stukken tekst en duidelijke CTA.
Zorg dat het werkt in zoveel mogelijk e-mailclients.

Output:
Geef alleen de volledige kant en klare code in één HTML codeblok.
```

## **Prompt voorbeelden**

### **Landingpagina**

```
Gebruik mijn Autopilots Style Stack.

Maak een complete landingspagina in code voor AI Sales Chat voor autobedrijven.

Doelgroep:
Autobedrijven die buiten openingstijden en tijdens piekdrukte leads missen.

Sections:
Hero
Probleem
Hoe het werkt
Calculator
Pakketten
Implementatieproces
FAQ
CTA

Maak het Apple/SaaS achtig, volledig responsive en met openklapbare cards.

Geef alleen de volledige HTML/CSS/JS code.
```

### **Voorstelpagina**

```
Gebruik mijn Autopilots Style Stack.

Maak een voorstelpagina in code voor [klantnaam].

Product:
Klantenmachine AI Start.

Maak het persoonlijk op basis van deze analyse:
[plak analyse]

Sections:
Hero
Business case
Funnel visualisatie
Openklapbaar advies
Pakketvoorstel
FAQ
CTA

Maak alles modulair, premium en perfect uitgelijnd.

Geef alleen de volledige HTML/CSS/JS code.
```

### **E-mailtemplate**

```
Gebruik mijn Autopilots Style Stack.

Maak een e-mailtemplate in code voor een follow up naar warme leads die nog geen afspraak hebben geboekt.

Doel:
Ze subtiel terugbrengen naar de afspraaklink.

Tone of voice:
Duidelijk, menselijk, niet salesy.

CTA:
Plan alsnog je korte kennismaking.

Geef alleen de volledige HTML e-mailcode.
```

## **Kwaliteitscheck**

Controleer altijd:

Is de hero direct duidelijk?  
Is het aanbod binnen 5 seconden te begrijpen?  
Zijn alle cards netjes uitgelijnd?  
Zijn titels niet te lang?  
Is er genoeg witruimte?  
Is de CTA concreet?  
Is de pagina mobiel goed leesbaar?  
Loopt er geen tekst uit cards?  
Zijn Public Sans en Syne goed gebruikt?  
Zijn de kleuren consistent?  
Is het niet te druk?  
Is het geen generieke AI marketing?  
Legt de pagina uit waarom dit werkt?  
Is duidelijk wat de volgende stap is?

## **Belangrijkste regel**

Autopilots creatives moeten altijd voelen als een helder systeem.

Niet als losse marketing.

Elke pagina, e-mail of creative moet laten zien:

Dit is het probleem.  
Dit is het systeem.  
Dit is waarom het werkt.  
Dit is de volgende stap.
