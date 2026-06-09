(function () {
  document.querySelectorAll("[data-ap-slide-prev], [data-ap-slide-next]").forEach(function (button) {
    button.addEventListener("click", function () {
      var target = button.getAttribute("data-ap-slide-prev") || button.getAttribute("data-ap-slide-next");
      var scope = button.closest(".ap-reusable") || document;
      var slider = scope.querySelector('[data-ap-slider="' + target + '"]');
      if (!slider) return;

      var direction = button.hasAttribute("data-ap-slide-next") ? 1 : -1;
      slider.scrollBy({ left: direction * Math.min(560, slider.clientWidth * 0.86), behavior: "smooth" });
    });
  });
})();
