# Autopilots voorstellen

Deze map bevat de proposal embeds die vanuit GitHub Pages in GoHighLevel kunnen draaien.

## Werkwijze

1. Pas in Codex het bestand met `bron.html` aan.
2. Zet dezelfde wijziging door naar het bijbehorende `ghl-embed.html` bestand.
3. Commit en push naar GitHub.
4. GoHighLevel laadt automatisch de nieuwste versie via dezelfde iframe URL.

## Voorstellen

- AI Sales Chat: `voorstellen/ai-sales-chat/autopilots-ai-sales-chat-voorstel-ghl-embed.html`
- AI Sales Voice: `voorstellen/ai-sales-voice/autopilots-ai-sales-voice-voorstel-ghl-embed.html`
- AI Sales Complete: `voorstellen/ai-sales-complete/autopilots-ai-sales-complete-voorstel-ghl-embed.html`
- Leadsmachine AI: `voorstellen/leadsmachine-ai/autopilots-leadsmachine-ai-voorstel-ghl-embed.html`

## GHL iframe voorbeeld

Vervang `GITHUB_GEBRUIKER` en `REPO_NAAM` door jullie GitHub Pages URL.

```html
<iframe
  src="https://GITHUB_GEBRUIKER.github.io/REPO_NAAM/voorstellen/ai-sales-chat/autopilots-ai-sales-chat-voorstel-ghl-embed.html"
  style="width:100%;border:0;min-height:1200px;display:block;"
  loading="lazy">
</iframe>
```
