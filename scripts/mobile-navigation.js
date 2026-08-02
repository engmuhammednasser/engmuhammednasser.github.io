(function () {
  "use strict";

  var toggle = document.querySelector("[data-mobile-menu-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");

  if (!toggle || !menu || toggle.getAttribute("data-mobile-menu-initialized") === "true") return;

  toggle.setAttribute("data-mobile-menu-initialized", "true");

  var closedClass = document.documentElement.dir === "rtl" ? "translate-x-full" : "-translate-x-full";
  var openClass = "translate-x-0";
  var focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  var closeButton = menu.querySelector("[data-mobile-menu-close]");
  var overlay = null;
  var open = false;
  var rememberedFocus = null;
  var menuFallbackFocus = false;

  function focus(element) {
    if (!element || typeof element.focus !== "function") return;
    try {
      element.focus({ preventScroll: true });
    } catch (error) {
      element.focus();
    }
  }

  function createOverlay() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity";
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("data-mobile-menu-overlay", "true");
    overlay.addEventListener("click", function () {
      setOpen(false, true);
    });
    document.body.appendChild(overlay);
  }

  function removeOverlay() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
  }

  function setInert(nextInert) {
    if ("inert" in menu) menu.inert = nextInert;
    if (nextInert) menu.setAttribute("inert", "");
    else menu.removeAttribute("inert");
  }

  function isFocusable(element) {
    if (!element || element.disabled || element.hidden) return false;
    if (element.getAttribute("aria-hidden") === "true") return false;
    if (element.getAttribute("aria-disabled") === "true" || element.tabIndex < 0) return false;
    if (element.closest("[inert]")) return false;
    var styles = window.getComputedStyle(element);
    if (styles.display === "none" || styles.visibility === "hidden") return false;
    return element.getClientRects().length > 0;
  }

  function getFocusableElements() {
    return Array.prototype.filter.call(menu.querySelectorAll(focusableSelector), isFocusable);
  }

  function focusMenuFallback() {
    if (!menu.hasAttribute("tabindex")) {
      menu.setAttribute("tabindex", "-1");
      menuFallbackFocus = true;
    }
    focus(menu);
  }

  function focusMenu() {
    var focusableElements = getFocusableElements();
    if (closeButton && isFocusable(closeButton)) {
      focus(closeButton);
    } else if (focusableElements.length) {
      focus(focusableElements[0]);
    } else {
      focusMenuFallback();
    }
  }

  function clearMenuFallbackFocus() {
    if (!menuFallbackFocus) return;
    menu.removeAttribute("tabindex");
    menuFallbackFocus = false;
  }

  function rememberFocus() {
    var activeElement = document.activeElement;
    rememberedFocus = activeElement && activeElement !== document.body && !menu.contains(activeElement) ? activeElement : toggle;
  }

  function restoreFocus() {
    var target = rememberedFocus && document.contains(rememberedFocus) && !rememberedFocus.closest("[inert]") ? rememberedFocus : toggle;
    focus(target);
    rememberedFocus = null;
  }

  function shouldRestoreLinkFocus(link) {
    var target = (link.getAttribute("target") || "").toLowerCase();
    var href = link.getAttribute("href") || "";
    return (target && target !== "_self") || href === "" || href.charAt(0) === "#";
  }

  function setOpen(nextOpen, shouldRestoreFocus) {
    if (nextOpen && !open) rememberFocus();
    open = Boolean(nextOpen);
    menu.classList.remove(closedClass, openClass);
    menu.classList.add(open ? openClass : closedClass);
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    menu.setAttribute("data-mobile-menu-state", open ? "open" : "closed");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("data-mobile-menu-state", open ? "open" : "closed");
    setInert(!open);
    document.body.style.overflow = open ? "hidden" : "";

    if (open) {
      createOverlay();
      focusMenu();
    } else {
      removeOverlay();
      clearMenuFallbackFocus();
      if (shouldRestoreFocus) restoreFocus();
      else rememberedFocus = null;
    }
  }

  toggle.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    setOpen(!open, true);
  });

  if (closeButton) {
    closeButton.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false, true);
    });
  }

  menu.addEventListener("click", function (event) {
    var link = event.target && typeof event.target.closest === "function" ? event.target.closest("a") : null;
    if (link) setOpen(false, shouldRestoreLinkFocus(link));
  });

  document.addEventListener("keydown", function (event) {
    if (!open) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false, true);
      return;
    }

    if (event.key !== "Tab") return;

    var focusableElements = getFocusableElements();
    if (!focusableElements.length) {
      event.preventDefault();
      focusMenuFallback();
      return;
    }

    var activeIndex = focusableElements.indexOf(document.activeElement);
    var nextIndex = event.shiftKey ? focusableElements.length - 1 : 0;
    if (activeIndex === -1 || (event.shiftKey && activeIndex === 0) || (!event.shiftKey && activeIndex === focusableElements.length - 1)) {
      event.preventDefault();
      focus(focusableElements[nextIndex]);
    }
  });

  setOpen(false, false);
})();
