(function () {
  "use strict";

  var toggle = document.querySelector("[data-mobile-menu-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");

  if (!toggle || !menu || toggle.getAttribute("data-mobile-menu-initialized") === "true") return;

  toggle.setAttribute("data-mobile-menu-initialized", "true");

  var closedClass = document.documentElement.dir === "rtl" ? "translate-x-full" : "-translate-x-full";
  var openClass = "translate-x-0";
  var closeButton = menu.querySelector('button[aria-label="Close menu"], button[aria-label="أغلق القائمة"]');
  var overlay = null;
  var open = false;

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

  function setOpen(nextOpen, restoreFocus) {
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
      focus(closeButton);
    } else {
      removeOverlay();
      if (restoreFocus) focus(toggle);
    }
  }

  toggle.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    setOpen(!open, !open);
  });

  if (closeButton) {
    closeButton.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false, true);
    });
  }

  menu.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false, false);
  });

  document.addEventListener("keydown", function (event) {
    if (open && event.key === "Escape") {
      event.preventDefault();
      setOpen(false, true);
    }
  });

  setOpen(false, false);
})();
