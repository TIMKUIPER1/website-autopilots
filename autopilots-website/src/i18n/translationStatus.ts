import { supportedLocales, type SupportedLocale } from "./languages";
import { routeFamilies } from "./routes";

export type TranslationState = "source" | "auto-translated" | "qa-passed" | "native-review-required" | "review-required" | "approved" | "stale" | "missing";
export type TranslationRecord = { contentId:string; locale:SupportedLocale; sourceHash:string; translatedFromHash:string | null; status:TranslationState };

export function stableHash(value:string) {
  let hash = 2166136261;
  for (let index=0; index<value.length; index+=1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash,16777619); }
  return `fnv1a-${(hash>>>0).toString(16).padStart(8,"0")}`;
}

export const translationStatus: TranslationRecord[] = routeFamilies.flatMap(family => {
  const sourceHash = stableHash(`${family.id}:${family.segments.nl}:source-v1`);
  return supportedLocales.map(({code}) => ({
    contentId:family.id,
    locale:code,
    sourceHash,
    translatedFromHash:code === "nl" ? null : sourceHash,
    status:code === "nl" ? "source" : family.indexable === false ? "review-required" : "qa-passed"
  }));
});

export function translationStatusFor(contentId:string, locale:SupportedLocale) {
  return translationStatus.find(item=>item.contentId===contentId && item.locale===locale);
}

export function isIndexableTranslation(contentId:string, locale:SupportedLocale) {
  const status = translationStatusFor(contentId, locale)?.status;
  return status === "source" || status === "approved" || status === "qa-passed";
}
