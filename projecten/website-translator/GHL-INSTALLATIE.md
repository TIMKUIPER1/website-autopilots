# Autopilots Website Translator in GHL

Een iframe alleen mag de bovenliggende GHL-pagina niet direct aanpassen. Daarom bestaat de vertaler uit twee delen:

1. De Autopilots taalkiezer als iframe.
2. Een klein script op dezelfde GHL-pagina dat de vertaling uitvoert.

## 1. Plaats deze iframe waar de taalkiezer moet komen

```html
<iframe
  src="https://timkuiper1.github.io/website-autopilots/projecten/website-translator/autopilots-website-translator-ghl-embed.html"
  style="width:100%;border:0;height:86px;display:block;overflow:hidden;"
  scrolling="no"
  loading="lazy">
</iframe>
```

## 2. Plaats dit script één keer op dezelfde GHL-pagina

```html
<div id="google_translate_element" style="position:absolute;left:-9999px;top:-9999px;"></div>

<script>
  function googleTranslateElementInit() {
    new google.translate.TranslateElement({
      pageLanguage: 'nl',
      includedLanguages: 'nl,en,de,fr,es,it,pt,pl,tr,ar,zh-CN,hi,id,ru,uk',
      autoDisplay: false
    }, 'google_translate_element');
  }

  (function () {
    function setCookie(name, value, days) {
      var expires = '';
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
      }
      document.cookie = name + '=' + value + expires + '; path=/';
    }

    window.addEventListener('message', function (event) {
      if (!event.data || event.data.type !== 'ap_translate_website') return;

      var lang = event.data.language || 'nl';
      if (lang === 'nl') {
        setCookie('googtrans', '/nl/nl', -1);
      } else {
        setCookie('googtrans', '/nl/' + lang, 365);
      }

      window.location.reload();
    });
  })();
</script>

<script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
```

## Talen

- Netherlands
- English
- German
- French
- Spanish
- Italian
- Portuguese
- Polish
- Turkish
- Arabic
- Chinese
- Hindi
- Indonesian
- Russian
- Ukrainian

