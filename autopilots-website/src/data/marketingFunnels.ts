export interface FunnelDemoScenario {
  key: string;
  product: string;
  channel: string;
  promise: string;
  messages: Array<{ from: "Klant" | "AI-medewerker"; text: string }>;
  route: string[];
  result: string;
}

export interface MarketingFunnelConfig {
  niche: string;
  slug: string;
  campaignName: string;
  hero: { eyebrow: string; title: string; accent: string; description: string };
  painPoints: string[];
  channels: string[];
  intents: Array<{ key: "roi" | "demo"; number: string; title: string; text: string; cta: string }>;
  demos: FunnelDemoScenario[];
  roi: { volume: number; issue: number; appointment: number; close: number; value: number };
  video?: { src: string; poster?: string };
  ghl: { tags: string[]; source: string; pipelineContext: string; calendar: string };
  privacyText: string;
  trackingContext: string;
}

export const autoDealerFunnel: MarketingFunnelConfig = {
  niche: "Autobedrijven",
  slug: "autobedrijven/ai-medewerker",
  campaignName: "AI-medewerker voor autobedrijven",
  hero: {
    eyebrow: "Voor autobedrijven die sneller willen opvolgen",
    title: "Iedere autolead krijgt direct antwoord en",
    accent: "een concrete vervolgstap.",
    description: "Test hoe een AI-medewerker voorraadvragen, proefritten, inruil, gemiste oproepen en open leads opvangt — ook wanneer de showroom druk of gesloten is."
  },
  painPoints: [
    "Platform- en websiteleads wachten op een verkoper",
    "Proefritten en inruilvragen komen buiten openingstijd binnen",
    "Gemiste oproepen worden niet altijd teruggebeld",
    "Opvolging staat verspreid over inbox, WhatsApp en CRM"
  ],
  channels: ["Website", "BOVAG", "AutoScout", "Marktplaats", "WhatsApp", "Telefonie"],
  intents: [
    { key: "roi", number: "01", title: "Bereken de mogelijke impact", text: "Reken met je eigen aantallen, opvolging en gemiddelde klantwaarde.", cta: "Start mijn berekening" },
    { key: "demo", number: "02", title: "Test drie AI-medewerkers", text: "Bekijk inbox, telefonie en leadopvolging in herkenbare autosituaties.", cta: "Open de praktijktest" }
  ],
  demos: [
    {
      key: "inbox",
      product: "AI Inboxmedewerker",
      channel: "Marktplaats · 21:14",
      promise: "Van voorraadvraag naar complete proefritintake",
      messages: [
        { from: "Klant", text: "Is de Golf GTE uit 2022 nog beschikbaar? Ik wil mijn huidige auto misschien inruilen." },
        { from: "AI-medewerker", text: "Ja, deze staat nog in de voorraad. Zal ik direct een proefritmoment zoeken? Voor een eerste inruilindicatie heb ik merk, model, bouwjaar en kilometerstand nodig." },
        { from: "Klant", text: "Donderdag na 16:00. Mijn auto is een Audi A3 uit 2018 met 94.000 km." },
        { from: "AI-medewerker", text: "Donderdag 16:30 is beschikbaar. Ik zet de proefrit en inruilgegevens klaar voor verkoop en stuur je de bevestiging." }
      ],
      route: ["Voorraadauto herkend", "Proefritwens compleet", "Inruilgegevens vastgelegd", "CRM + agenda bijgewerkt"],
      result: "Proefritvoorstel en inruilintake staan klaar voor de verkoper."
    },
    {
      key: "telefoniste",
      product: "AI Telefoniste",
      channel: "Gemiste oproep · 18:42",
      promise: "Van gemiste oproep naar afspraak voor de werkplaats",
      messages: [
        { from: "Klant", text: "Mijn auto geeft een motorstoringslampje. Kunnen jullie hem deze week uitlezen?" },
        { from: "AI-medewerker", text: "Ik help u met de intake. Rijdt de auto normaal, knippert het lampje en om welk kenteken gaat het?" },
        { from: "Klant", text: "Hij rijdt normaal, het lampje brandt constant. Kenteken 7-KDX-21." },
        { from: "AI-medewerker", text: "Vrijdag 09:00 is beschikbaar voor diagnose. Ik leg kenteken en melding vast voor de werkplaats." }
      ],
      route: ["Reden oproep herkend", "Veiligheidsvragen gesteld", "Kenteken gekoppeld", "Werkplaatsafspraak klaar"],
      result: "De werkplaats ontvangt een complete intake in plaats van alleen een gemiste oproep."
    },
    {
      key: "leadopvolger",
      product: "AI Leadopvolger",
      channel: "Open lead · dag 2",
      promise: "Van stille offerte naar een duidelijke volgende stap",
      messages: [
        { from: "AI-medewerker", text: "U bekeek gisteren de financieringsopties voor de Volvo XC40. Kan ik nog iets verduidelijken of een proefrit voor u plannen?" },
        { from: "Klant", text: "Ik twijfel nog over de maandlast en wil eerst mijn huidige auto laten waarderen." },
        { from: "AI-medewerker", text: "Begrijpelijk. Ik kan de inruilcheck en een gesprek over de maandlast combineren. Past zaterdag 11:00?" },
        { from: "Klant", text: "Ja, zaterdag 11:00 is goed." }
      ],
      route: ["Open lead gesignaleerd", "Bezwaar herkend", "Passend voorstel gedaan", "Afspraak + eigenaar vastgelegd"],
      result: "De open lead krijgt een afspraak en de verkoper ontvangt context over financiering en inruil."
    }
  ],
  roi: { volume: 180, issue: 32, appointment: 42, close: 28, value: 1750 },
  ghl: {
    tags: ["LP Autobedrijven", "AI-medewerker funnel", "Advertentielead"],
    source: "Autopilots advertentiefunnel autobedrijven",
    pipelineContext: "Test of ROI voor AI-medewerker bij autobedrijf",
    calendar: publicRuntime.ghlCalendarUrl
  },
  privacyText: "We gebruiken je gegevens alleen om de gekozen test, berekening en eventuele afspraak mogelijk te maken.",
  trackingContext: "lp_autobedrijven_ai_medewerker"
};

export const marketingFunnels = { autobedrijven: autoDealerFunnel } as const;
import { publicRuntime } from "../config/publicRuntime";
