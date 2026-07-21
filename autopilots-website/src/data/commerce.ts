import type { ProductSlug } from "./products";
import { publicRuntime } from "../config/publicRuntime";

export interface DirectOffer {
  product: ProductSlug;
  monthly: number;
  implementation: number;
  buyButtonId: string;
  usage: string;
}

export interface NicheCommerce {
  proposalPath: string;
  offers: Partial<Record<ProductSlug, DirectOffer>>;
}

export const commerceByNiche: Record<string, NicheCommerce> = {
  autobedrijven: {
    proposalPath: "/voorstel/autobedrijven/",
    offers: {
      "ai-inboxmedewerker": {
        product: "ai-inboxmedewerker",
        monthly: 399,
        implementation: 1850,
        buyButtonId: "buy_btn_1TsqAzQbNJoBxwDUEQ168YOB",
        usage: "Inbound chat €0,02 per bericht en outbound chat €0,22 per bericht."
      },
      "ai-telefoniste": {
        product: "ai-telefoniste",
        monthly: 479,
        implementation: 2450,
        buyButtonId: "buy_btn_1Tsq86QbNJoBxwDUM4eEvgeu",
        usage: "Inbound bellen €0,19 per minuut en outbound bellen €0,22 per minuut."
      },
      "ai-leadopvolger": {
        product: "ai-leadopvolger",
        monthly: 559,
        implementation: 2950,
        buyButtonId: "buy_btn_1Tsq9aQbNJoBxwDUEdDfap6f",
        usage: "Inbound chat €0,02 per bericht en outbound chat €0,22 per bericht."
      }
    }
  }
};

export const getDirectOffer = (niche: string, product: ProductSlug) => commerceByNiche[niche]?.offers[product];

export const getOrderDestination = (niche: string, product: ProductSlug) => {
  const commerce = commerceByNiche[niche];
  if (commerce?.offers[product]) return `${commerce.proposalPath}?product=${product}`;
  return `/nl/afspraak/?route=bestellen&branche=${encodeURIComponent(niche)}&product=${encodeURIComponent(product)}`;
};

export const stripeKey = publicRuntime.stripePublishableKey;
