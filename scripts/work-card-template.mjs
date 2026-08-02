const cardClasses = "group flex flex-col bg-[#111827] rounded-2xl overflow-hidden border border-white/5 hover:border-[#38BDF8]/30 transition-all hover:shadow-[0_10px_30px_rgba(56,189,248,0.05)] hover:-translate-y-1";
const actionClasses = "inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border transition-all";

export const localeCopy = {
  en: {
    filterLabel: "Filter projects",
    showing: (visible, total) => `Showing ${visible} of ${total} projects`,
    loadMore: "Load more projects",
    allLoaded: "All matching projects are visible",
    empty: "No projects match this category.",
    live: "Live Site",
    caseStudy: "View Case Study",
    technologies: "Technologies",
    allProjects: "All projects"
  },
  ar: {
    filterLabel: "تصفية المشاريع",
    showing: (visible, total) => `عرض ${visible} من أصل ${total} مشروعًا`,
    loadMore: "تحميل المزيد من المشاريع",
    allLoaded: "تم عرض جميع المشاريع المطابقة",
    empty: "لا توجد مشاريع مطابقة لهذا التصنيف.",
    live: "الموقع المباشر",
    caseStudy: "عرض دراسة الحالة",
    technologies: "التقنيات",
    allProjects: "كل المشاريع"
  }
};

export function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));
}

function renderImage(project, isPrimaryLcp = false) {
  const thumbnail = project.thumbnail;
  const alt = escapeHtml(project.title);
  const dimensions = `width="${thumbnail.width}" height="${thumbnail.height}"`;
  const sizes = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw";
  const hasVariants = thumbnail.avif480 || thumbnail.avif800 || thumbnail.webp480 || thumbnail.webp800;
  const sources = [];

  if (thumbnail.avif480 || thumbnail.avif800) {
    sources.push(`<source type="image/avif" srcset="${[
      thumbnail.avif480 && `${thumbnail.avif480} 480w`,
      thumbnail.avif800 && `${thumbnail.avif800} 800w`
    ].filter(Boolean).join(", ")}" sizes="${sizes}">`);
  }
  if (thumbnail.webp480 || thumbnail.webp800) {
    sources.push(`<source type="image/webp" srcset="${[
      thumbnail.webp480 && `${thumbnail.webp480} 480w`,
      thumbnail.webp800 && `${thumbnail.webp800} 800w`
    ].filter(Boolean).join(", ")}" sizes="${sizes}">`);
  }

  const fallback = thumbnail.webp800 || thumbnail.webp480 || thumbnail.original;
  const loading = isPrimaryLcp ? "eager" : "lazy";
  const priority = isPrimaryLcp ? ` fetchpriority="high"` : "";
  const image = `<img src="${escapeHtml(fallback)}"${hasVariants ? ` srcset="${[
    thumbnail.webp480 && `${thumbnail.webp480} 480w`,
    thumbnail.webp800 && `${thumbnail.webp800} 800w`
  ].filter(Boolean).join(", ")}"` : ""} sizes="${sizes}" ${dimensions} alt="${alt}" loading="${loading}" decoding="async"${priority} class="h-full w-full object-cover object-top opacity-90 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100">`;
  const media = hasVariants
    ? `<picture data-pilot-thumbnail="${escapeHtml(project.slug)}">${sources.join("")}${image}</picture>`
    : image;

  return `<div class="relative aspect-[4/3] w-full overflow-hidden bg-[#0B1020]" data-thumbnail-aspect="${escapeHtml(String(thumbnail.aspectRatio))}">${media}<div class="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80"></div></div>`;
}

function renderLiveLink(project, copy) {
  if (!project.liveUrl) return "";
  return `<a href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer" class="${actionClasses} bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20 hover:bg-[#22C55E]/20 hover:border-[#22C55E]/40"><span class="h-1.5 w-1.5 rounded-full bg-[#22C55E]" aria-hidden="true"></span>${escapeHtml(copy.live)}</a>`;
}

