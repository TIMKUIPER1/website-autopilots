import type { ProductSlug } from "./products";

export type PricingPackageSlug = ProductSlug | "complete-ai-medewerker";

export interface NichePricingPackage {
  slug: PricingPackageSlug;
  product?: ProductSlug;
  name: string;
  badge: string;
  setupPrice: number;
  monthlyPrice: number;
  usagePricing: string;
  currency: "EUR";
  included: string[];
  directCheckoutAvailable: boolean;
  buyButtonId?: string;
  proposalUrl?: string;
  sourceFile: string;
  lastVerifiedAt: string;
}

const fieldServiceNiches = new Set([
  "dakdekkers", "hoveniers", "installatietechniek", "vastgoedbeheerders", "glaszetters",
  "kozijnen", "zonnepanelen", "vloerenleggers", "woningcorporaties"
]);

const checkoutIds: Partial<Record<PricingPackageSlug, string>> = {
  "ai-inboxmedewerker": "buy_btn_1TsqAzQbNJoBxwDUEQ168YOB",
  "ai-telefoniste": "buy_btn_1Tsq86QbNJoBxwDUM4eEvgeu",
  "ai-leadopvolger": "buy_btn_1Tsq9aQbNJoBxwDUEdDfap6f",
  "complete-ai-medewerker": "buy_btn_1Tsq3RQbNJoBxwDUuV4vFUVJ"
};

const packageDefinitions = [
  {
    slug: "ai-inboxmedewerker" as const, product: "ai-inboxmedewerker" as const, name: "AI Inboxmedewerker", badge: "Inbox",
    monthlyPrice: 399, standardSetup: 1850, fieldSetup: 2850,
    usagePricing: "Inbound chat €0,02 per bericht en outbound chat €0,22 per bericht.",
    included: ["WhatsApp, e-mail en websitevragen", "Branchespecifieke intake", "Samenvatting en overdracht", "Kennisbasis en tone of voice"]
  },
  {
    slug: "ai-telefoniste" as const, product: "ai-telefoniste" as const, name: "AI Telefoniste", badge: "Telefonie",
    monthlyPrice: 479, standardSetup: 2450, fieldSetup: 3450,
    usagePricing: "Inbound bellen €0,19 per minuut en outbound bellen €0,22 per minuut.",
    included: ["Inkomende oproepen", "Belscript en kwalificatie", "Urgentie en menselijke fallback", "Gespreksnotitie naar het team"]
  },
  {
    slug: "ai-leadopvolger" as const, product: "ai-leadopvolger" as const, name: "AI Leadopvolger", badge: "Leadopvolging",
    monthlyPrice: 559, standardSetup: 2950, fieldSetup: 3950,
    usagePricing: "Inbound chat €0,02 per bericht en outbound chat €0,22 per bericht.",
    included: ["Nieuwe leads actief opvolgen", "Vaste opvolgsequenties", "Afspraak of terugbelmoment", "Status en vervolgstap vastleggen"]
  },
  {
    slug: "complete-ai-medewerker" as const, name: "Volledige AI Medewerker", badge: "Beste waarde",
    monthlyPrice: 849, standardSetup: 4350, fieldSetup: 5350,
    usagePricing: "Chat- en belusage worden afgerekend volgens de gebruikte kanalen.",
    included: ["Inbox, telefonie en leadopvolging", "Agenda, CRM en overdracht", "Menselijke fallback", "Monitoring en optimalisatie"]
  }
];

export function getNichePricing(niche: string): NichePricingPackage[] {
  const fieldService = fieldServiceNiches.has(niche);
  const sourceFile = `voorstellen/ai-sales-complete-${niche}/autopilots-ai-sales-complete-${niche}-voorstel-bron.html`;
  return packageDefinitions.map((item) => {
    const directCheckoutAvailable = niche === "autobedrijven" && item.slug !== "complete-ai-medewerker";
    return {
      slug: item.slug,
      product: "product" in item ? item.product : undefined,
      name: item.name,
      badge: item.badge,
      setupPrice: fieldService ? item.fieldSetup : item.standardSetup,
      monthlyPrice: item.monthlyPrice,
      usagePricing: item.usagePricing,
      currency: "EUR",
      included: item.included,
      directCheckoutAvailable,
      buyButtonId: directCheckoutAvailable ? checkoutIds[item.slug] : undefined,
      proposalUrl: directCheckoutAvailable ? `/voorstel/autobedrijven/?product=${item.slug}` : undefined,
      sourceFile,
      lastVerifiedAt: "2026-07-15"
    };
  });
}

export const crmPricing = [
  { name: "CRM Start", monthlyPrice: 95, setupPrice: 950 },
  { name: "CRM Scale", monthlyPrice: 160, setupPrice: 1450 },
  { name: "CRM Premium", monthlyPrice: 260, setupPrice: 2450 }
] as const;

export const leadsmachinePricing = [
  { name: "Leadsmachine Start", monthlyPrice: 1850, setupPrice: 3950 },
  { name: "Leadsmachine Scale", monthlyPrice: 2795, setupPrice: 5590 },
  { name: "Leadsmachine Premium", monthlyPrice: 3999, setupPrice: 8599 }
] as const;
