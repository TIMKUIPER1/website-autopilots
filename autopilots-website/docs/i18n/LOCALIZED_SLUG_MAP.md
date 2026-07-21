# Localized slug map

`src/i18n/routes.ts` is the single source of truth for every locale URL. It contains one stable content ID and one slug for NL, EN, ES, DE, IT and FR. Product, industry, article, funnel, experience and proposal URLs are generated from this map.

Do not construct translated URLs manually. Use `localizedPath(contentId, locale)` and add a redirect when a published slug changes.