export function renderProjectCard(project, locale, isPrimaryLcp = false) {
  const copy = localeCopy[locale];
  const localized = {
    ...project,
    title: project.title[locale],
    description: project.description[locale],
    eyebrow: project.eyebrow[locale],
    caseStudy: project.caseStudy[locale]
  };
  const technologies = localized.technologies.map((technology) => `<li class="rounded-md border border-white/5 bg-[#1E293B] px-3 py-1.5 text-xs font-semibold text-[#94A3B8]">${escapeHtml(technology)}</li>`).join("");

  return `<article class="${cardClasses}" data-work-card data-project-id="${escapeHtml(project.id)}" data-work-category="${escapeHtml(project.category)}" data-availability="${escapeHtml(project.availability)}">
  <a class="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#38BDF8]" href="${escapeHtml(localized.caseStudy)}">
    ${renderImage({ ...localized, title: localized.title }, isPrimaryLcp)}
    <div class="flex flex-1 flex-col p-8">
      <div class="mb-3 text-xs font-bold uppercase tracking-widest text-[#38BDF8]">${escapeHtml(localized.eyebrow)}</div>
      <h3 class="mb-3 text-2xl font-bold leading-snug transition-colors group-hover:text-[#38BDF8]">${escapeHtml(localized.title)}</h3>
      <p class="line-clamp-2 text-sm leading-relaxed text-[#94A3B8]">${escapeHtml(localized.description)}</p>
    </div>
  </a>
  <div class="px-8 pb-8">
    <div class="flex flex-wrap gap-3">${renderLiveLink(project, copy)}<a href="${escapeHtml(localized.caseStudy)}" class="${actionClasses} border-[#38BDF8]/20 bg-[#38BDF8]/10 text-[#38BDF8] hover:border-[#38BDF8]/40 hover:bg-[#38BDF8]/20">${escapeHtml(copy.caseStudy)}</a></div>
    <ul aria-label="${escapeHtml(copy.technologies)}" class="mt-6 flex flex-wrap gap-2">${technologies}</ul>
  </div>
</article>`;
}

export function renderFilterShell(document, locale) {
  const copy = localeCopy[locale];
  const counts = Object.fromEntries(document.categories.filter((category) => category.id !== "all").map((category) => [
    category.id,
    document.projects.filter((project) => project.category === category.id).length
  ]));
  const buttons = document.categories.map((category, index) => `<button type="button" class="min-h-11 rounded-full border border-white/10 bg-[#0F172A]/80 px-4 py-3 text-sm font-bold text-[#94A3B8] transition-colors hover:border-[#38BDF8]/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#38BDF8]" data-work-filter="${escapeHtml(category.id)}" aria-pressed="${index === 0 ? "true" : "false"}">${escapeHtml(category.id === "all" ? copy.allProjects : category.label[locale])}<span aria-hidden="true" class="rounded-full bg-white/10 px-2 py-0.5 text-xs">${category.id === "all" ? document.projects.length : counts[category.id]}</span></button>`).join("");

  return `<!-- work-filter:start --><div class="work-filter-shell mb-8 w-full" data-work-filter-controller data-work-locale="${escapeHtml(locale)}">
  <div class="mb-3 text-center"><p class="text-sm font-bold uppercase tracking-widest text-[#94A3B8]" id="work-filter-label">${escapeHtml(copy.filterLabel)}</p></div>
  <div class="flex flex-wrap justify-center gap-3" role="group" aria-labelledby="work-filter-label">${buttons}</div>
  <p class="mt-4 text-center text-sm text-[#94A3B8]" data-work-status aria-live="polite">${escapeHtml(copy.showing(Math.min(12, document.projects.length), document.projects.length))}</p>
</div><!-- work-filter:end -->`;
}

export function renderNoScriptList(document, locale) {
  const copy = localeCopy[locale];
  const links = document.projects.map((project) => `<li><a href="${escapeHtml(project.caseStudy[locale])}">${escapeHtml(project.title[locale])}</a></li>`).join("");
  return `<noscript><section class="mx-auto mt-12 max-w-7xl rounded-2xl border border-white/10 bg-[#111827] p-6" aria-label="${escapeHtml(copy.allProjects)}"><h2 class="mb-4 text-xl font-bold">${escapeHtml(copy.allProjects)}</h2><ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">${links}</ul></section></noscript>`;
}

export function renderLoadMore(document, locale) {
  const copy = localeCopy[locale];
  const initial = Math.min(12, document.projects.length);
  return `<div class="mt-10 text-center" data-work-load-more-shell><button type="button" class="min-h-11 rounded-full border border-[#38BDF8]/40 bg-[#38BDF8]/10 px-6 py-3 text-sm font-bold text-[#38BDF8] transition-colors hover:bg-[#38BDF8]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#38BDF8]" data-work-load-more aria-controls="work-project-grid"${initial >= document.projects.length ? " hidden" : ""}>${escapeHtml(copy.loadMore)}</button></div><p class="sr-only" data-work-empty role="status" hidden>${escapeHtml(copy.empty)}</p>`;
}
