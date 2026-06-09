# Autopilots Website Embeds

Deze repository bevat de statische Autopilots landingspagina's en GHL embedpagina's.

## Werkwijze

1. Pas de pagina aan in Codex.
2. Controleer lokaal de HTML-pagina.
3. Commit en push naar GitHub.
4. GitHub Pages publiceert automatisch de nieuwste versie.
5. In GoHighLevel gebruik je alleen nog een iframe naar de gepubliceerde pagina.

## Belangrijkste mappen

- `projecten/` - hoofdlandingspagina's zoals homepage, voice, chat, planning, support en contact.
- `niche-landing-pages/` - alle nichepagina's.
- `agent-service-pages/` - servicepagina's voor losse AI agents.
- `shared-sections/` - gedeelde secties zoals team, systemen en megamenu's.

## GitHub Pages

Publiceer vanuit de `main` branch met root als Pages source.

Voorbeeld URL:

`https://GITHUB_GEBRUIKER.github.io/REPO_NAAM/projecten/homepage/autopilots-homepage-ghl-embed.html`

In GHL plaats je daarna:

```html
<iframe src="https://GITHUB_GEBRUIKER.github.io/REPO_NAAM/projecten/homepage/autopilots-homepage-ghl-embed.html" style="width:100%;border:0;min-height:900px;"></iframe>
```

