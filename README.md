# Autopilots website en embeds

`autopilots-website` is de enige bron van waarheid voor de hoofdwebsite op
`https://auto-pilots.io`. Netlify publiceert de hoofdwebsite uitsluitend vanuit
die map.

De statische pagina's in de repositoryroot zijn legacy GHL-embeds. GitHub Pages
publiceert deze nooit meer automatisch bij een gewone push.

## Werkwijze

1. Vraag Codex om de wijziging uit te voeren.
2. Codex werkt op een aparte branch, niet rechtstreeks op `main`.
3. Codex controleert de volledige website en opent een pull request.
4. Merge uitsluitend wanneer de verplichte releasecheck groen is.
5. Netlify publiceert daarna `autopilots-website` vanaf de beschermde `main`.

## Belangrijkste mappen

- `projecten/` - hoofdlandingspagina's zoals homepage, voice, chat, planning, support en contact.
- `voorstellen/` - proposal embeds zoals AI Sales Chat, AI Sales Voice, AI Sales Complete en Leadsmachine AI.
- `niche-landing-pages/` - alle nichepagina's.
- `agent-service-pages/` - servicepagina's voor losse AI agents.
- `shared-sections/` - gedeelde secties zoals team, systemen en megamenu's.

## GitHub Pages legacy embeds

GitHub Pages is alleen voor bestaande legacy embeds. Publicatie kan uitsluitend
handmatig vanaf de actuele `main`-branch en staat los van `auto-pilots.io`.
Nieuwe hoofdwebsitepagina's mogen hier niet worden toegevoegd.

Voorbeeld URL:

`https://GITHUB_GEBRUIKER.github.io/REPO_NAAM/projecten/homepage/autopilots-homepage-ghl-embed.html`

In GHL plaats je daarna:

```html
<iframe src="https://GITHUB_GEBRUIKER.github.io/REPO_NAAM/projecten/homepage/autopilots-homepage-ghl-embed.html" style="width:100%;border:0;min-height:900px;"></iframe>
```
