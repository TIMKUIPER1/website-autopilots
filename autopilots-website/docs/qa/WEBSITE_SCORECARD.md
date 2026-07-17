# Website scorecard — post-repair

Datum: 16 juli 2026  
Totaal: **86/100**  
Status: **READY AFTER EXTERNAL CONFIGURATION**

| Categorie | Score | Max | Bewijs |
|---|---:|---:|---|
| Development en technische kwaliteit | 22 | 25 | build, typecheck, lint, formatter, unit/integratie/E2E, CI |
| SEO | 18 | 20 | één `/nl/`-architectuur, canonicals, hreflang, sitemap, 48 redirects |
| UX/design | 18 | 20 | rijke bestaande pagina’s behouden; desktop en mobiel zonder overflow |
| CRO | 12 | 15 | afspraak, fallback, bestelroute, context en vaste checkoutconfiguraties |
| Performance | 8 | 10 | Lighthouse performance 72–99; de externe kalender verklaart de laagste meting |
| Accessibility | 4 | 5 | axe + Lighthouse 96–100; menselijke screenreaderreview resteert |
| Launch readiness | 4 | 5 | Netlifyarchitectuur, runbooks, environment gate; externe secrets/test vereist |
| **Totaal** | **86** | **100** | Nederlandse codebasis gereed; live integraties nog extern te valideren |

De score is bewust begrensd: zonder Netlify/GHL/Stripe-accounttoegang zijn live leads, bookings en payments niet als `VERIFIED_LIVE` aan te merken.
