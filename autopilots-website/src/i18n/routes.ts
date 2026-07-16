import { supportedLocales, type SupportedLocale } from "./languages";

export type ContentType = "page" | "product" | "niche" | "article";
export type LocalizedSegments = Record<SupportedLocale, string>;
export type RouteFamily = { id: string; type: ContentType; segments: LocalizedSegments; indexable?: boolean };

const page = (id: string, segments: LocalizedSegments, indexable = true): RouteFamily => ({ id, type: "page", segments, indexable });
const entity = (type: Exclude<ContentType, "page">, id: string, segments: LocalizedSegments): RouteFamily => ({ id: `${type}.${id}`, type, segments, indexable: true });

const generalRoutes: RouteFamily[] = [
  page("page.home", { nl: "", en: "", es: "", de: "", it: "", fr: "" }),
  page("page.products", { nl: "producten", en: "products", es: "productos", de: "produkte", it: "prodotti", fr: "produits" }),
  page("page.niches", { nl: "voor-wie", en: "industries", es: "sectores", de: "branchen", it: "settori", fr: "secteurs" }),
  page("page.process", { nl: "proces", en: "process", es: "proceso", de: "prozess", it: "processo", fr: "processus" }),
  page("page.crew", { nl: "crew", en: "team", es: "equipo", de: "team", it: "team", fr: "equipe" }),
  page("page.knowledge", { nl: "kennisbank", en: "knowledge", es: "conocimientos", de: "wissen", it: "conoscenza", fr: "connaissances" }),
  page("page.knowledge.ai", { nl: "kennisbank/ai", en: "knowledge/ai", es: "conocimientos/ia", de: "wissen/ki", it: "conoscenza/ai", fr: "connaissances/ia" }),
  page("page.knowledge.autopilots", { nl: "kennisbank/autopilots", en: "knowledge/autopilots", es: "conocimientos/autopilots", de: "wissen/autopilots", it: "conoscenza/autopilots", fr: "connaissances/autopilots" }),
  page("page.appointment", { nl: "afspraak", en: "book-a-call", es: "cita", de: "termin", it: "appuntamento", fr: "rendez-vous" }),
  page("page.order", { nl: "bestel-direct", en: "order", es: "pedido", de: "direkt-bestellen", it: "ordina", fr: "commander" }),
  page("page.contact", { nl: "contact", en: "contact", es: "contacto", de: "kontakt", it: "contatti", fr: "contact" }),
  page("page.privacy", { nl: "privacy", en: "privacy", es: "privacidad", de: "datenschutz", it: "privacy", fr: "confidentialite" }),
  page("page.terms", { nl: "voorwaarden", en: "terms", es: "condiciones", de: "bedingungen", it: "condizioni", fr: "conditions" })
];

const productRoutes: RouteFamily[] = [
  entity("product", "ai-inboxmedewerker", { nl: "producten/ai-inboxmedewerker", en: "products/ai-inbox-agent", es: "productos/agente-bandeja-ia", de: "produkte/ki-postfachassistent", it: "prodotti/assistente-inbox-ai", fr: "produits/assistant-messagerie-ia" }),
  entity("product", "ai-leadopvolger", { nl: "producten/ai-leadopvolger", en: "products/ai-lead-follow-up", es: "productos/seguimiento-leads-ia", de: "produkte/ki-lead-nachverfolgung", it: "prodotti/follow-up-lead-ai", fr: "produits/suivi-leads-ia" }),
  entity("product", "ai-telefoniste", { nl: "producten/ai-telefoniste", en: "products/ai-receptionist", es: "productos/recepcionista-ia", de: "produkte/ki-telefonassistent", it: "prodotti/receptionist-ai", fr: "produits/standardiste-ia" }),
  entity("product", "autopilots-crm", { nl: "producten/autopilots-crm", en: "products/autopilots-crm", es: "productos/autopilots-crm", de: "produkte/autopilots-crm", it: "prodotti/autopilots-crm", fr: "produits/autopilots-crm" }),
  entity("product", "leadsmachine-ai", { nl: "producten/leadsmachine-ai", en: "products/ai-lead-engine", es: "productos/motor-leads-ia", de: "produkte/ki-leadmaschine", it: "prodotti/macchina-lead-ai", fr: "produits/machine-leads-ia" })
];

