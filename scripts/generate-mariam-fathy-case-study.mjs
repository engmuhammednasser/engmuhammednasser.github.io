import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const gallery = JSON.parse(fs.readFileSync(path.join(root, "data/mariam-fathy-gallery.json"), "utf8"));
const templates = { en: "work/techmart/index.html", ar: "ar/work/techmart/index.html" };
const outputs = { en: "work/mariam-fathy-shop/index.html", ar: "ar/work/mariam-fathy-shop/index.html" };

const content = {
  en: {
    title: "Mariam Fathy Shop — Laravel E-Commerce Platform",
    category: "Laravel / E-Commerce / Full-Stack",
    hero: "A custom Laravel e-commerce platform with a responsive customer storefront and a MoonShine administration dashboard for catalog, media, products, and orders.",
    liveLabel: "View Live Store",
    problemTitle: "The Problem",
    problem: "The brand needed a focused storefront that could present modest womenswear with clear collection discovery and a straightforward path from product browsing to cart and checkout. The operational side also needed a single administration workspace for catalog, media, and order management.",
    solutionTitle: "The Solution",
    solution: "The implementation pairs a tailored Laravel storefront with a native MoonShine dashboard. The public experience organizes homepage storytelling, categories, product pages, cart, checkout, journal, and contact routes; the private workspace exposes catalog, media, products, and order records through focused administrative screens.",
    featuresTitle: "Key Features",
    features: ["Laravel storefront and product catalog", "Collection and category discovery", "Product detail and media presentation", "Cart and checkout journey", "MoonShine catalog and media workspace", "Order list and order-detail operations", "Responsive desktop and mobile storefronts"],
    roleTitle: "My Role",
    roles: ["Laravel Developer", "Full-Stack Implementation"],
    stackTitle: "Tech Stack",
    stack: ["Laravel", "PHP", "MoonShine", "Inertia.js", "React"],
    openingBadges: ["Laravel", "E-Commerce", "Full-Stack", "Administration Dashboard", "Responsive Storefront"],
    ctaTitle: "Need a Laravel commerce build?",
    ctaText: "I can help shape catalog, checkout, and operational workflows into a focused commerce experience.",
    ctaButton: "Start a Similar Project",
    contactHref: "/contact/"
  },
  ar: {
    title: "متجر مريم فتحي — منصة تجارة إلكترونية مبنية بـ Laravel",
    category: "Laravel / التجارة الإلكترونية / Full-Stack",
    hero: "منصة تجارة إلكترونية مخصصة مبنية بـ Laravel، تضم متجرًا متجاوبًا للعملاء ولوحة إدارة MoonShine للكتالوج والوسائط والمنتجات والطلبات.",
    liveLabel: "زيارة المتجر",
    problemTitle: "المشكلة",
    problem: "كانت العلامة تحتاج إلى واجهة متجر مركزة تعرض الأزياء المحتشمة وتوضح اكتشاف المجموعات، مع مسار مباشر من تصفح المنتج إلى السلة وإتمام الطلب. كما احتاج الجانب التشغيلي إلى مساحة إدارية واحدة لإدارة الكتالوج والوسائط والطلبات.",
    solutionTitle: "الحل",
    solution: "يجمع التنفيذ بين واجهة متجر مخصصة مبنية بـ Laravel ولوحة MoonShine أصلية. تنظم الواجهة العامة الصفحة الرئيسية والتصنيفات وصفحات المنتجات والسلة والدفع والمجلة والتواصل، بينما تعرض المساحة الخاصة الكتالوج والوسائط والمنتجات وسجلات الطلبات من خلال شاشات إدارية واضحة.",
    featuresTitle: "أهم المميزات",
    features: ["واجهة متجر وكتالوج مبنيان بـ Laravel", "اكتشاف المجموعات والتصنيفات", "عرض تفاصيل المنتج والوسائط", "رحلة السلة وإتمام الطلب", "مساحة MoonShine لإدارة الكتالوج والوسائط", "شاشات قائمة الطلبات وتفاصيلها", "واجهة متجر متجاوبة على سطح المكتب والموبايل"],
    roleTitle: "دوري في المشروع",
    roles: ["مطور Laravel", "تنفيذ Full-Stack"],
    stackTitle: "التقنيات المستخدمة",
    stack: ["Laravel", "PHP", "MoonShine", "Inertia.js", "React"],
    openingBadges: ["Laravel", "التجارة الإلكترونية", "Full-Stack", "لوحة إدارة", "متجر متجاوب"],
    ctaTitle: "تحتاج متجرًا مبنيًا بـ Laravel؟",
    ctaText: "يمكنني مساعدتك في تنظيم الكتالوج والدفع والتشغيل داخل تجربة تجارة إلكترونية مركزة.",
    ctaButton: "ابدأ مشروعًا مشابهًا",
    contactHref: "/ar/contact/"
  }
};

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function flattenGroup(group) {
  if (group.items) return [{ variant: null, items: group.items }];
  return group.variants.map((variant) => ({ variant, items: variant.items }));
}

