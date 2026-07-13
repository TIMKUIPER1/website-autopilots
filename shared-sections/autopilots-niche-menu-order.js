(function () {
  var marker = "apNicheMenuOrder20260713";
  if (window[marker]) return;
  window[marker] = true;

  var order = [
    "autobedrijven",
    "cosmetische klinieken",
    "dakdekkers",
    "dierenarts",
    "dierenartsen",
    "dierenverzorging",
    "evenementen",
    "glaszetters",
    "hotels",
    "hoveniers",
    "installatietechniek",
    "kapperszaken",
    "kozijnen",
    "makelaars",
    "non-profit",
    "restaurants",
    "tandartsen",
    "vastgoedbeheerders",
    "verzekeraars",
    "vloerenleggers",
    "woningcorporaties",
    "zonnepanelen"
  ];

  var aliases = {
    "dierenartsen": "dierenarts"
  };

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[\u00a0\s]+/g, " ")
      .trim();
  }

  function getNicheKey(link) {
    var text = normalize(link.textContent);
    var href = normalize(link.getAttribute("href"));

    for (var i = 0; i < order.length; i += 1) {
      var key = order[i];
      if (text.indexOf(key) !== -1 || href.indexOf(key.replace(/\s+/g, "-")) !== -1) {
        return aliases[key] || key;
      }
    }

    return "";
  }

  function sortLinksIn(parent) {
    if (!parent || parent.__apNicheSorting) return false;

    var links = Array.prototype.slice.call(parent.querySelectorAll("a"));
    var nicheLinks = links
      .map(function (link) {
        return { link: link, key: getNicheKey(link) };
      })
      .filter(function (item) {
        return item.key;
      });

    if (nicheLinks.length < 5) return false;

    var directChildren = nicheLinks.every(function (item) {
      return item.link.parentElement === parent;
    });

    if (!directChildren) return false;

    var currentOrder = nicheLinks
      .map(function (item) {
        return item.key;
      })
      .join("|");

    var sortedLinks = nicheLinks.slice().sort(function (a, b) {
      return order.indexOf(a.key) - order.indexOf(b.key);
    });

    var desiredOrder = sortedLinks
      .map(function (item) {
        return item.key;
      })
      .join("|");

    if (currentOrder === desiredOrder) return false;

    parent.__apNicheSorting = true;

    sortedLinks.forEach(function (item) {
      parent.appendChild(item.link);
    });

    parent.__apNicheSorting = false;
    return true;
  }

  function findAndSort() {
    var containers = Array.prototype.slice.call(
      document.querySelectorAll(
        ".ap-niche-menu-grid, .ap-mega-grid, [class*='dropdown'], [class*='menu'], nav, div"
      )
    );

    containers.forEach(sortLinksIn);
  }

  function schedule() {
    window.requestAnimationFrame(findAndSort);
    window.setTimeout(findAndSort, 250);
    window.setTimeout(findAndSort, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule);
  } else {
    schedule();
  }

  var observer = new MutationObserver(function () {
    schedule();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
