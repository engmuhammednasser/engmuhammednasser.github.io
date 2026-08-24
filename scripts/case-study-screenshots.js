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
    var source = card.getAttribute("data-full-src") || card.getAttribute("data-src");
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
      'button[data-case-study-screenshot], button[aria-label*="full screenshot"], button[aria-label*="كاملاً"], button.case-shot'
    );

    cards.forEach(function (card) {
      var image = card.querySelector("img");
      if (!image) return;

      var gradient = card.children[1] || null;
      var hint = card.children[3] || null;
      var hasFullView = Boolean(card.getAttribute("data-full-src") || card.getAttribute("data-src"));
      var pointerMoved = false;
      var pointerStartX = 0;
      var pointerStartY = 0;

      card.style.position = "relative";
      card.style.overflowX = "hidden";
      card.style.overflowY = "auto";
      card.style.webkitOverflowScrolling = "touch";
      card.style.overscrollBehavior = "contain";
      card.style.touchAction = "pan-y";
      card.style.scrollbarWidth = "thin";
      card.style.scrollbarColor = "rgba(148,163,184,.8) rgba(15,23,42,.65)";
      image.style.position = "static";
      image.style.width = "100%";
      image.style.height = "auto";
      image.style.maxWidth = "none";
      image.style.transform = "translateY(0)";
      image.style.transition = "none";
      image.style.willChange = "auto";

      if (gradient) gradient.style.position = "sticky";
      if (hint) hint.style.position = "sticky";

      card.addEventListener("pointerdown", function (event) {
        pointerMoved = false;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
      });

      card.addEventListener("pointermove", function (event) {
        if (Math.abs(event.clientX - pointerStartX) > 6 || Math.abs(event.clientY - pointerStartY) > 6) {
          pointerMoved = true;
        }
      });

      card.addEventListener("click", function (event) {
        if (hasFullView && !pointerMoved) {
          event.preventDefault();
          openFullView(card);
        }
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