function screenshotCard(locale, group, item) {
  const caption = item.caption[locale];
  const ariaSuffix = locale === "ar" ? "عرض الصورة كاملاً" : "full screenshot";
  const height = group.id === "mobile" ? "620px" : "440px";
  const maxWidth = group.id === "mobile" ? "width:100%;max-width:460px;margin-left:auto;margin-right:auto" : "width:100%";
  const imagePath = `/projects/mariam-fathy-shop/${item.target}`;
  return `<div class="flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#111827] shadow-lg hover:border-white/20 hover:shadow-[0_8px_30px_rgba(56,189,248,0.07)] transition-all duration-300" style="${maxWidth}"><button type="button" aria-label="${escapeHtml(caption)} — ${ariaSuffix}" data-full-src="${imagePath}" data-gallery-group="${group.id}" class="relative block w-full text-left rtl:text-right outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] focus-visible:ring-inset cursor-zoom-in" style="width:100%;height:${height};overflow:hidden;flex-shrink:0"><img src="${imagePath}" alt="${escapeHtml(`Mariam Fathy Shop — ${caption}`)}" loading="lazy" decoding="async" style="width:100%;height:auto;display:block;transform:translateY(0);transition:transform 1.5s ease-in-out;will-change:transform"/><div aria-hidden="true" style="position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(to top, rgba(17,24,39,0.95) 0%, transparent 100%);opacity:1;transition:opacity 0.5s ease;pointer-events:none"></div><div aria-hidden="true" class="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 bg-black/60 border border-white/15 text-white/70 text-xs font-semibold rounded-lg backdrop-blur-sm">${locale === "ar" ? "صفحة كاملة" : "Full page"}</div><div aria-hidden="true" style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);opacity:0.85;transition:opacity 0.3s ease;white-space:nowrap;pointer-events:none" class="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-sm border border-white/10 rounded-full"><span class="text-white/70 text-xs font-medium">${locale === "ar" ? "مرّر لعرض الصورة كاملة" : "Hover to scroll preview"}</span></div><div aria-hidden="true" class="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors duration-300"><div style="opacity:0;transform:scale(0.8);transition:opacity 0.2s ease, transform 0.2s ease" class="p-3 bg-black/60 backdrop-blur-sm rounded-full border border-white/10"><svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"></path></svg></div></div></button><div class="px-5 py-4 space-y-1.5 flex-1"><p class="text-white font-semibold text-base leading-snug">${escapeHtml(caption)}</p></div></div>`;
}

function groupSection(locale, group) {
  const gridClass = group.id === "mobile" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "grid grid-cols-1 sm:grid-cols-2 gap-6";
  const variants = flattenGroup(group).map(({ variant, items }) => {
    const variantHeading = variant ? `<h3 class="text-xl font-bold tracking-tight text-[#CBD5E1]">${escapeHtml(variant.label[locale])}</h3>` : "";
    return `<div class="space-y-5">${variantHeading}<div class="${gridClass}">${items.map((item) => screenshotCard(locale, group, item)).join("")}</div></div>`;
  }).join("");
  return `<section class="max-w-6xl mx-auto space-y-8"><div class="space-y-3"><h2 class="text-3xl font-bold tracking-tight">${escapeHtml(group.title[locale])}</h2><p class="text-[#94A3B8] text-lg leading-relaxed max-w-4xl">${escapeHtml(group.intro[locale])}</p></div>${variants}</section>`;
}

function gallerySections(locale) {
  return gallery.sourceGroups.map((group) => groupSection(locale, group)).join("");
}

