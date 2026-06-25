(function () {
  "use strict";

  function initCaseStudyScreenshots() {
    var cards = document.querySelectorAll(
      'button[aria-label*="full screenshot"], button[aria-label*="كاملاً"]'
    );

    cards.forEach(function (card) {
      var image = card.querySelector("img");
      if (!image) return;

      var gradient = card.children[1] || null;
      var hint = card.children[3] || null;
      var zoomOverlay = card.children[4] || null;
      var maxOffset = 0;
      var pinnedToBottom = false;
      var scrollDuration = 6;

      card.style.position = "relative";
      card.style.overflow = "hidden";
      image.style.position = "absolute";
      image.style.left = "0";
      image.style.top = "0";
      image.style.width = "100%";
      image.style.height = "auto";
      image.style.maxWidth = "none";
      image.style.transform = "translateY(0)";
      image.style.transition = "transform 0.9s ease-out";

      function measureOffset() {
        image.style.transform = "translateY(0)";

        window.requestAnimationFrame(function () {
          var overflow = image.getBoundingClientRect().height - card.clientHeight;
          maxOffset = overflow > 0 ? overflow : 0;
          scrollDuration = Math.min(18, Math.max(6, maxOffset / 110));

          if (pinnedToBottom && maxOffset > 0) {
            image.style.transition = "transform " + scrollDuration + "s linear";
            image.style.transform = "translateY(-" + maxOffset + "px)";
          }
        });
      }

      function resetPosition() {
        pinnedToBottom = false;
        image.style.transition = "transform 0.9s ease-out";
        image.style.transform = "translateY(0)";
        if (gradient) gradient.style.opacity = "1";
        if (hint) hint.style.opacity = "0.85";
        if (zoomOverlay) zoomOverlay.style.backgroundColor = "rgba(0,0,0,0)";
      }

      function scrollPosition() {
        if (!maxOffset) return;

        pinnedToBottom = true;
        image.style.transition = "transform " + scrollDuration + "s linear";
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
    document.addEventListener("DOMContentLoaded", initCaseStudyScreenshots, {
      once: true,
    });
  } else {
    initCaseStudyScreenshots();
  }
})();
