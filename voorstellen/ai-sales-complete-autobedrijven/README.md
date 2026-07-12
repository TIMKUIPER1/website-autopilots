# AI Sales Complete autobedrijven voorstel

Voorstelpagina voor AI Sales Complete specifiek voor autobedrijven.

## Bestanden

- `autopilots-ai-sales-complete-autobedrijven-voorstel-bron.html`
- `autopilots-ai-sales-complete-autobedrijven-voorstel-ghl-embed.html`
- `autopilots-ai-sales-complete-autobedrijven-demo.html`

## GHL iframe

```html
<iframe
  src="https://timkuiper1.github.io/website-autopilots/voorstellen/ai-sales-complete-autobedrijven/autopilots-ai-sales-complete-autobedrijven-voorstel-ghl-embed.html"
  style="width:100%;border:0;min-height:2200px;display:block;"
  allow="microphone; autoplay; clipboard-write"
  loading="lazy">
</iframe>
```

Let op: zonder `allow="microphone"` kan de ElevenLabs voice widget in een iframe een `Permission denied` melding geven.

## Demo pagina

```html
<iframe
  src="https://timkuiper1.github.io/website-autopilots/voorstellen/ai-sales-complete-autobedrijven/autopilots-ai-sales-complete-autobedrijven-demo.html"
  style="width:100%;border:0;min-height:1100px;display:block;"
  allow="microphone; autoplay; clipboard-write"
  loading="lazy">
</iframe>
```

## Directe widget op de website

Gebruik dit als je de demo niet via een GitHub iframe wilt laden, maar rechtstreeks in een GHL custom HTML blok wilt plaatsen.

```html
<div style="display:grid;gap:14px;max-width:520px;margin:auto;padding:18px;border:1px solid rgba(0,0,0,.1);border-radius:24px;background:#fff;">
  <strong style="font-family:Arial,sans-serif;font-size:22px;">Test de AI demo</strong>
  <p style="font-family:Arial,sans-serif;color:#656565;margin:0;">Kies welke demo je wilt openen. De widget laadt pas na je klik.</p>

  <div style="display:flex;gap:10px;flex-wrap:wrap;">
    <button type="button" data-demo-agent="agent_8301kx8wzxzbfstr2mtyh74taamx" style="border:0;border-radius:999px;background:#9f3826;color:#fff;padding:14px 18px;font-weight:800;cursor:pointer;">AI Telefoniste</button>
    <button type="button" data-demo-agent="agent_7901kxc39kb2er9vmep56v1s5673" style="border:1px solid rgba(0,0,0,.12);border-radius:999px;background:#f8f8f5;color:#111;padding:14px 18px;font-weight:800;cursor:pointer;">AI Inboxmedewerker</button>
  </div>

  <div id="ap-direct-widget" style="min-height:110px;display:grid;place-items:center;border:1px dashed rgba(159,56,38,.35);border-radius:18px;background:rgba(159,56,38,.07);color:#656565;font-family:Arial,sans-serif;font-weight:700;">
    Klik op een demo om de widget te laden.
  </div>
</div>

<script>
  (function () {
    var scriptId = "ap-elevenlabs-convai-widget";
    var mount = document.getElementById("ap-direct-widget");

    function loadScript() {
      if (document.getElementById(scriptId)) return;
      var script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
      script.async = true;
      script.type = "text/javascript";
      document.body.appendChild(script);
    }

    document.querySelectorAll("[data-demo-agent]").forEach(function (button) {
      button.addEventListener("click", function () {
        var agentId = button.getAttribute("data-demo-agent");
        mount.innerHTML = '<elevenlabs-convai agent-id="' + agentId + '"></elevenlabs-convai>';
        loadScript();
      });
    });
  })();
</script>
```
