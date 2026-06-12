export const supportedLocales = [
  { code: "nl", name: "Nederlands", market: "Netherlands", path: "/nl/" },
  { code: "en", name: "English", market: "International", path: "/en/" },
  { code: "de", name: "Deutsch", market: "Germany", path: "/de/" },
  { code: "fr", name: "Francais", market: "France", path: "/fr/" },
  { code: "es", name: "Espanol", market: "Spain", path: "/es/" },
  { code: "it", name: "Italiano", market: "Italy", path: "/it/" },
  { code: "pt", name: "Portugues", market: "Portugal/Brazil", path: "/pt/" },
  { code: "pl", name: "Polski", market: "Poland", path: "/pl/" },
  { code: "sv", name: "Svenska", market: "Sweden", path: "/sv/" },
  { code: "da", name: "Dansk", market: "Denmark", path: "/da/" },
  { code: "no", name: "Norsk", market: "Norway", path: "/no/" },
  { code: "fi", name: "Suomi", market: "Finland", path: "/fi/" },
  { code: "tr", name: "Turkce", market: "Turkey", path: "/tr/" },
  { code: "ar", name: "Arabic", market: "MENA", path: "/ar/" },
  { code: "id", name: "Bahasa Indonesia", market: "Indonesia", path: "/id/" }
] as const;

export type SupportedLocale = (typeof supportedLocales)[number]["code"];

export const defaultLocale: SupportedLocale = "nl";

export const countryLocaleMap: Record<string, SupportedLocale> = {
  NL: "nl",
  BE: "nl",
  GB: "en",
  US: "en",
  CA: "en",
  AU: "en",
  DE: "de",
  AT: "de",
  CH: "de",
  FR: "fr",
  ES: "es",
  IT: "it",
  PT: "pt",
  BR: "pt",
  PL: "pl",
  SE: "sv",
  DK: "da",
  NO: "no",
  FI: "fi",
  TR: "tr",
  AE: "ar",
  SA: "ar",
  ID: "id"
};

export function isSupportedLocale(value: string | undefined): value is SupportedLocale {
  return Boolean(value && supportedLocales.some((locale) => locale.code === value));
}
