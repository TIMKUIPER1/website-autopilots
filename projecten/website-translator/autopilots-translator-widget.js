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
  var sourceKey = "ap_preferred_language_source";
  var includedLanguages = languages.map(function (item) { return item.code; }).join(",");
  var currentScript = document.currentScript;
  var widgetPosition = currentScript && currentScript.getAttribute("data-position") || "bottom-left";
  var autoDetect = !currentScript || currentScript.getAttribute("data-auto-detect") !== "false";
  var explicitShowWidget = currentScript && currentScript.getAttribute("data-show-widget");
  var isEmbedded = false;
  var pendingLanguage = "";

  try {
    isEmbedded = window.self !== window.top;
  } catch (error) {
    isEmbedded = true;
  }

  var showWidget = explicitShowWidget ? explicitShowWidget !== "false" : !isEmbedded;

  function getCookieDomainCandidates() {
    var host = window.location.hostname;
    var candidates = [""];

    if (!host || host === "localhost" || /^[0-9.]+$/.test(host)) {
      return candidates;
    }

    candidates.push(host);

    var parts = host.split(".");
    if (parts.length > 2 && host.indexOf("github.io") === -1) {
      candidates.push("." + parts.slice(-2).join("."));
    }

    return candidates;
  }

  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }

    getCookieDomainCandidates().forEach(function (domain) {
      var domainPart = domain ? "; domain=" + domain : "";
      document.cookie = name + "=" + value + expires + "; path=/" + domainPart;
    });
  }

  function getSavedLanguage() {
    try {
      return localStorage.getItem(storageKey) || "";
    } catch (error) {
      return "";
    }
  }

  function saveLanguage(lang, source) {
    try {
      localStorage.setItem(storageKey, lang);
      localStorage.setItem(sourceKey, source || "manual");
    } catch (error) {}
  }

  function normalizeLanguage(lang) {
    var value = String(lang || "").toLowerCase();

    if (value.indexOf("zh") === 0) return "zh-CN";

    var shortCode = value.split("-")[0];
    var match = languages.find(function (item) {
      return item.code.toLowerCase() === value || item.code.toLowerCase() === shortCode;
    });

    return match ? match.code : "";
  }

  function getBrowserLanguage() {
    var browserLanguages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || navigator.userLanguage || ""];

    for (var index = 0; index < browserLanguages.length; index += 1) {
      var lang = normalizeLanguage(browserLanguages[index]);
      if (lang) return lang;
    }

    return "nl";
  }

  function getInitialLanguage() {
    var saved = getSavedLanguage();
    if (saved) return saved;

    if (!autoDetect) return "nl";

    return getBrowserLanguage() || "nl";
  }

  function setGoogleLanguageCookie(lang) {
    if (lang === "nl") {
      setCookie("googtrans", "/nl/nl", -1);
      setCookie("googtrans", "", -1);
      return;
    }

    setCookie("googtrans", "/nl/" + lang, 365);
  }

  function broadcastLanguage(lang) {
    var frames = document.querySelectorAll("iframe");

    Array.prototype.forEach.call(frames, function (frame) {
      try {
        frame.contentWindow.postMessage({ type: "autopilots:translate", language: lang }, "*");
      } catch (error) {}
    });
  }

  function applyLanguage(lang, source, shouldReload) {
    var normalized = normalizeLanguage(lang) || "nl";
    saveLanguage(normalized, source || "manual");
    setGoogleLanguageCookie(normalized);
    broadcastLanguage(normalized);
    pendingLanguage = normalized;

    if (normalized === "nl" && shouldReload !== false) {
      window.location.reload();
      return;
    }

    triggerGoogleTranslate(normalized);
  }

  function prepareInitialLanguage() {
    var saved = getSavedLanguage();
    var lang = saved || getInitialLanguage();

    if (!saved && lang && lang !== "nl") {
      saveLanguage(lang, "auto");
    }

    setGoogleLanguageCookie(lang || "nl");
    return lang || "nl";
  }

  function injectStyles() {
    if (document.getElementById("ap-translator-style")) return;

    var style = document.createElement("style");
    style.id = "ap-translator-style";
    style.textContent = [
      ".goog-te-banner-frame.skiptranslate,.goog-te-gadget-icon,.VIpgJd-ZVi9od-ORHb-OEVmcd,.VIpgJd-ZVi9od-aZ2wEe-wOHMyf,.VIpgJd-ZVi9od-l4eHX-hSRGPd{display:none!important}",
      "body{top:0!important}",
      "body>.skiptranslate{display:none!important}",
      "iframe.skiptranslate{display:none!important}",
      ".goog-tooltip,.goog-tooltip:hover,.goog-text-highlight{display:none!important;background:transparent!important;box-shadow:none!important}",
      ".goog-te-gadget{font-size:0!important;color:transparent!important;line-height:0!important}",
      ".goog-te-gadget span,.goog-te-gadget a{display:none!important}",
      ".goog-te-combo{position:absolute!important;left:0!important;top:0!important;width:1px!important;height:1px!important;min-width:1px!important;opacity:.01!important;pointer-events:none!important;border:0!important;background:transparent!important;color:transparent!important}",
      "#google_translate_element{position:fixed!important;left:-20px!important;top:-20px!important;width:1px!important;height:1px!important;overflow:hidden!important;opacity:.01!important;pointer-events:none!important;z-index:-1!important}",
      "#ap-website-translator{position:fixed;left:18px!important;right:auto!important;bottom:18px!important;z-index:2147483000;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#101010}",
      "#ap-website-translator.ap-pos-bottom-left{left:18px!important;right:auto!important}",
      "#ap-website-translator.ap-pos-bottom-right{left:auto!important;right:18px!important}",
      "#ap-website-translator *{box-sizing:border-box}",
      "#ap-website-translator .ap-shell{display:flex;align-items:center;gap:8px;width:min(360px,calc(100vw - 28px));padding:8px;border:1px solid rgba(16,16,16,.12);border-radius:999px;background:rgba(255,255,255,.94);box-shadow:0 18px 52px rgba(16,16,16,.16);backdrop-filter:blur(16px)}",
      "#ap-website-translator .ap-mark{width:38px;height:38px;display:grid;place-items:center;flex:0 0 auto;border-radius:999px;background:#101010;color:#fff;font-size:11px;font-weight:900;letter-spacing:1.4px}",
      "#ap-website-translator .ap-picker{position:relative;flex:1;min-width:0}",
      "#ap-website-translator .ap-language-button{width:100%;height:42px;display:flex;align-items:center;justify-content:space-between;gap:12px;border:0;border-radius:999px;background:transparent;color:#101010;font:inherit;font-size:14px;font-weight:900;text-align:left;padding:0 12px 0 8px;cursor:pointer}",
      "#ap-website-translator .ap-language-button:focus-visible,#ap-website-translator .ap-close:focus-visible,#ap-website-translator .ap-open:focus-visible,#ap-website-translator .ap-language-option:focus-visible{outline:2px solid rgba(168,56,38,.34);outline-offset:2px}",
      "#ap-website-translator .ap-current{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      "#ap-website-translator .ap-chevron{width:9px;height:9px;flex:0 0 auto;border-right:2px solid #101010;border-bottom:2px solid #101010;transform:translateY(-2px) rotate(45deg);transition:transform .18s ease}",
      "#ap-website-translator.is-open .ap-chevron{transform:translateY(2px) rotate(225deg)}",
      "#ap-website-translator .ap-language-menu{position:absolute;left:0;bottom:calc(100% + 12px);width:min(270px,calc(100vw - 36px));max-height:min(430px,calc(100vh - 150px));overflow:auto;padding:8px;border:1px solid rgba(16,16,16,.12);border-radius:22px;background:rgba(255,255,255,.98);box-shadow:0 24px 70px rgba(16,16,16,.18);backdrop-filter:blur(18px);opacity:0;visibility:hidden;transform:translateY(8px);transition:opacity .18s ease,transform .18s ease,visibility .18s ease}",
      "#ap-website-translator.ap-pos-bottom-right .ap-language-menu{left:auto;right:0}",
      "#ap-website-translator.is-open .ap-language-menu{opacity:1;visibility:visible;transform:translateY(0)}",
      "#ap-website-translator .ap-language-option{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;border:0;border-radius:14px;background:transparent;color:#101010;font:inherit;font-size:14px;font-weight:850;text-align:left;padding:11px 12px;cursor:pointer}",
      "#ap-website-translator .ap-language-option:hover{background:#f7ebe7;color:#a63826}",
      "#ap-website-translator .ap-language-option.is-active{background:#f3dfd9;color:#a63826}",
      "#ap-website-translator .ap-language-option.is-active:after{content:'✓';font-weight:950}",
      "#ap-website-translator .ap-close{width:36px;height:36px;display:grid;place-items:center;flex:0 0 auto;border:1px solid rgba(16,16,16,.1);border-radius:999px;background:#fff;color:#101010;font-size:20px;line-height:1;font-weight:700;cursor:pointer}",
      "#ap-website-translator.is-minimized .ap-shell{width:auto;padding:7px}",
      "#ap-website-translator.is-minimized .ap-picker,#ap-website-translator.is-minimized .ap-close{display:none}",
      "#ap-website-translator.is-minimized .ap-logo-text{display:none}",
      "#ap-website-translator .ap-open{display:none;border:0;background:transparent;color:#fff;font-size:11px;font-weight:900;letter-spacing:1.2px;cursor:pointer}",
      "#ap-website-translator.is-minimized .ap-open{display:block}",
      "@media(max-width:560px){#ap-website-translator{left:10px!important;right:auto!important;bottom:10px!important}#ap-website-translator.ap-pos-bottom-right{left:10px!important;right:auto!important}#ap-website-translator .ap-shell{width:calc(100vw - 20px);border-radius:26px;flex-wrap:wrap}#ap-website-translator .ap-mark{width:42px;height:42px}#ap-website-translator .ap-picker{flex:1 1 calc(100% - 92px)}#ap-website-translator .ap-language-menu{left:0!important;right:auto!important;width:calc(100vw - 20px);bottom:calc(100% + 10px)}}"
    ].join("");
    document.head.appendChild(style);
  }

  function triggerGoogleTranslate(lang, attempt) {
    var normalized = normalizeLanguage(lang) || "nl";
    var tries = attempt || 0;

    if (normalized === "nl") return true;

    var combo = document.querySelector(".goog-te-combo");

    if (combo) {
      combo.value = normalized;
      if (combo.value !== normalized) {
        if (tries < 50) {
          window.setTimeout(function () {
            triggerGoogleTranslate(normalized, tries + 1);
          }, 200);
        }

        return false;
      }

      var event;
      if (typeof Event === "function") {
        event = new Event("change", { bubbles: true });
      } else {
        event = document.createEvent("HTMLEvents");
        event.initEvent("change", true, true);
      }

      combo.dispatchEvent(event);
      return true;
    }

    if (tries < 50) {
      window.setTimeout(function () {
        triggerGoogleTranslate(normalized, tries + 1);
      }, 200);
    }

    return false;
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

      if (pendingLanguage && pendingLanguage !== "nl") {
        triggerGoogleTranslate(pendingLanguage);
      }
    };

    if (!document.querySelector('script[src*="translate.google.com/translate_a/element.js"]')) {
      var script = document.createElement("script");
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else if (pendingLanguage && pendingLanguage !== "nl") {
      triggerGoogleTranslate(pendingLanguage);
    }
  }

  function getDocumentHeight() {
    var body = document.body || {};
    var html = document.documentElement || {};

    return Math.max(
      body.scrollHeight || 0,
      body.offsetHeight || 0,
      html.clientHeight || 0,
      html.scrollHeight || 0,
      html.offsetHeight || 0
    );
  }

  function postIframeHeight() {
    if (!isEmbedded || !window.parent) return;

    try {
      window.parent.postMessage({
        type: "autopilots:iframe-height",
        height: getDocumentHeight(),
        href: window.location.href
      }, "*");
    } catch (error) {}
  }

  function setupIframeHeightBridge() {
    if (isEmbedded) {
      var postLater = function () {
        window.requestAnimationFrame(function () {
          postIframeHeight();
          window.setTimeout(postIframeHeight, 250);
          window.setTimeout(postIframeHeight, 1000);
        });
      };

      postLater();
      window.addEventListener("load", postLater);
      window.addEventListener("resize", postLater);

      if (window.MutationObserver && document.body) {
        new MutationObserver(postLater).observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true
        });
      }

      return;
    }

    window.addEventListener("message", function (event) {
      var data = event.data || {};
      if (data.type !== "autopilots:iframe-height" || !data.height) return;

      var frames = document.querySelectorAll("iframe");
      Array.prototype.forEach.call(frames, function (frame) {
        if (frame.contentWindow !== event.source) return;

        var height = Math.max(600, Math.ceil(Number(data.height) || 0) + 24);
        frame.style.height = height + "px";
        frame.style.minHeight = height + "px";
        frame.setAttribute("scrolling", "no");
      });
    });
  }

  function renderWidget() {
    if (document.getElementById("ap-website-translator")) return;

    if (!showWidget) return;

    var saved = getInitialLanguage();
    var widget = document.createElement("div");
    widget.id = "ap-website-translator";
    widget.className = widgetPosition === "bottom-right" ? "ap-pos-bottom-right" : "ap-pos-bottom-left";
    var savedLabel = (languages.find(function (item) { return item.code === saved; }) || languages[0]).label;

    widget.innerHTML = [
      '<div class="ap-shell">',
      '<div class="ap-mark"><button class="ap-open" type="button" aria-label="Open translator">AP</button><span class="ap-logo-text">AP</span></div>',
      '<div class="ap-picker">',
      '<button class="ap-language-button" type="button" aria-label="Choose website language" aria-expanded="false">',
      '<span class="ap-current">' + savedLabel + '</span>',
      '<span class="ap-chevron" aria-hidden="true"></span>',
      "</button>",
      '<div class="ap-language-menu" role="listbox">',
      languages.map(function (item) {
        return '<button class="ap-language-option' + (item.code === saved ? " is-active" : "") + '" type="button" role="option" aria-selected="' + (item.code === saved ? "true" : "false") + '" data-lang="' + item.code + '">' + item.label + "</button>";
      }).join(""),
      "</div>",
      "</div>",
      '<button class="ap-close" type="button" aria-label="Minimize translator">&times;</button>',
      "</div>"
    ].join("");

    document.body.appendChild(widget);

    var pickerButton = widget.querySelector(".ap-language-button");
    var languageButtons = widget.querySelectorAll(".ap-language-option");
    var close = widget.querySelector(".ap-close");
    var open = widget.querySelector(".ap-open");

    pickerButton.addEventListener("click", function () {
      var isOpen = widget.classList.toggle("is-open");
      pickerButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    Array.prototype.forEach.call(languageButtons, function (button) {
      button.addEventListener("click", function () {
        var lang = button.getAttribute("data-lang") || "nl";
        applyLanguage(lang);
      });
    });

    document.addEventListener("click", function (event) {
      if (!widget.contains(event.target)) {
        widget.classList.remove("is-open");
        pickerButton.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        widget.classList.remove("is-open");
        pickerButton.setAttribute("aria-expanded", "false");
      }
    });

    close.addEventListener("click", function () {
      widget.classList.remove("is-open");
      pickerButton.setAttribute("aria-expanded", "false");
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
    var initialLanguage = prepareInitialLanguage();
    pendingLanguage = initialLanguage;
    injectStyles();
    setupIframeHeightBridge();
    renderWidget();
    injectGoogleTranslate();
    if (initialLanguage !== "nl") {
      triggerGoogleTranslate(initialLanguage);
    }
    broadcastLanguage(initialLanguage);
  }

  window.addEventListener("message", function (event) {
    var data = event.data || {};
    if (data.type !== "autopilots:translate") return;
    applyLanguage(data.language || "nl", "manual", false);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
