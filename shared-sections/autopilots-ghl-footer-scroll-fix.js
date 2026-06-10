(function () {
  var marker = "apGhlFooterScrollFix20260610";
  if (window[marker]) return;
  window[marker] = true;

  var footerSignals = [
    "privacy policy",
    "terms",
    "all rights reserved",
    "artificial intelligence act",
    "gdpr",
    "autopilots ai agency"
  ];

  function textLooksLikeFooter(element) {
    var text = (element.innerText || element.textContent || "").toLowerCase();
    if (!text || text.length > 2200) return false;
    return footerSignals.some(function (signal) {
      return text.indexOf(signal) !== -1;
    });
  }

  function classLooksLikeFooter(element) {
    var name = ((element.id || "") + " " + (element.className || "")).toLowerCase();
    return /\bfooter\b/.test(name) || name.indexOf("global-footer") !== -1;
  }

  function isWidget(element) {
    var name = ((element.id || "") + " " + (element.className || "")).toLowerCase();
    var text = (element.innerText || element.textContent || "").toLowerCase();
    return (
      name.indexOf("chat") !== -1 ||
      name.indexOf("widget") !== -1 ||
      name.indexOf("translator") !== -1 ||
      name.indexOf("eleven") !== -1 ||
      text.indexOf("voice & chat") !== -1 ||
      text.indexOf("powered by elevenagents") !== -1
    );
  }

  function unlockFooterElement(element) {
    if (!element || isWidget(element)) return;

    element.style.setProperty("position", "relative", "important");
    element.style.setProperty("top", "auto", "important");
    element.style.setProperty("right", "auto", "important");
    element.style.setProperty("bottom", "auto", "important");
    element.style.setProperty("left", "auto", "important");
    element.style.setProperty("transform", "none", "important");
    element.style.setProperty("z-index", "1", "important");
    element.style.setProperty("contain", "layout paint", "important");
  }

  function unlockFooterParents(element) {
    var current = element;
    var depth = 0;

    while (current && current !== document.body && depth < 5) {
      var style = window.getComputedStyle(current);
      var fixedLike = style.position === "fixed" || style.position === "sticky";
      var bottomPinned = style.bottom && style.bottom !== "auto";

      if ((fixedLike || bottomPinned || classLooksLikeFooter(current)) && !isWidget(current)) {
        unlockFooterElement(current);
      }

      current = current.parentElement;
      depth += 1;
    }
  }

  function normalizePageScroll() {
    document.documentElement.style.setProperty("height", "auto", "important");
    document.documentElement.style.setProperty("min-height", "0", "important");
    document.documentElement.style.setProperty("overflow-y", "auto", "important");
    document.body.style.setProperty("height", "auto", "important");
    document.body.style.setProperty("min-height", "0", "important");
    document.body.style.setProperty("overflow-y", "visible", "important");
    document.body.style.setProperty("position", "static", "important");
  }

  function findFooterCandidates() {
    var selector = [
      "footer",
      "[id*='footer' i]",
      "[class*='footer' i]",
      "section",
      ".c-section",
      ".hl_page-creator--section",
      ".hl_page-preview--section"
    ].join(",");

    return Array.prototype.slice.call(document.querySelectorAll(selector)).filter(function (element) {
      return !isWidget(element) && (classLooksLikeFooter(element) || textLooksLikeFooter(element));
    });
  }

  function applyFix() {
    normalizePageScroll();
    findFooterCandidates().forEach(function (element) {
      unlockFooterElement(element);
      unlockFooterParents(element);
    });
  }

  applyFix();
  window.addEventListener("load", applyFix);
  window.addEventListener("resize", applyFix);
  window.addEventListener("scroll", applyFix, { passive: true });

  if ("MutationObserver" in window) {
    new MutationObserver(applyFix).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });
  }
})();
