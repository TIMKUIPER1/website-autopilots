# International SEO architecture

Iedere locale heeft een eigen URL, self-canonical, volledige reciproque hreflang-set (`nl-NL`, `en-GB`, `es-ES`, `de-DE`, `it-IT`, `fr-FR`) en x-default naar `/`. De sitemapindex verwijst naar zes locale-sitemaps. Locale-sitemaps bevatten alleen de nu gegenereerde 39 routefamilies; ontbrekende artikelen blijven bewust uitgesloten.

Metadata, OG-locale, structured-data-taal en interne links komen uit dezelfde locale-context. Runtime taalkeuze gebruikt geen automatische 301 of IP-redirect. Een browsertaal mag hoogstens een suggestie geven. Oude routes krijgen pas een 301 wanneer contentpariteit en redirects zijn getest, om verlies van sterke bestaande content te voorkomen.

Voor productie: valideer reciprocal hreflang, indexeerbaarheid, responsecodes, canonicals, redirects en sitemapdekking met een crawler en Search Console per property/markt.
