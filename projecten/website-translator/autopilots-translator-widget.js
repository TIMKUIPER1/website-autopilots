(function () {
  if (window.__autopilotsTranslatorLoaded) return;
  window.__autopilotsTranslatorLoaded = true;

  var languages = [
    { code: "nl", label: "Netherlands" },
    { code: "en", label: "English" },
    { code: "de", label: "German" },
    { code: "fr", label: "French" },
    { code: "es", label: "Spanish" },
    { code: "it", label: "Italian" },
    { code: "pt", label: "Portuguese" },
    { code: "pl", label: "Polish" },
    { code: "tr", label: "Turkish" },
    { code: "ar", label: "Arabic" },
    { code: "zh-CN", label: "Chinese" },
    { code: "hi", label: "Hindi" },
    { code: "id", label: "Indonesian" },
    { code: "ru", label: "Russian" },
    { code: "uk", label: "Ukrainian" }
  ];

  var storageKey = "ap_preferred_language";
  var includedLanguages = languages.map(function (item) { return item.code; }).join(",");

  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
  }

  function getSavedLanguage() {
    try {
      return localStorage.getItem(storageKey) || "nl";
    } catch (error) {
      return "nl";
    }
  }

  function saveLanguage(lang) {
    try {
      localStorage.setItem(storageKey, lang);
    } catch (error) {}
  }

  function applyLanguage(lang) {
    saveLanguage(lang);

    if (lang === "nl") {
      setCookie("googtrans", "/nl/nl", -1);
      setCookie("googtrans", "", -1);
    } else {
      setCookie("googtrans", "/nl/" + lang, 365);
    }

    window.location.reload();
  }

  function injectStyles() {
    if (document.getElementById("ap-translator-style")) return;

    var style = document.createElement("style");
    style.id = "ap-translator-style";
    style.textContent = [
      ".goog-te-banner-frame.skiptranslate,.goog-te-gadget-icon{display:none!important}",
      "body{top:0!important}",
      ".goog-te-combo{display:none!important}",
      "#google_translate_element{position:absolute!important;left:-9999px!important;top:-9999px!important;width:1px!important;height:1px!important;overflow:hidden!important}",
      "#ap-website-translator{position:fixed;right:18px;bottom:18px;z-index:2147483000;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#101010}",
      "#ap-website-translator *{box-sizing:border-box}",
      "#ap-website-translator .ap-shell{display:flex;align-items:center;gap:8px;width:min(360px,calc(100vw - 28px));padding:8px;border:1px solid rgba(16,16,16,.12);border-radius:999px;background:rgba(255,255,255,.94);box-shadow:0 18px 52px rgba(16,16,16,.16);backdrop-filter:blur(16px)}",
      "#ap-website-translator .ap-mark{width:38px;height:38px;display:grid;place-items:center;flex:0 0 auto;border-radius:999px;background:#101010;color:#fff;font-size:11px;font-weight:900;letter-spacing:1.4px}",
      "#ap-website-translator .ap-select-wrap{position:relative;flex:1;min-width:0}",
      "#ap-website-translator select{width:100%;height:42px;border:0;outline:0;appearance:none;background:transparent;color:#101010;font:inherit;font-size:14px;font-weight:900;padding:0 34px 0 8px;cursor:pointer}",
      "#ap-website-translator .ap-chevron{position:absolute;right:11px;top:50%;width:9px;height:9px;border-right:2px solid #101010;border-bottom:2px solid #101010;transform:translateY(-65%) rotate(45deg);pointer-events:none}",
      "#ap-website-translator .ap-close{width:36px;height:36px;display:grid;place-items:center;flex:0 0 auto;border:1px solid rgba(16,16,16,.1);border-radius:999px;background:#fff;color:#101010;font-size:20px;line-height:1;font-weight:700;cursor:pointer}",
      "#ap-website-translator.is-minimized .ap-shell{width:auto;padding:7px}",
      "#ap-website-translator.is-minimized .ap-select-wrap,#ap-website-translator.is-minimized .ap-close{display:none}",
      "#ap-website-translator .ap-open{display:none;border:0;background:transparent;color:#fff;font-size:11px;font-weight:900;letter-spacing:1.2px;cursor:pointer}",
      "#ap-website-translator.is-minimized .ap-open{display:block}",
      "@media(max-width:560px){#ap-website-translator{right:10px;bottom:10px}#ap-website-translator .ap-shell{width:calc(100vw - 20px);border-radius:26px;flex-wrap:wrap}#ap-website-translator .ap-mark{width:42px;height:42px}#ap-website-translator .ap-select-wrap{flex:1 1 calc(100% - 92px)}}"
    ].join("");
    document.head.appendChild(style);
  }

  function injectGoogleTranslate() {
    if (!document.getElementById("google_translate_element")) {
      var holder = document.createElement("div");
      holder.id = "google_translate_element";
      document.body.appendChild(holder);
    }

    window.googleTranslateElementInit = function () {
      if (!window.google || !window.google.translate) return;
      new window.google.translate.TranslateElement({
        pageLanguage: "nl",
        includedLanguages: includedLanguages,
        autoDisplay: false
      }, "google_translate_element");
    };

    if (!document.querySelector('script[src*="translate.google.com/translate_a/element.js"]')) {
      var script = document.createElement("script");
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }

  function renderWidget() {
    if (document.getElementById("ap-website-translator")) return;

    var saved = getSavedLanguage();
    var widget = document.createElement("div");
    widget.id = "ap-website-translator";
    widget.innerHTML = [
      '<div class="ap-shell">',
      '<div class="ap-mark" aria-hidden="true"><button class="ap-open" type="button" aria-label="Open translator">AP</button><span class="ap-logo-text">AP</span></div>',
      '<div class="ap-select-wrap">',
      '<select aria-label="Choose website language">',
      languages.map(function (item) {
        return '<option value="' + item.code + '"' + (item.code === saved ? " selected" : "") + ">" + item.label + "</option>";
      }).join(""),
      "</select>",
      '<span class="ap-chevron" aria-hidden="true"></span>',
      "</div>",
      '<button class="ap-close" type="button" aria-label="Minimize translator">&times;</button>',
      "</div>"
    ].join("");

    document.body.appendChild(widget);

    var select = widget.querySelector("select");
    var close = widget.querySelector(".ap-close");
    var open = widget.querySelector(".ap-open");

    select.addEventListener("change", function () {
      applyLanguage(select.value || "nl");
    });

    close.addEventListener("click", function () {
      widget.classList.add("is-minimized");
      try { localStorage.setItem("ap_translator_minimized", "1"); } catch (error) {}
    });

    open.addEventListener("click", function () {
      widget.classList.remove("is-minimized");
      try { localStorage.removeItem("ap_translator_minimized"); } catch (error) {}
    });

    try {
      if (localStorage.getItem("ap_translator_minimized") === "1") {
        widget.classList.add("is-minimized");
      }
    } catch (error) {}
  }

  function init() {
    injectStyles();
    renderWidget();
    injectGoogleTranslate();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
