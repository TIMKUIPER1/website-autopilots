export const supportedLocales = [
  { code: "nl", tag: "nl-NL", og: "nl_NL", name: "Nederlands", market: "Nederland", path: "/nl/" },
  { code: "en", tag: "en-GB", og: "en_GB", name: "English", market: "United Kingdom", path: "/en/" },
  { code: "es", tag: "es-ES", og: "es_ES", name: "Español", market: "España", path: "/es/" },
  { code: "de", tag: "de-DE", og: "de_DE", name: "Deutsch", market: "Deutschland", path: "/de/" },
  { code: "it", tag: "it-IT", og: "it_IT", name: "Italiano", market: "Italia", path: "/it/" },
  { code: "fr", tag: "fr-FR", og: "fr_FR", name: "Français", market: "France", path: "/fr/" }
] as const;

export type SupportedLocale = (typeof supportedLocales)[number]["code"];
export type SupportedLocaleTag = (typeof supportedLocales)[number]["tag"];

export const defaultLocale: SupportedLocale = "nl";
export const sourceLocaleTag: SupportedLocaleTag = "nl-NL";

export function isSupportedLocale(value: string | undefined): value is SupportedLocale {
  return Boolean(value && supportedLocales.some((locale) => locale.code === value));
}

export function getLocale(code: SupportedLocale) {
  return supportedLocales.find((locale) => locale.code === code)!;
}

export function getLocaleFromPath(pathname: string): SupportedLocale | undefined {
  const segment = pathname.split("/").filter(Boolean)[0];
  return isSupportedLocale(segment) ? segment : undefined;
}