function buildMain(locale) {
  const features = content[locale].features.map((feature) => `<li class="flex items-start gap-3"><svg class="w-6 h-6 text-[#38BDF8] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>${escapeHtml(feature)}</span></li>`).join("");
  const tags = content[locale].stack.map((tag) => `<span class="px-4 py-2 bg-[#1E293B] text-sm font-semibold rounded-md border border-white/5 text-[#94A3B8]">${escapeHtml(tag)}</span>`).join("");
  const roles = content[locale].roles.map((role) => `<li class="font-semibold text-lg text-[#F8FAFC]">${escapeHtml(role)}</li>`).join("");
  const badges = content[locale].openingBadges.map((badge) => `<span class="px-3 py-1.5 rounded-full border border-[#38BDF8]/30 bg-[#38BDF8]/10 text-[#BAE6FD] text-sm font-semibold">${escapeHtml(badge)}</span>`).join("");
  const openingLines = locale === "ar" ? "منصة تجارة إلكترونية مخصصة بـ Laravel<br/>متجر متجاوب للعملاء<br/>لوحة إدارة MoonShine" : "Custom Laravel E-Commerce Platform<br/>Responsive Customer Storefront<br/>MoonShine Administration Dashboard";
  return `<main class="flex-1" id="main-content"><div class="container mx-auto px-4 py-20 space-y-24"><header class="max-w-5xl mx-auto space-y-8 text-center"><div class="text-sm font-bold text-[#38BDF8] uppercase tracking-widest">${escapeHtml(content[locale].category)}</div><h1 class="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">${escapeHtml(content[locale].title)}</h1><p class="text-xl md:text-2xl text-[#F8FAFC] max-w-4xl mx-auto leading-relaxed">${openingLines}</p><p class="text-lg md:text-xl text-[#94A3B8] max-w-3xl mx-auto leading-relaxed">${escapeHtml(content[locale].hero)}</p><div class="flex flex-wrap items-center justify-center gap-2">${badges}</div><div class="flex flex-wrap items-center justify-center gap-4 pt-2"><a href="https://mariamfathyshop.com/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-8 py-4 bg-[#22C55E] text-white font-bold text-lg rounded-lg hover:bg-[#22C55E]/90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]">${escapeHtml(content[locale].liveLabel)}</a></div></header><div class="relative aspect-video max-w-5xl mx-auto rounded-xl overflow-hidden border border-white/10 shadow-2xl"><img alt="${escapeHtml(content[locale].title)} storefront cover" decoding="async" class="object-cover object-top" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" src="/projects/mariam-fathy-shop/cover.png"/></div><div class="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-6xl mx-auto"><div class="md:col-span-2 space-y-16"><section><h2 class="text-3xl font-bold mb-6 tracking-tight">${escapeHtml(content[locale].problemTitle)}</h2><p class="text-[#94A3B8] text-lg leading-relaxed whitespace-pre-wrap">${escapeHtml(content[locale].problem)}</p></section><section><h2 class="text-3xl font-bold mb-6 tracking-tight">${escapeHtml(content[locale].solutionTitle)}</h2><p class="text-[#94A3B8] text-lg leading-relaxed whitespace-pre-wrap">${escapeHtml(content[locale].solution)}</p></section><section><h2 class="text-3xl font-bold mb-6 tracking-tight">${escapeHtml(content[locale].featuresTitle)}</h2><ul class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#94A3B8] text-lg">${features}</ul></section></div><aside class="space-y-10 bg-[#111827] p-8 rounded-2xl border border-white/5 h-fit shadow-lg sticky top-24"><div><h3 class="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4">${escapeHtml(content[locale].roleTitle)}</h3><ul class="space-y-2">${roles}</ul></div><div><h3 class="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4">${escapeHtml(content[locale].stackTitle)}</h3><div class="flex flex-wrap gap-2">${tags}</div></div><div class="pt-6 border-t border-white/5"><a href="${content[locale].contactHref}" class="block w-full text-center py-4 bg-[#38BDF8] text-[#0B1020] font-bold text-lg rounded-lg hover:bg-[#38BDF8]/90 hover:scale-105 transition-all">${escapeHtml(content[locale].ctaButton)}</a></div></aside></div>${gallerySections(locale)}</div></main>`;
}

for (const [locale, template] of Object.entries(templates)) {
  let html = fs.readFileSync(path.join(root, template), "utf8");
  html = html.replaceAll("/work/techmart/", "/work/mariam-fathy-shop/").replaceAll("/ar/work/techmart/", "/ar/work/mariam-fathy-shop/").replaceAll("/projects/techmart/", "/projects/mariam-fathy-shop/");
  html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(content[locale].title)} | ${locale === "ar" ? "محمد ناصر" : "Muhammed Nasser"}</title>`);
  html = html.replace(/<main class="flex-1" id="main-content">[\s\S]*?<\/main>/, buildMain(locale));
  html = html.replace(/<script>self\.__next_f\.push\([\s\S]*?<\/script>/g, "");
  html = html.replace(/<script>\(self\.__next_f=self\.__next_f\|\|\[\]\)\.push\(\[0\]\)<\/script>/g, "");
  html = html.replace(/<script[^>]+src="\/_next\/[^\"]+"[^>]*><\/script>/g, "");
  html = html.replace(/<link[^>]+href="\/_next\/[^\"]+"[^>]*>/g, "");
  if (!html.includes("/scripts/case-study-screenshots.js")) html = html.replace("</body>", '<script src="/scripts/case-study-screenshots.js" defer></script></body>');
  const output = path.join(root, outputs[locale]);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, html, "utf8");
  console.log(`Generated ${outputs[locale]}`);
}
