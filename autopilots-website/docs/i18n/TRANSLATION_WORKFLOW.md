# Translation workflow

1. Wijzig de Nederlandse bron en verhoog de bronversie.
2. Genereer een nieuw `sourceHash`; afwijkende bestaande vertalingen worden `stale`.
3. Vertaal met `I18N_PROVIDER=deepl` of `I18N_PROVIDER=openai`. Sleutels komen alleen uit omgevingsvariabelen.
4. Bescherm termen en placeholders via `content/i18n/glossary.json`.
5. Zet nieuwe vertalingen op `review-required`.
6. Laat een native reviewer inhoud, commerciële claims, lokale terminologie, SEO en CTA's controleren.
7. Zet pas daarna op `approved` en neem de route op in sitemap en interne navigatie.
8. Draai build, `i18n:validate`, linkcontrole en responsive QA.

`i18n:validate:strict` blokkeert publicatie zolang openstaande vertalingen of reviews bestaan.
