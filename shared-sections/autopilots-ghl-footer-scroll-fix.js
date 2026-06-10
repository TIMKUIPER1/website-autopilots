(function () {
  var marker = "apGhlIframeHeightFix20260610e";
  if (window[marker]) return;
  window[marker] = true;

  var autopilotsFrameSelector = [
    'iframe[src*="timkuiper1.github.io/website-autopilots"]',
    'iframe[src*="website-autopilots"]'
  ].join(",");

  function getAutopilotsFrames() {
    return Array.prototype.slice.call(document.querySelectorAll(autopilotsFrameSelector));
  }

  function getFallbackHeight(frame) {
    var src = (frame && frame.getAttribute("src") || "").toLowerCase();
    if (src.indexOf("autopilots-crm") !== -1 || src.indexOf("crm-landing-page") !== -1) return 5600;
    if (src.indexOf("homepage") !== -1 || src.indexOf("home-landing-page") !== -1) return 7800;
    if (src.indexOf("niche-landing-pages") !== -1) return 7600;
    if (src.indexOf("leadsmachine") !== -1) return 7200;
    if (src.indexOf("privacy-policy") !== -1) return 3600;
    if (src.indexOf("voice-agent-bedankt") !== -1) return 4200;
    return 6200;
  }

  function prepareAutopilotsFrame(frame) {
    if (!frame) return;

    frame.setAttribute("scrolling", "no");
    frame.style.setProperty("width", "100%", "important");
    frame.style.setProperty("border", "0", "important");
    frame.style.setProperty("display", "block", "important");
    frame.style.setProperty("overflow", "hidden", "important");
    frame.style.setProperty("min-height", "0", "important");

    if (!frame.style.height || frame.style.height === "auto") {
      frame.style.setProperty("height", getFallbackHeight(frame) + "px", "important");
    }
  }

  function prepareAutopilotsFrames() {
    getAutopilotsFrames().forEach(prepareAutopilotsFrame);
  }

  function getFrameFromSource(source) {
    return getAutopilotsFrames().find(function (frame) {
      return frame.contentWindow === source;
    });
  }

  function resizeAutopilotsFrame(frame, height) {
    if (!frame || !height) return;

    var nextHeight = Math.ceil(Number(height) || 0);
    if (!nextHeight || nextHeight < 400) return;

    prepareAutopilotsFrame(frame);
    frame.dataset.apEmbedHeight = String(nextHeight);
    frame.style.setProperty("height", nextHeight + "px", "important");
    frame.style.setProperty("min-height", nextHeight + "px", "important");
  }

  window.addEventListener("message", function (event) {
    var data = event.data || {};
    if (data.type !== "autopilots:embed-height") return;

    var frame = getFrameFromSource(event.source);
    resizeAutopilotsFrame(frame, data.height);
    setTimeout(applyFix, 50);
  });

  function normalizePageScroll() {
    document.documentElement.style.setProperty("height", "auto", "important");
    document.documentElement.style.setProperty("overflow-y", "auto", "important");
    document.body.style.setProperty("height", "auto", "important");
    document.body.style.setProperty("overflow-y", "visible", "important");
  }

  function applyFix() {
    prepareAutopilotsFrames();
    normalizePageScroll();
  }

  applyFix();
  window.addEventListener("load", applyFix);
  window.addEventListener("resize", applyFix);
  window.addEventListener("scroll", applyFix, { passive: true });
  setTimeout(applyFix, 250);
  setTimeout(applyFix, 1000);
  setTimeout(applyFix, 2500);

  if ("MutationObserver" in window) {
    new MutationObserver(applyFix).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });
  }
})();
