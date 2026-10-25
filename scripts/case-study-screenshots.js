(function () {
  "use strict";

  var fullView = null;
  var movementThreshold = 8;

  function displaySource(preview) {
    if (!preview) return "";
    var current = preview.currentSrc || preview.src;
    var picture = preview.closest("picture");
    var avif = picture && /\.avif(?:[?#]|$)/i.test(current) && picture.querySelector('source[type="image/avif"]');
    var candidates = ((avif || preview).getAttribute("srcset") || "").split(",");
    var width = 0;
    candidates.forEach(function (candidate) {
      var match = candidate.trim().match(/^(.+)\s+(\d+)w$/);
      if (match && Number(match[2]) > width) {
        current = match[1];
        width = Number(match[2]);
      }
    });
    return current;
  }

  function getFullView() {
    if (fullView) return fullView;

    var modal = document.createElement("div");
    var closeButton = document.createElement("button");
    var toolbar = document.createElement("div");
    var status = document.createElement("p");
    var retry = document.createElement("button");
    var originalLink = document.createElement("a");
    var media = document.createElement("div");
    var image = null;
    var placeholder = null;
    var timer = null;
    var attempt = 0;
    var source = "";
    var alt = "";
    var previousFocus = null;
    var previousOverflow = "";
    var background = [];
    var copy = document.documentElement.lang === "ar"
      ? { loading: "جاري تحميل الصورة…", error: "تعذر تحميل الصورة. يمكنك إعادة المحاولة أو فتح الصورة الأصلية.", retry: "إعادة المحاولة", original: "فتح الصورة الأصلية" }
      : { loading: "Loading image…", error: "The image could not load. Retry or open the original image.", retry: "Retry", original: "Open original image" };

    modal.hidden = true;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", document.documentElement.lang === "ar" ? "عرض الصورة كاملة" : "Full screenshot");
    modal.style.cssText = "position:fixed;inset:0;z-index:100;background:rgba(2,6,23,.94);padding:24px;overflow:auto";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", document.documentElement.lang === "ar" ? "إغلاق الصورة" : "Close full screenshot");
    closeButton.textContent = "×";
    closeButton.style.cssText = "position:fixed;top:18px;right:18px;z-index:101;width:44px;height:44px;border-radius:999px;background:#111827;color:white;border:1px solid rgba(255,255,255,.2);font-size:25px;cursor:pointer";
    toolbar.style.cssText = "max-width:1400px;margin:50px auto 16px;display:flex;align-items:center;flex-wrap:wrap;gap:12px;color:white";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.style.cssText = "margin:0;flex:1 1 240px";
    retry.type = "button";
    retry.textContent = copy.retry;
    retry.setAttribute("data-full-view-retry", "");
    retry.hidden = true;
    originalLink.textContent = copy.original;
    originalLink.target = "_blank";
    originalLink.rel = "noopener noreferrer";
    originalLink.setAttribute("data-full-view-original", "");
    [retry, originalLink].forEach(function (control) {
      control.style.cssText = "padding:10px 16px;min-height:44px;border-radius:10px;border:1px solid #64748b;background:#111827;color:#e2e8f0;cursor:pointer;text-decoration:underline";
    });
    retry.style.display = "none";
    media.style.cssText = "max-width:1400px;margin:0 auto 20px";
    modal.appendChild(closeButton);
    toolbar.appendChild(status);
    toolbar.appendChild(retry);
    toolbar.appendChild(originalLink);
    modal.appendChild(toolbar);
    modal.appendChild(media);
    document.body.appendChild(modal);

    function cancel() {
      attempt += 1;
      clearTimeout(timer);
      if (image) {
        image.onload = image.onerror = null;
        image.removeAttribute("src");
        image.style.display = "none";
      }
    }

    function load() {
      cancel();
      var token = attempt;
      var settled = false;
      var decoding = false;
      if (image) image.remove();
      // A fresh element isolates a retry/reopen from an earlier request's events.
      var pending = document.createElement("img");
      image = pending;
      pending.setAttribute("data-full-view-image", "");
      pending.alt = alt;
      pending.loading = "eager";
      pending.decoding = "async";
      pending.style.cssText = "display:none;width:100%;height:auto;border-radius:16px";
      media.appendChild(pending);
      status.textContent = copy.loading;
      media.setAttribute("aria-busy", "true");
      if (document.activeElement === retry) closeButton.focus({ preventScroll: true });
      retry.hidden = true;
      retry.style.display = "none";
      function finish(success) {
        if (settled || token !== attempt || modal.hidden) return;
        settled = true;
        clearTimeout(timer);
        pending.onload = pending.onerror = null;
        media.setAttribute("aria-busy", "false");
        status.textContent = success ? "" : copy.error;
        retry.hidden = success;
        retry.style.display = success ? "none" : "block";
        if (success) {
          pending.style.display = "block";
          if (placeholder) { placeholder.removeAttribute("src"); placeholder.remove(); placeholder = null; }
        } else {
          // Release a stalled request; the next attempt uses a fresh image.
          pending.removeAttribute("src");
        }
      }
      function loaded() {
        if (decoding || settled || token !== attempt || modal.hidden) return;
        if (!pending.naturalWidth) { finish(false); return; }
        decoding = true;
        // Network completion does not guarantee an asynchronously decoded image
        // is ready to paint. Keep the cached preview until decoding succeeds.
        if (typeof pending.decode !== "function") { finish(true); return; }
        try {
          pending.decode().then(function () { finish(true); }, function () { finish(false); });
        } catch (_error) { finish(false); }
      }
      pending.onload = loaded;
      pending.onerror = function () { finish(false); };
      timer = setTimeout(function () { finish(false); }, 15000);
      pending.src = source;
      if (pending.complete && pending.naturalWidth > 0) loaded();
    }

    function close() {
      if (modal.hidden) return;
      modal.hidden = true;
      cancel();
      if (placeholder) { placeholder.removeAttribute("src"); placeholder.remove(); placeholder = null; }
      originalLink.removeAttribute("href");
      status.textContent = "";
      media.setAttribute("aria-busy", "false");
      document.body.style.overflow = previousOverflow;
      background.forEach(function (entry) { entry.element.inert = entry.inert; });
      background = [];
      if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus({ preventScroll: true });
    }

    closeButton.addEventListener("click", close);
    retry.addEventListener("click", load);
    modal.addEventListener("keydown", function (event) {
      if (event.key === "Tab") {
        var controls = Array.prototype.filter.call(modal.querySelectorAll("button, a[href]"), function (control) {
          return !control.hidden && !control.disabled && control.getClientRects().length;
        });
        var index = controls.indexOf(document.activeElement);
        if (event.shiftKey ? index <= 0 : index < 0 || index === controls.length - 1) {
          event.preventDefault();
          controls[event.shiftKey ? controls.length - 1 : 0].focus();
        }
      }
    });
    modal.addEventListener("click", function (event) {
      if (event.target === modal) close();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.hidden) close();
    });

    fullView = { open: function (card, preview, original) {
      if (!modal.hidden) close();
      previousFocus = document.activeElement === document.body ? card : document.activeElement;
      previousOverflow = document.body.style.overflow;
      background = Array.prototype.filter.call(document.body.children, function (child) {
        return child !== modal && !/^(SCRIPT|STYLE|LINK)$/.test(child.tagName);
      }).map(function (child) {
        var entry = { element: child, inert: child.inert };
        child.inert = true;
        return entry;
      });
      source = displaySource(preview) || original;
      alt = preview ? preview.alt : "";
      originalLink.href = original;
      if (preview && preview.complete && preview.naturalWidth > 0) {
        placeholder = document.createElement("img");
        placeholder.alt = "";
        placeholder.setAttribute("aria-hidden", "true");
        placeholder.setAttribute("data-full-view-placeholder", "");
        placeholder.style.cssText = "display:block;width:100%;height:auto;border-radius:16px";
        placeholder.src = preview.currentSrc || preview.src;
        media.appendChild(placeholder);
      }
      modal.hidden = false;
      modal.scrollTop = 0;
      document.body.style.overflow = "hidden";
      load();
      closeButton.focus();
    } };
    return fullView;
  }

  function openFullView(card) {
    var preview = card.querySelector("img");
    var source = card.getAttribute("data-full-src") || card.getAttribute("data-src") || (preview ? preview.currentSrc || preview.src : "");
    if (!source) return;

    getFullView().open(card, preview, source);
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
      'button[data-case-study-screenshot], button[aria-label^="View full image:"]'
    );

    cards.forEach(function (card) {
      var image = card.querySelector("img");
      if (!image) return;

      var gradient = findGradientOverlay(card);
      if (!card.hasAttribute("data-case-study-screenshot")) card.setAttribute("data-case-study-screenshot", "");
      if (!card.getAttribute("data-full-src")) card.setAttribute("data-full-src", card.getAttribute("data-src") || image.currentSrc || image.src);

      var hasFullView = Boolean(card.getAttribute("data-full-src") || card.getAttribute("data-src") || image.currentSrc || image.src);
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
        if (hasFullView && (!pointerMoved || event.detail === 0)) {
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
