(function () {
  "use strict";

  function initKuwaitArcScreenshots() {
    var cards = document.querySelectorAll(
      'button[aria-label*="full screenshot"], button[aria-label*="كاملاً"]'
    );

    if (!cards.length) return;

    cards.forEach(function (card) {
      var image = card.querySelector("img");
      if (!image) return;
      var gradient = card.children[1] || null;
      var hint = card.children[3] || null;
      var zoomOverlay = card.children[4] || null;

      var maxOffset = 0;
      var pinnedToBottom = false;

      card.style.position = "relative";
      card.style.overflow = "hidden";
      image.style.position = "absolute";
      image.style.left = "0";
      image.style.top = "0";
      image.style.width = "100%";
      image.style.height = "auto";
      image.style.maxWidth = "none";
      image.style.transform = "translateY(0)";
      image.style.transition = "transform 1.5s ease-in-out";

      function measureOffset() {
        image.style.transform = "translateY(0)";

        window.requestAnimationFrame(function () {
          var overflow = image.getBoundingClientRect().height - card.clientHeight;
          maxOffset = overflow > 0 ? overflow : 0;
          if (pinnedToBottom && maxOffset > 0) {
            image.style.transform = "translateY(-" + maxOffset + "px)";
          }
        });
      }

      function resetPosition() {
        pinnedToBottom = false;
        image.style.transform = "translateY(0)";
        if (gradient) gradient.style.opacity = "1";
        if (hint) hint.style.opacity = "0.85";
        if (zoomOverlay) zoomOverlay.style.backgroundColor = "rgba(0,0,0,0)";
      }

      function scrollPosition() {
        if (!maxOffset) return;
        pinnedToBottom = true;
        image.style.transform = "translateY(-" + maxOffset + "px)";
        if (gradient) gradient.style.opacity = "0";
        if (hint) hint.style.opacity = "0";
        if (zoomOverlay) zoomOverlay.style.backgroundColor = "rgba(0,0,0,0.2)";
      }

      if (image.complete) {
        measureOffset();
      } else {
        image.addEventListener("load", measureOffset, { once: true });
      }

      window.addEventListener("resize", measureOffset);
      card.addEventListener("mouseenter", scrollPosition);
      card.addEventListener("mouseleave", resetPosition);
      card.addEventListener("focusin", scrollPosition);
      card.addEventListener("focusout", resetPosition);

      card.addEventListener("click", function () {
        if (pinnedToBottom) {
          resetPosition();
          return;
        }

        scrollPosition();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initKuwaitArcScreenshots, { once: true });
  } else {
    initKuwaitArcScreenshots();
  }
})();
