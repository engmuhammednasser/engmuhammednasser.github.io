(function () {
  "use strict";

  var fullView = null;
  var movementThreshold = 8;

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

  function canonicalHintText() {
    return document.documentElement.lang === "ar" ? "مرّر لعرض الصورة" : "Scroll to explore";
  }

  function isLegacyHintElement(element) {
    if (!element || element.hasAttribute("data-case-study-scroll-hint")) return false;
    var text = (element.textContent || "").replace(/\s+/g, " ").trim();
    return /Scroll\s+(inside|screenshot|to view)|Hover\s+to\s+scroll|Tap\s+to\s+view|مرر|مرّر|اسحب/i.test(text);
  }

  function cleanupScrollHints(card) {
    var hints = Array.prototype.slice.call(card.querySelectorAll("[data-case-study-scroll-hint]"));
    var hint = hints[0] || null;

    hints.slice(1).forEach(function (duplicate) {
      duplicate.remove();
    });

    Array.prototype.slice.call(card.querySelectorAll("span, div")).forEach(function (element) {
      if (isLegacyHintElement(element)) element.remove();
    });

    if (!hint || !hint.isConnected) {
      hint = document.createElement("span");
      hint.setAttribute("data-case-study-scroll-hint", "");
      hint.setAttribute("aria-hidden", "true");
      card.appendChild(hint);
    }

    hint.textContent = canonicalHintText();
    return hint;
  }

  function findGradientOverlay(card) {
    var overlays = Array.prototype.slice.call(card.querySelectorAll('[aria-hidden="true"]'));
    return overlays.find(function (element) {
      var style = element.getAttribute("style") || "";
      return /linear-gradient/i.test(style) || /gradient/i.test(element.className || "");
    }) || null;
  }

  function initCaseStudyScreenshots() {
    var cards = document.querySelectorAll(
      "button[data-case-study-screenshot]"
    );

    cards.forEach(function (card) {
      var image = card.querySelector("img");
      if (!image) return;

      var gradient = findGradientOverlay(card);
      var hasFullView = Boolean(card.getAttribute("data-full-src") || card.getAttribute("data-src"));
      var pointerMoved = false;
      var pointerActive = false;
      var pointerStartX = 0;
      var pointerStartY = 0;
      var hint = cleanupScrollHints(card);

      card.style.position = "relative";
      card.style.overflowX = "hidden";
      card.style.overflowY = "auto";
      card.style.webkitOverflowScrolling = "touch";
      card.style.overscrollBehavior = "contain";
      card.style.touchAction = "pan-y";
      card.style.scrollbarWidth = "thin";
      card.style.scrollbarColor = "rgba(148,163,184,.8) rgba(15,23,42,.65)";
      card.style.cursor = hasFullView ? "zoom-in" : "default";
      image.style.position = "static";
      image.style.width = "100%";
      image.style.height = "auto";
      image.style.maxWidth = "none";
      image.style.transform = "translateY(0)";
      image.style.transition = "none";
      image.style.willChange = "auto";

      if (gradient) gradient.style.position = "sticky";
      hint.style.cssText = "position:sticky;bottom:12px;left:50%;transform:translateX(-50%);display:none;width:max-content;max-width:calc(100% - 32px);margin:-40px auto 12px;padding:6px 12px;border-radius:999px;background:rgba(2,6,23,.72);border:1px solid rgba(255,255,255,.14);color:rgba(255,255,255,.78);font-size:12px;font-weight:600;line-height:1.2;white-space:nowrap;pointer-events:none;z-index:3;box-shadow:0 8px 24px rgba(0,0,0,.18)";

      function updateHint() {
        var scrollable = card.scrollHeight > card.clientHeight + 2;
        hint.style.display = scrollable ? "block" : "none";
        hint.style.opacity = scrollable && card.scrollTop < 8 ? "1" : ".38";
      }

      function endPointerTracking() {
        pointerActive = false;
      }

      function resetPointerState() {
        pointerActive = false;
        pointerMoved = false;
      }

      if (image.complete) updateHint();
      else image.addEventListener("load", updateHint, { once: true });
      window.addEventListener("resize", updateHint);
      card.addEventListener("scroll", updateHint, { passive: true });
      updateHint();

      card.addEventListener("pointerdown", function (event) {
        pointerMoved = false;
        pointerActive = true;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
      });

      card.addEventListener("pointermove", function (event) {
        if (!pointerActive) return;
        if (Math.abs(event.clientX - pointerStartX) > movementThreshold || Math.abs(event.clientY - pointerStartY) > movementThreshold) {
          pointerMoved = true;
        }
      });

      card.addEventListener("pointerup", endPointerTracking);
      card.addEventListener("pointercancel", resetPointerState);
      card.addEventListener("lostpointercapture", resetPointerState);

      card.addEventListener("click", function (event) {
        if (hasFullView && !pointerMoved) {
          event.preventDefault();
          openFullView(card);
        }
        pointerMoved = false;
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
