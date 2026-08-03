(function () {
  "use strict";

  var fullView = null;

  function getFullView() {
    if (fullView) return fullView;

    var modal = document.createElement("div");
    var closeButton = document.createElement("button");
    var image = document.createElement("img");
    var previousFocus = null;

    modal.hidden = true;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", document.documentElement.lang === "ar" ? "عرض الصورة كاملة" : "Full screenshot");
    modal.style.cssText = "position:fixed;inset:0;z-index:100;background:rgba(2,6,23,.94);padding:24px;overflow:auto";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", document.documentElement.lang === "ar" ? "إغلاق الصورة" : "Close full screenshot");
    closeButton.textContent = "×";
    closeButton.style.cssText = "position:fixed;top:18px;right:18px;z-index:101;width:44px;height:44px;border-radius:999px;background:#111827;color:white;border:1px solid rgba(255,255,255,.2);font-size:25px;cursor:pointer";
    image.alt = "";
    image.style.cssText = "display:block;max-width:1400px;width:100%;height:auto;margin:50px auto 20px;border-radius:16px";
    modal.appendChild(closeButton);
    modal.appendChild(image);
    document.body.appendChild(modal);

    function close() {
      modal.hidden = true;
      document.body.style.overflow = "";
      if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
    }

    closeButton.addEventListener("click", close);
    modal.addEventListener("click", function (event) {
      if (event.target === modal) close();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.hidden) close();
    });

    fullView = { modal: modal, image: image, closeButton: closeButton, setPreviousFocus: function (element) { previousFocus = element; } };
    return fullView;
  }

  function openFullView(card) {
    var source = card.getAttribute("data-full-src");
    if (!source) return;

    var view = getFullView();
    var preview = card.querySelector("img");
    view.setPreviousFocus(document.activeElement === document.body ? card : document.activeElement);
    view.image.src = source;
    view.image.alt = preview ? preview.alt : "Full screenshot";
    view.image.loading = "eager";
    view.image.decoding = "async";
    view.modal.hidden = false;
    document.body.style.overflow = "hidden";
    view.closeButton.focus();
  }

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

      image.addEventListener("load", measureOffset, { once: true });
      if (image.complete && image.naturalWidth > 0) measureOffset();
      if (typeof image.decode === "function") image.decode().then(measureOffset).catch(function () {});

      window.addEventListener("resize", measureOffset);
      card.addEventListener("mouseenter", scrollPosition);
      card.addEventListener("mouseleave", resetPosition);
      card.addEventListener("focusin", scrollPosition);
      card.addEventListener("focusout", resetPosition);
      card.addEventListener("click", function () {
        if (card.getAttribute("data-full-src")) {
          openFullView(card);
          return;
        }

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
