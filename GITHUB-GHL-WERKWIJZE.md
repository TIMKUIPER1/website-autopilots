# GitHub + GHL Werkwijze

Doel: niet meer handmatig embedcode kopieren en plakken na elke wijziging.

## Eenmalig instellen

1. Maak een GitHub repository aan, bijvoorbeeld `autopilots-website-embeds`.
2. Zet GitHub Pages aan:
   - Settings
   - Pages
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
3. Push deze map naar GitHub.
4. Gebruik de live GitHub Pages URL in GoHighLevel.

## Daarna aanpassen

Je zegt in Codex bijvoorbeeld:

`Pas de kozijnenpagina aan: maak de hero rustiger en wijzig de CTA.`

Codex past het bestand aan. Daarna committen/pushen we de wijziging naar GitHub. GHL laadt automatisch de nieuwste versie via dezelfde iframe URL.

## Welke bestanden gebruik je in GHL?

Gebruik bij voorkeur de bestanden met `ghl-embed.html` in de naam. Die zijn bedoeld om direct in GoHighLevel te draaien.

Voorbeelden:

- Homepage: `projecten/homepage/autopilots-homepage-ghl-embed.html`
- Voice AI: `projecten/voice/autopilots-voice-ghl-embed.html`
- Chat AI: `projecten/chat/autopilots-chat-ghl-embed.html`
- Planning AI: `projecten/planning/autopilots-planning-ghl-embed.html`
- Leadsmachine AI: `projecten/leadsmachine-ai/autopilots-leadsmachine-ai-ghl-embed.html`
- Kozijnen: `niche-landing-pages/kozijnen/autopilots-kozijnen-landing-ghl-embed.html`

## Iframe voorbeeld

Vervang `GITHUB_GEBRUIKER` en `REPO_NAAM` door de echte GitHub Pages URL:

```html
<iframe
  src="https://GITHUB_GEBRUIKER.github.io/REPO_NAAM/niche-landing-pages/kozijnen/autopilots-kozijnen-landing-ghl-embed.html"
  style="width:100%;border:0;min-height:1000px;display:block;"
  loading="lazy">
</iframe>
```

## Cache-tip

Als GHL of je browser een oude versie blijft tonen, voeg tijdelijk een versie toe:

`?v=2026-06-09-1`

Bijvoorbeeld:

```html
<iframe src="https://GITHUB_GEBRUIKER.github.io/REPO_NAAM/projecten/homepage/autopilots-homepage-ghl-embed.html?v=2026-06-09-1"></iframe>
```

