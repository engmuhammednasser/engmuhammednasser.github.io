(function () {
  "use strict";
  var article = document.querySelector(".blog-prose");
  if (!article) return;
  var arabic = document.documentElement.lang === "ar";
  var labels = arabic ? {
    copy: "نسخ", copied: "تم النسخ", success: "تم نسخ الأوامر.",
    copiedName: "تم النسخ: أوامر PowerShell",
    failure: "تعذّر النسخ التلقائي. النص محدد الآن؛ استخدم خيار «نسخ» في جهازك."
  } : {
    copy: "Copy", copied: "Copied!", success: "Commands copied.",
    copiedName: "Copied! PowerShell commands",
    failure: "Automatic copying failed. The code is selected; use your device’s Copy command."
  };
  article.querySelectorAll("[data-blog-copy]").forEach(function (button) {
    if (button.dataset.copyInitialized) return;
    var block = button.closest(".blog-code");
    var code = block.querySelector("pre code");
    var label = button.querySelector("[data-blog-copy-label]");
    var status = block.querySelector("[data-blog-copy-status]");
    if (!code || !label || !status) return;
    var copyName = button.getAttribute("aria-label");
    var pending = false, resetTimer;
    button.addEventListener("click", async function () {
      if (pending) return;
      pending = true;
      window.clearTimeout(resetTimer);
      button.setAttribute("aria-disabled", "true");
      label.textContent = labels.copy;
      button.setAttribute("aria-label", copyName);
      status.textContent = "";
      try {
        if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(code.textContent);
        label.textContent = labels.copied;
        button.setAttribute("aria-label", labels.copiedName);
        status.textContent = labels.success;
        resetTimer = window.setTimeout(function () {
          label.textContent = labels.copy;
          button.setAttribute("aria-label", copyName);
        }, 2500);
      } catch (_) {
        code.parentElement.focus({ preventScroll: true });
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(code);
        selection.removeAllRanges();
        selection.addRange(range);
        status.textContent = labels.failure;
      } finally {
        pending = false;
        button.removeAttribute("aria-disabled");
      }
    });
    button.dataset.copyInitialized = "true";
    button.hidden = false;
  });
})();