const nicheSegments: Record<string, LocalizedSegments> = {
  autobedrijven: { nl: "autobedrijven", en: "car-dealerships", es: "concesionarios-automoviles", de: "autohaeuser", it: "concessionarie-auto", fr: "concessions-automobiles" },
  dakdekkers: { nl: "dakdekkers", en: "roofing-companies", es: "empresas-cubiertas", de: "dachdecker", it: "imprese-coperture", fr: "couvreurs" },
  hoveniers: { nl: "hoveniers", en: "landscapers", es: "paisajistas", de: "gartenbau", it: "paesaggisti", fr: "paysagistes" },
  installatietechniek: { nl: "installatietechniek", en: "installation-companies", es: "empresas-instaladoras", de: "installationsbetriebe", it: "imprese-impiantistiche", fr: "entreprises-installation" },
  vastgoedbeheerders: { nl: "vastgoedbeheerders", en: "property-managers", es: "administradores-inmobiliarios", de: "immobilienverwaltungen", it: "gestori-immobiliari", fr: "gestionnaires-immobiliers" },
  kapperszaken: { nl: "kapperszaken", en: "hair-salons", es: "peluquerias", de: "friseursalons", it: "saloni-parrucchieri", fr: "salons-coiffure" },
  tandartsen: { nl: "tandartsen", en: "dentists", es: "dentistas", de: "zahnaerzte", it: "dentisti", fr: "dentistes" },
  makelaars: { nl: "makelaars", en: "estate-agents", es: "agentes-inmobiliarios", de: "immobilienmakler", it: "agenti-immobiliari", fr: "agents-immobiliers" },
  "cosmetische-klinieken": { nl: "cosmetische-klinieken", en: "cosmetic-clinics", es: "clinicas-esteticas", de: "kosmetische-kliniken", it: "cliniche-estetiche", fr: "cliniques-esthetiques" },
  verzekeraars: { nl: "verzekeraars", en: "insurers", es: "aseguradoras", de: "versicherer", it: "assicurazioni", fr: "assureurs" },
  glaszetters: { nl: "glaszetters", en: "glaziers", es: "cristaleros", de: "glaser", it: "vetrai", fr: "vitriers" },
  hotels: { nl: "hotels", en: "hotels", es: "hoteles", de: "hotels", it: "hotel", fr: "hotels" },
  restaurants: { nl: "restaurants", en: "restaurants", es: "restaurantes", de: "restaurants", it: "ristoranti", fr: "restaurants" },
  evenementen: { nl: "evenementen", en: "events", es: "eventos", de: "veranstaltungen", it: "eventi", fr: "evenements" },
  kozijnen: { nl: "kozijnen", en: "window-frame-companies", es: "empresas-ventanas", de: "fensterbauer", it: "serramentisti", fr: "fabricants-fenetres" },
  zonnepanelen: { nl: "zonnepanelen", en: "solar-installers", es: "instaladores-solares", de: "solarbetriebe", it: "installatori-fotovoltaici", fr: "installateurs-solaires" },
  vloerenleggers: { nl: "vloerenleggers", en: "flooring-installers", es: "instaladores-suelos", de: "bodenleger", it: "posatori-pavimenti", fr: "poseurs-sols" },
  woningcorporaties: { nl: "woningcorporaties", en: "housing-associations", es: "empresas-vivienda", de: "wohnungsbaugesellschaften", it: "enti-edilizia-sociale", fr: "bailleurs-sociaux" },
  "non-profit": { nl: "non-profit", en: "nonprofits", es: "organizaciones-sin-animo-lucro", de: "gemeinnuetzige-organisationen", it: "organizzazioni-non-profit", fr: "associations" },
  dierenarts: { nl: "dierenarts", en: "veterinarians", es: "veterinarios", de: "tieraerzte", it: "veterinari", fr: "veterinaires" },
  dierenverzorging: { nl: "dierenverzorging", en: "pet-care", es: "cuidado-mascotas", de: "tierpflege", it: "cura-animali", fr: "soins-animaliers" }
};

