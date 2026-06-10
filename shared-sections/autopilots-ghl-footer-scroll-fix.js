(function () {
  var marker = "apGhlFooterScrollFix20260610b";
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

    element.setAttribute("data-ap-footer-scroll-fixed", "true");
    element.style.setProperty("position", "relative", "important");
    element.style.setProperty("top", "auto", "important");
    element.style.setProperty("right", "auto", "important");
    element.style.setProperty("bottom", "auto", "important");
    element.style.setProperty("left", "auto", "important");
    element.style.setProperty("transform", "none", "important");
    element.style.setProperty("z-index", "1", "important");
    element.style.setProperty("contain", "layout paint", "important");
  }

  function isAtRealPageBottom() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    var viewportBottom = scrollTop + window.innerHeight;
    var pageHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );

    return viewportBottom >= pageHeight - 36;
  }

  function setFooterVisibility(element) {
    if (!element || isWidget(element)) return;

    var atBottom = isAtRealPageBottom();
    element.style.setProperty("visibility", atBottom ? "visible" : "hidden", "important");
    element.style.setProperty("opacity", atBottom ? "1" : "0", "important");
    element.style.setProperty("pointer-events", atBottom ? "auto" : "none", "important");
  }

  function getFooterLayer(element) {
    var current = element;
    var best = element;
    var depth = 0;

    while (current && current !== document.body && depth < 7) {
      if (isWidget(current)) break;

      var rect = current.getBoundingClientRect();
      var style = window.getComputedStyle(current);
      var wideEnough = rect.width >= window.innerWidth * 0.45;
      var fixedLike = style.position === "fixed" || style.position === "sticky";
      var footerNamed = classLooksLikeFooter(current);

      if ((wideEnough && textLooksLikeFooter(current)) || fixedLike || footerNamed) {
        best = current;
      }

      current = current.parentElement;
      depth += 1;
    }

    return best;
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
        setFooterVisibility(current);
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
      "div",
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
      var footerLayer = getFooterLayer(element);
      unlockFooterElement(footerLayer);
      setFooterVisibility(footerLayer);
      unlockFooterParents(footerLayer);
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
