(function () {
  "use strict";

  var controller = document.querySelector("[data-work-filter-controller]");
  var grid = document.getElementById("work-project-grid");
  var loadMore = document.querySelector("[data-work-load-more]");
  var status = document.querySelector("[data-work-status]");
  var empty = document.querySelector("[data-work-empty]");
  var script = document.querySelector("script[data-work-archive]");
  if (!controller || !grid || !script) return;

  var locale = controller.getAttribute("data-work-locale") === "ar" ? "ar" : "en";
  var initialBatch = 12;
  var copy = locale === "ar"
    ? {
        showing: function (visible, total) { return "عرض " + visible + " من أصل " + total + " مشروعًا"; },
        loadMore: "تحميل المزيد من المشاريع",
        loading: "جارٍ تحميل المشاريع…",
        retry: "إعادة محاولة تحميل المشاريع",
        empty: "لا توجد مشاريع مطابقة لهذا التصنيف.",
        unavailable: "تعذر تحميل باقي المشاريع. المشاريع المعروضة ما زالت متاحة؛ يمكنك إعادة المحاولة.",
        live: "الموقع المباشر",
        caseStudy: "عرض دراسة الحالة",
        technologies: "التقنيات"
      }
    : {
        showing: function (visible, total) { return "Showing " + visible + " of " + total + " projects"; },
        loadMore: "Load more projects",
        loading: "Loading projects…",
        retry: "Retry loading projects",
        empty: "No projects match this category.",
        unavailable: "Could not load the remaining projects. The displayed projects are still available; please retry.",
        live: "Live Site",
        caseStudy: "View Case Study",
        technologies: "Technologies"
      };

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  function safeInternalUrl(value) {
    return typeof value === "string" && /^\/(?:ar\/)?work\/[a-z0-9-]+\/$/.test(value) ? value : "#";
  }

  function safeExternalUrl(value) {
    if (typeof value !== "string") return null;
    try {
      var url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:" ? value : null;
    } catch (_error) {
      return null;
    }
  }

  function renderImage(project, isPrimaryLcp) {
    var thumbnail = project.thumbnail;
    var sizes = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw";
    var sources = [];
    var hasVariants = thumbnail.avif480 || thumbnail.avif800 || thumbnail.webp480 || thumbnail.webp800;
    if (thumbnail.avif480 || thumbnail.avif800) {
      sources.push("<source type=\"image/avif\" srcset=\"" + [
        thumbnail.avif480 && thumbnail.avif480 + " 480w",
        thumbnail.avif800 && thumbnail.avif800 + " 800w"
      ].filter(Boolean).join(", ") + "\" sizes=\"" + sizes + "\">");
    }
    if (thumbnail.webp480 || thumbnail.webp800) {
      sources.push("<source type=\"image/webp\" srcset=\"" + [
        thumbnail.webp480 && thumbnail.webp480 + " 480w",
        thumbnail.webp800 && thumbnail.webp800 + " 800w"
      ].filter(Boolean).join(", ") + "\" sizes=\"" + sizes + "\">");
    }
    var fallback = thumbnail.webp800 || thumbnail.webp480 || thumbnail.original;
    var webpSrcset = [
      thumbnail.webp480 && thumbnail.webp480 + " 480w",
      thumbnail.webp800 && thumbnail.webp800 + " 800w"
    ].filter(Boolean).join(", ");
    var loading = isPrimaryLcp ? "eager" : "lazy";
    var priority = isPrimaryLcp ? " fetchpriority=\"high\"" : "";
    var image = "<img src=\"" + escapeHtml(fallback) + "\"" + (webpSrcset ? " srcset=\"" + escapeHtml(webpSrcset) + "\"" : "") + " sizes=\"" + sizes + "\" width=\"" + thumbnail.width + "\" height=\"" + thumbnail.height + "\" alt=\"" + escapeHtml(project.title[locale]) + "\" loading=\"" + loading + "\" decoding=\"async\"" + priority + " class=\"h-full w-full object-cover object-top opacity-90 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100\">";
    var media = hasVariants ? "<picture data-pilot-thumbnail=\"" + escapeHtml(project.slug) + "\">" + sources.join("") + image + "</picture>" : image;
    return "<div class=\"relative aspect-[4/3] w-full overflow-hidden bg-[#0B1020]\" data-thumbnail-aspect=\"" + escapeHtml(thumbnail.aspectRatio) + "\">" + media + "<div class=\"absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80\"></div></div>";
  }

  function renderCard(project, isPrimaryLcp) {
    var caseStudy = safeInternalUrl(project.caseStudy[locale]);
    var liveUrl = safeExternalUrl(project.liveUrl);
    var technologies = project.technologies.map(function (technology) {
      return "<li class=\"rounded-md border border-white/5 bg-[#1E293B] px-3 py-1.5 text-xs font-semibold text-[#94A3B8]\">" + escapeHtml(technology) + "</li>";
    }).join("");
    var liveLink = liveUrl
      ? "<a href=\"" + escapeHtml(liveUrl) + "\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border border-[#22C55E]/20 bg-[#22C55E]/10 text-[#22C55E] transition-all hover:border-[#22C55E]/40 hover:bg-[#22C55E]/20\"><span class=\"h-1.5 w-1.5 rounded-full bg-[#22C55E]\" aria-hidden=\"true\"></span>" + copy.live + "</a>"
      : "";
    return "<article class=\"group flex flex-col bg-[#111827] rounded-2xl overflow-hidden border border-white/5 hover:border-[#38BDF8]/30 transition-all hover:shadow-[0_10px_30px_rgba(56,189,248,0.05)] hover:-translate-y-1\" data-work-card data-project-id=\"" + escapeHtml(project.id) + "\" data-work-category=\"" + escapeHtml(project.category) + "\" data-availability=\"" + escapeHtml(project.availability) + "\"><a class=\"block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#38BDF8]\" href=\"" + escapeHtml(caseStudy) + "\">" + renderImage(project, isPrimaryLcp) + "<div class=\"flex flex-1 flex-col p-8\"><div class=\"mb-3 text-xs font-bold uppercase tracking-widest text-[#38BDF8]\">" + escapeHtml(project.eyebrow[locale]) + "</div><h3 class=\"mb-3 text-2xl font-bold leading-snug transition-colors group-hover:text-[#38BDF8]\">" + escapeHtml(project.title[locale]) + "</h3><p class=\"line-clamp-2 text-sm leading-relaxed text-[#94A3B8]\">" + escapeHtml(project.description[locale]) + "</p></div></a><div class=\"px-8 pb-8\"><div class=\"flex flex-wrap gap-3\">" + liveLink + "<a href=\"" + escapeHtml(caseStudy) + "\" class=\"inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border border-[#38BDF8]/20 bg-[#38BDF8]/10 text-[#38BDF8] transition-all hover:border-[#38BDF8]/40 hover:bg-[#38BDF8]/20\">" + copy.caseStudy + "</a></div><ul aria-label=\"" + copy.technologies + "\" class=\"mt-6 flex flex-wrap gap-2\">" + technologies + "</ul></div></article>";
  }

  function setControlsEnabled(enabled) {
    controller.querySelectorAll("[data-work-filter]").forEach(function (button) { button.disabled = !enabled; });
    if (loadMore) {
      loadMore.disabled = !enabled;
    }
  }

  function update(projects, category, visibleCount, prioritizeFirst, append) {
    var matching = category === "all" ? projects : projects.filter(function (project) { return project.category === category; });
    var visible = matching.slice(0, visibleCount);
    if (append) {
      var previousCount = grid.children.length;
      grid.insertAdjacentHTML("beforeend", visible.slice(previousCount).map(function (project) { return renderCard(project, false); }).join(""));
      var nextLink = grid.children[previousCount] && grid.children[previousCount].querySelector("a[href]");
      if (nextLink) nextLink.focus();
    } else if (!prioritizeFirst || grid.children.length !== visible.length || !visible.every(function (project, index) {
      return grid.children[index].getAttribute("data-project-id") === project.id;
    })) {
      grid.innerHTML = visible.map(function (project, index) { return renderCard(project, prioritizeFirst && index === 0); }).join("");
    }
    if (status) status.textContent = copy.showing(visible.length, matching.length);
    if (empty) {
      empty.textContent = copy.empty;
      empty.hidden = matching.length !== 0;
    }
    if (loadMore) {
      loadMore.textContent = copy.loadMore;
      loadMore.hidden = visible.length >= matching.length;
      loadMore.disabled = false;
    }
  }

  var projects = null, category = "all", visibleCount = initialBatch, loading = false;
  controller.querySelectorAll("[data-work-filter]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (!projects || loading) return;
      category = button.getAttribute("data-work-filter") || "all";
      visibleCount = initialBatch;
      controller.querySelectorAll("[data-work-filter]").forEach(function (item) {
        item.setAttribute("aria-pressed", item === button ? "true" : "false");
      });
      update(projects, category, visibleCount, false);
    });
  });
  if (loadMore) loadMore.addEventListener("click", function () {
    if (loading) return;
    if (!projects) return loadProjects();
    visibleCount += initialBatch;
    update(projects, category, visibleCount, false, true);
  });

  function loadProjects() {
    if (loading) return;
    loading = true;
    setControlsEnabled(false);
    if (status) status.textContent = copy.loading;
    if (loadMore) {
      loadMore.hidden = false;
      loadMore.textContent = copy.loading;
      loadMore.setAttribute("aria-busy", "true");
    }
    var abort = new AbortController(), timer;
    // Race the complete response, including JSON, so a stalled body also permits retry.
    Promise.race([
      fetch(script.getAttribute("data-project-data") || "/data/projects.json", { credentials: "same-origin", cache: "no-cache", signal: abort.signal })
        .then(function (response) {
          if (!response.ok) throw new Error("Project data request failed: " + response.status);
          return response.json();
        }),
      new Promise(function (_resolve, reject) {
        timer = setTimeout(function () { abort.abort(); reject(new Error("Project data request timed out")); }, 10000);
      })
    ]).then(function (document) {
      if (!document || !Array.isArray(document.projects) || !document.projects.length) throw new Error("Invalid project data");
      projects = document.projects;
      setControlsEnabled(true);
      update(projects, category, visibleCount, true);
    }).catch(function (error) {
      projects = null;
      setControlsEnabled(false);
      if (status) status.textContent = copy.unavailable;
      if (loadMore) {
        loadMore.hidden = false;
        loadMore.disabled = false;
        loadMore.textContent = copy.retry;
      }
      console.warn("[work-archive] " + error.message);
    }).finally(function () {
      clearTimeout(timer);
      loading = false;
      if (loadMore) loadMore.setAttribute("aria-busy", "false");
    });
  }
  loadProjects();
}());