const nichePrefixes: Record<SupportedLocale, string> = { nl: "voor-wie", en: "industries", es: "sectores", de: "branchen", it: "settori", fr: "secteurs" };
const nicheRoutes = Object.entries(nicheSegments).map(([id, slugs]) => entity("niche", id, Object.fromEntries(supportedLocales.map(({ code }) => [code, `${nichePrefixes[code]}/${slugs[code]}`])) as LocalizedSegments));

const articleSegments: Record<string, LocalizedSegments> = {
  "wat-is-een-ai-medewerker": { nl: "wat-is-een-ai-medewerker", en: "what-is-an-ai-employee", es: "que-es-un-empleado-ia", de: "was-ist-ein-ki-mitarbeiter", it: "cos-e-un-collaboratore-ai", fr: "qu-est-ce-qu-un-collaborateur-ia" },
  "wat-is-een-ai-telefoniste": { nl: "wat-is-een-ai-telefoniste", en: "what-is-an-ai-receptionist", es: "que-es-una-recepcionista-ia", de: "was-ist-ein-ki-telefonassistent", it: "cos-e-un-receptionist-ai", fr: "qu-est-ce-qu-un-standardiste-ia" },
  "chatbot-voicebot-ai-medewerker-verschil": { nl: "chatbot-voicebot-ai-medewerker-verschil", en: "chatbot-voicebot-or-ai-employee", es: "chatbot-voicebot-o-empleado-ia", de: "chatbot-voicebot-oder-ki-mitarbeiter", it: "chatbot-voicebot-o-collaboratore-ai", fr: "chatbot-voicebot-ou-collaborateur-ia" },
  "wat-is-ai-leadopvolging": { nl: "wat-is-ai-leadopvolging", en: "what-is-ai-lead-follow-up", es: "que-es-el-seguimiento-de-leads-con-ia", de: "was-ist-ki-lead-nachverfolgung", it: "cos-e-il-follow-up-lead-con-ai", fr: "qu-est-ce-que-le-suivi-de-leads-par-ia" },
  "hoe-snel-nieuwe-lead-opvolgen": { nl: "hoe-snel-nieuwe-lead-opvolgen", en: "how-fast-should-you-follow-up-a-lead", es: "cuanto-tardar-en-contactar-un-lead", de: "wie-schnell-leads-nachfassen", it: "quanto-velocemente-contattare-un-lead", fr: "dans-quel-delai-relancer-un-lead" },
  "roi-automatische-leadopvolging-berekenen": { nl: "roi-automatische-leadopvolging-berekenen", en: "calculate-roi-automated-lead-follow-up", es: "calcular-roi-seguimiento-automatico-leads", de: "roi-automatisierte-lead-nachverfolgung-berechnen", it: "calcolare-roi-follow-up-automatico-lead", fr: "calculer-roi-suivi-automatise-leads" },
  "ai-email-whatsapp-websitechat": { nl: "ai-email-whatsapp-websitechat", en: "ai-email-whatsapp-website-chat", es: "ia-email-whatsapp-chat-web", de: "ki-e-mail-whatsapp-website-chat", it: "ai-email-whatsapp-chat-sito", fr: "ia-email-whatsapp-chat-site-web" },
  "hoe-werken-ai-en-crm-samen": { nl: "hoe-werken-ai-en-crm-samen", en: "how-ai-and-crm-work-together", es: "como-funcionan-juntos-ia-y-crm", de: "wie-ki-und-crm-zusammenarbeiten", it: "come-ai-e-crm-lavorano-insieme", fr: "comment-ia-et-crm-fonctionnent-ensemble" },
  "klantcontactprocessen-veilig-automatiseren": { nl: "klantcontactprocessen-veilig-automatiseren", en: "safely-automate-customer-contact", es: "automatizar-atencion-cliente-de-forma-segura", de: "kundenkontakt-sicher-automatisieren", it: "automatizzare-contatto-clienti-in-sicurezza", fr: "automatiser-relation-client-en-securite" },
  "ai-medewerker-implementeren": { nl: "ai-medewerker-implementeren", en: "implement-an-ai-employee", es: "implementar-un-empleado-ia", de: "ki-mitarbeiter-implementieren", it: "implementare-un-collaboratore-ai", fr: "mettre-en-place-un-collaborateur-ia" },
  "verkeerde-ai-antwoorden-hallucinaties-voorkomen": { nl: "verkeerde-ai-antwoorden-hallucinaties-voorkomen", en: "prevent-ai-hallucinations-and-wrong-answers", es: "evitar-alucinaciones-y-respuestas-incorrectas-ia", de: "ki-halluzinationen-und-falsche-antworten-vermeiden", it: "evitare-allucinazioni-e-risposte-errate-ai", fr: "eviter-hallucinations-et-mauvaises-reponses-ia" },
  "menselijke-overdracht-ai-klantcontact": { nl: "menselijke-overdracht-ai-klantcontact", en: "human-handoff-in-ai-customer-contact", es: "transferencia-humana-atencion-cliente-ia", de: "menschliche-uebergabe-im-ki-kundenkontakt", it: "passaggio-umano-nel-contatto-clienti-ai", fr: "transfert-humain-dans-la-relation-client-ia" },
  "ai-avg-geautomatiseerd-klantcontact": { nl: "ai-avg-geautomatiseerd-klantcontact", en: "ai-gdpr-automated-customer-contact", es: "ia-rgpd-atencion-cliente-automatizada", de: "ki-dsgvo-automatisierter-kundenkontakt", it: "ai-gdpr-contatto-clienti-automatizzato", fr: "ia-rgpd-relation-client-automatisee" },
  "ai-act-chatbot-melden-dat-het-ai-is": { nl: "ai-act-chatbot-melden-dat-het-ai-is", en: "ai-act-disclose-chatbot-is-ai", es: "ley-ia-informar-chatbot-inteligencia-artificial", de: "ai-act-chatbot-als-ki-kennzeichnen", it: "ai-act-dichiarare-che-chatbot-e-ai", fr: "ai-act-signaler-qu-un-chatbot-est-une-ia" },
  "voice-ai-conversational-ai-ontwikkelingen-2026": { nl: "voice-ai-conversational-ai-ontwikkelingen-2026", en: "voice-ai-conversational-ai-trends-2026", es: "tendencias-voice-ai-ia-conversacional-2026", de: "voice-ai-conversational-ai-trends-2026", it: "tendenze-voice-ai-ai-conversazionale-2026", fr: "tendances-voice-ai-ia-conversationnelle-2026" }
};

