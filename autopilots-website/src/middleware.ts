import { defineMiddleware } from "astro:middleware";
import { countryLocaleMap, defaultLocale, isSupportedLocale, supportedLocales } from "./i18n/languages";

const localeCodes = supportedLocales.map((locale) => locale.code);

function localeFromAcceptLanguage(header: string | null): string | undefined {
  if (!header) return undefined;

  const candidates = header
    .split(",")
    .map((part) => part.trim().split(";")[0]?.toLowerCase().split("-")[0])
    .filter(Boolean);

  return candidates.find((candidate) => localeCodes.includes(candidate));
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (pathname !== "/") {
    return next();
  }

  const cookieLocale = context.cookies.get("ap_locale")?.value;
  if (isSupportedLocale(cookieLocale)) {
    return context.redirect(`/${cookieLocale}/`, 302);
  }

  const country =
    context.request.headers.get("x-vercel-ip-country") ||
    context.request.headers.get("cf-ipcountry") ||
    context.request.headers.get("x-country-code");

  const countryLocale = country ? countryLocaleMap[country.toUpperCase()] : undefined;
  if (countryLocale) {
    return context.redirect(`/${countryLocale}/`, 302);
  }

  const browserLocale = localeFromAcceptLanguage(context.request.headers.get("accept-language"));
  if (isSupportedLocale(browserLocale)) {
    return context.redirect(`/${browserLocale}/`, 302);
  }

  return context.redirect(`/${defaultLocale}/`, 302);
});