const knowledgePrefixes: Record<SupportedLocale, string> = { nl: "kennisbank", en: "knowledge", es: "conocimientos", de: "wissen", it: "conoscenza", fr: "connaissances" };
const articleRoutes = Object.entries(articleSegments).map(([id, slugs]) => entity("article", id, Object.fromEntries(supportedLocales.map(({ code }) => [code, `${knowledgePrefixes[code]}/${slugs[code]}`])) as LocalizedSegments));

export const routeFamilies: RouteFamily[] = [...generalRoutes, ...productRoutes, ...nicheRoutes, ...articleRoutes];

export function localizedPath(contentId: string, locale: SupportedLocale): string {
  const family = routeFamilies.find((item) => item.id === contentId);
  if (!family) throw new Error(`Onbekend content-ID: ${contentId}`);
  const segment = family.segments[locale];
  return `/${locale}/${segment ? `${segment}/` : ""}`;
}

export function contentIdFromPath(pathname: string): string | undefined {
  const clean = pathname.split("?")[0].split("#")[0].replace(/^\/+|\/+$/g, "");
  const [locale, ...rest] = clean.split("/");
  if (!supportedLocales.some((item) => item.code === locale)) return undefined;
  const segment = rest.join("/");
  return routeFamilies.find((item) => item.segments[locale as SupportedLocale] === segment)?.id;
}

export function localizedAlternates(contentId: string) {
  return supportedLocales.map((locale) => ({ locale: locale.code, tag: locale.tag, href: localizedPath(contentId, locale.code) }));
}

export function routeFamily(contentId: string) {
  return routeFamilies.find((item) => item.id === contentId);
}
