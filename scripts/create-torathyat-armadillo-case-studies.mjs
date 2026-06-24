import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const templateEn = path.join(root, "work", "kuwait-arc", "index.html");
const templateAr = path.join(root, "ar", "work", "kuwait-arc", "index.html");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function write(relativePath, content) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
  console.log(`Updated ${relativePath}`);
}

const projects = [
  {
    slug: "torathyat",
    directory: "torathyat",
    categoryKey: "ecommerce",
    files: [
      ["01-home.jpg", "Home Page", "الصفحة الرئيسية"],
      ["02-about-us.jpg", "About Us", "من نحن"],
      ["03-shop.jpg", "Shop Page", "صفحة المتجر"],
      ["04-category-guns.jpg", "Guns Category", "تصنيف البنادق"],
      ["05-category-ateef.jpg", "Heritage Pieces Category", "تصنيف القطع التراثية"],
      ["06-product-rifle.jpg", "Featured Product Page", "صفحة منتج مميز"],
      ["07-product-plate-set.jpg", "Decorative Set Product Page", "صفحة منتج طقم ديكوري"]
    ],
    en: {
      title: "Torathyat Heritage Storefront",
      meta:
        "A heritage-focused WooCommerce storefront for Torathyat, presenting handcrafted decorative products, category-led shopping, and product storytelling through a polished Arabic e-commerce experience.",
      category: "WooCommerce / Heritage E-Commerce",
      heroTitle: "Torathyat Heritage Storefront",
      heroDescription:
        "A heritage commerce storefront built for Torathyat, combining category-led shopping, rich product presentation, and visual merchandising for handcrafted decor and collectible pieces.",
      liveLabel: "View Live Store",
      liveHref: "https://torathyat.com/",
      problem:
        "Torathyat needed a storefront that could present handcrafted heritage products with more clarity and atmosphere, while making discovery easier across decorative categories, featured pieces, and detailed product pages.",
      solution:
        "The site was structured as a curated WooCommerce storefront with stronger visual storytelling, category entry points, product detail depth, and a cleaner path from browsing to purchase. The experience supports merchandise discovery while keeping the heritage character of the brand visible throughout the catalog.",
      features: [
        "Custom WooCommerce storefront",
        "Arabic-first shopping experience",
        "Category-led product discovery",
        "Large-format visual merchandising",
        "Detailed product presentation",
        "Performance-conscious front-end delivery",
        "SEO-friendly product structure"
      ],
      roleTitle: "My Role",
      roles: ["Lead Developer"],
      stackTitle: "Tech Stack",
      stack: ["WordPress", "WooCommerce", "PHP", "Elementor", "JavaScript"],
      screenshotTitle: "Project Screenshots",
      fullPage: "Full page",
      hover: "Hover to scroll preview",
      tap: "Tap to view",
      ctaText: "Need a branded WooCommerce storefront?",
      whatsappText:
        "Hello Muhammed, I saw the Torathyat Heritage Storefront project and I need a similar project.",
      cardTitle: "Torathyat Heritage Storefront",
      cardDescription:
        "A heritage-focused WooCommerce store for Torathyat, showcasing handcrafted decor categories, featured products, and a polished Arabic storefront experience.",
      cardCategory: "WooCommerce / Heritage E-Commerce",
      cardTags: ["WordPress", "WooCommerce", "Arabic Store"]
    },
    ar: {
      title: "متجر تراثيات الإلكتروني",
      meta:
        "متجر WooCommerce مخصص لعلامة تراثيات يعرض المنتجات التراثية والديكورية من خلال تجربة تسوق عربية واضحة، وصفحات تصنيفات، وعرض بصري مميز للمنتجات.",
      category: "WooCommerce / متجر تراثي",
      heroTitle: "متجر تراثيات الإلكتروني",
      heroDescription:
        "متجر تراثي مبني لعلامة تراثيات، يجمع بين عرض الفئات، والتقديم البصري القوي للمنتجات، وتجربة تسوق واضحة للقطع اليدوية والديكورات التراثية.",
      liveLabel: "زيارة المتجر",
      liveHref: "https://torathyat.com/",
      problem:
        "كان متجر تراثيات يحتاج إلى واجهة تعرض المنتجات التراثية بشكل أوضح وأكثر جاذبية، وتسهّل على الزائر اكتشاف الفئات المختلفة والمنتجات المميزة وصفحات التفاصيل دون فقدان الطابع التراثي للعلامة.",
      solution:
        "تم تنظيم الموقع كمتجر WooCommerce مخصص يعتمد على عرض بصري أقوى، ومداخل واضحة للتصنيفات، وصفحات منتجات أكثر تفصيلًا، ومسار أبسط من التصفح إلى الشراء. التجربة تساعد على اكتشاف المنتجات مع الحفاظ على هوية العلامة التراثية داخل المتجر.",
      features: [
        "متجر WooCommerce مخصص",
        "تجربة تسوق عربية واضحة",
        "اكتشاف المنتجات عبر التصنيفات",
        "عرض بصري قوي للمنتجات",
        "صفحات منتجات تفصيلية",
        "واجهة محسّنة للأداء",
        "هيكلة مناسبة لمحركات البحث"
      ],
      roleTitle: "دوري في المشروع",
      roles: ["Lead Developer"],
      stackTitle: "التقنيات المستخدمة",
      stack: ["WordPress", "WooCommerce", "PHP", "Elementor", "JavaScript"],
      screenshotTitle: "صور المشروع",
      fullPage: "صفحة كاملة",
      hover: "مرّر لعرض الصورة كاملة",
      tap: "اضغط للعرض",
      ctaText: "تحتاج متجر WooCommerce بهوية قوية؟",
      whatsappText:
        "أهلاً محمد، شاهدت مشروع متجر تراثيات الإلكتروني وأحتاج لمشروع مشابه.",
      cardTitle: "متجر تراثيات الإلكتروني",
      cardDescription:
        "متجر WooCommerce مخصص لعلامة تراثيات يعرض الفئات التراثية والمنتجات المميزة من خلال تجربة عربية واضحة وغنية بصريًا.",
      cardCategory: "WooCommerce / متجر تراثي",
      cardTags: ["WordPress", "WooCommerce", "Arabic Store"]
    }
  },
  {
    slug: "armadillo-studio",
    directory: "armadillo-studio",
    categoryKey: "corporate",
    files: [
      ["01-home.png", "Home Page", "الصفحة الرئيسية"],
      ["02-partners.png", "Partners Section", "قسم الشركاء"],
      ["03-contact.png", "Contact Page", "صفحة التواصل"]
    ],
    en: {
      title: "Armadillo Studio Creative Portfolio Platform",
      meta:
        "A creative portfolio platform for Armadillo Studio, highlighting agency capabilities, featured work, client roster, and high-visual case study storytelling.",
      category: "Agency / Creative / Portfolio",
      heroTitle: "Armadillo Studio Creative Portfolio Platform",
      heroDescription:
        "A creative agency portfolio platform for Armadillo Studio, built to present studio identity, partners, and contact flow through a bold visual experience.",
      liveLabel: "View Live Site",
      liveHref: "https://armadillo.studio/",
      problem:
        "Armadillo Studio needed a stronger digital presentation for its agency identity and project catalog, with a clearer structure for featured work, client trust signals, and visually rich case studies.",
      solution:
        "The site was shaped as a visual-first creative portfolio that balances agency branding with trust signals and a clear inquiry path. It presents the homepage, partners, and contact experience in a polished, editorial layout that is easy to scan.",
      features: [
        "Custom creative portfolio website",
        "Editorial homepage storytelling",
        "Partner and trust presentation",
        "High-visual agency identity",
        "Agency contact and lead capture flow",
        "Performance-minded media presentation",
        "SEO-friendly portfolio structure"
      ],
      roleTitle: "My Role",
      roles: ["Lead Developer"],
      stackTitle: "Tech Stack",
      stack: ["WordPress", "Elementor", "PHP", "CSS", "JavaScript"],
      screenshotTitle: "Project Screenshots",
      fullPage: "Full page",
      hover: "Hover to scroll preview",
      tap: "Tap to view",
      ctaText: "Need a visual agency portfolio?",
      whatsappText:
        "Hello Muhammed, I saw the Armadillo Studio Creative Portfolio Platform project and I need a similar project.",
      cardTitle: "Armadillo Studio Creative Portfolio Platform",
      cardDescription:
        "A creative portfolio website for Armadillo Studio, showcasing studio identity, partner presentation, and a bold visual contact journey.",
      cardCategory: "Agency / Creative / Portfolio",
      cardTags: ["WordPress", "Creative Agency", "Portfolio Website"]
    },
    ar: {
      title: "منصة Armadillo Studio الإبداعية",
      meta:
        "منصة بورتفوليو إبداعية لـ Armadillo Studio تعرض أعمال الوكالة والعملاء ودراسات الحالة من خلال تجربة بصرية قوية ومنظمة.",
      category: "وكالة / إبداعي / بورتفوليو",
      heroTitle: "منصة Armadillo Studio الإبداعية",
      heroDescription:
        "منصة بورتفوليو لوكالة Armadillo Studio، مبنية لعرض هوية الاستوديو، والشركاء، ومسار التواصل من خلال تجربة بصرية جريئة ومنظمة.",
      liveLabel: "زيارة الموقع",
      liveHref: "https://armadillo.studio/",
      problem:
        "كانت Armadillo Studio تحتاج إلى حضور رقمي أقوى يعبّر عن هوية الوكالة ويعرض أرشيف الأعمال بشكل أوضح، مع إبراز ثقة العملاء ودراسات الحالة بأسلوب بصري متماسك.",
      solution:
        "تم تشكيل الموقع كبورتفوليو بصري للوكالة يوازن بين الهوية الإبداعية وإشارات الثقة ومسار التواصل الواضح. يعرض الصفحة الرئيسية وقسم الشركاء وتجربة التواصل بطريقة أنيقة وسهلة في التصفح والمسح البصري.",
      features: [
        "موقع بورتفوليو إبداعي مخصص",
        "سرد بصري قوي في الصفحة الرئيسية",
        "إبراز الشركاء والثقة",
        "هوية بصرية قوية للوكالة",
        "تجربة تواصل واضحة مع الوكالة",
        "عرض وسائط محسّن للأداء",
        "هيكلة مناسبة لمحركات البحث"
      ],
      roleTitle: "دوري في المشروع",
      roles: ["Lead Developer"],
      stackTitle: "التقنيات المستخدمة",
      stack: ["WordPress", "Elementor", "PHP", "CSS", "JavaScript"],
      screenshotTitle: "صور المشروع",
      fullPage: "صفحة كاملة",
      hover: "مرّر لعرض الصورة كاملة",
      tap: "اضغط للعرض",
      ctaText: "تحتاج موقع بورتفوليو إبداعي للوكالة؟",
      whatsappText:
        "أهلاً محمد، شاهدت مشروع منصة Armadillo Studio الإبداعية وأحتاج لمشروع مشابه.",
      cardTitle: "منصة Armadillo Studio الإبداعية",
      cardDescription:
        "موقع بورتفوليو إبداعي لـ Armadillo Studio يعرض هوية الاستوديو والشركاء وتجربة تواصل بصرية قوية.",
      cardCategory: "وكالة / إبداعي / بورتفوليو",
      cardTags: ["WordPress", "Creative Agency", "Portfolio Website"]
    }
  }
];

function buildScreenshotCards(project, locale, isArabic) {
  return project.files
    .map(([file, titleEn, titleAr]) => {
      const label = isArabic ? titleAr : titleEn;
      const ariaLabel = isArabic ? `عرض ${label} كاملاً` : `View ${titleEn} full screenshot`;
      return `<div class="flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#111827] shadow-lg hover:border-white/20 hover:shadow-[0_8px_30px_rgba(56,189,248,0.07)] transition-all duration-300"><button type="button" aria-label="${ariaLabel}" class="relative block w-full text-left rtl:text-right outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] focus-visible:ring-inset cursor-zoom-in" style="height:420px;overflow:hidden;flex-shrink:0"><img src="/projects/${project.directory}/full-page/${file}" alt="${locale.heroTitle} screenshot" style="width:100%;height:auto;display:block;transform:translateY(0);transition:transform 1.5s ease-in-out;will-change:transform"/><div aria-hidden="true" style="position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(to top, rgba(17,24,39,0.95) 0%, transparent 100%);opacity:1;transition:opacity 0.5s ease;pointer-events:none"></div><div aria-hidden="true" class="absolute top-3 ${isArabic ? "left" : "right"}-3 flex items-center gap-1 px-2.5 py-1.5 bg-black/60 border border-white/15 text-white/70 text-xs font-semibold rounded-lg backdrop-blur-sm"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>${locale.fullPage}</div><div aria-hidden="true" style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);opacity:0.85;transition:opacity 0.3s ease;white-space:nowrap;pointer-events:none" class="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-sm border border-white/10 rounded-full"><svg class="w-3 h-3 text-[#38BDF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7M12 3v18"></path></svg><span class="text-white/70 text-xs font-medium hidden md:inline">${locale.hover}</span><span class="text-white/70 text-xs font-medium md:hidden">${locale.tap}</span></div><div aria-hidden="true" class="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors duration-300"><div style="opacity:0;transform:scale(0.8);transition:opacity 0.2s ease, transform 0.2s ease" class="p-3 bg-black/60 backdrop-blur-sm rounded-full border border-white/10"><svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"></path></svg></div></div></button><div class="px-5 py-4 space-y-1.5 flex-1"><p class="text-white font-semibold text-base leading-snug">${label}</p></div></div>`;
    })
    .join("");
}

function buildTagList(tags) {
  return tags
    .map(
      (tag) =>
        `<span class="px-4 py-2 bg-[#1E293B] text-sm font-semibold rounded-md border border-white/5 text-[#94A3B8]">${tag}</span>`
    )
    .join("");
}

function buildFeatureList(features) {
  return features
    .map(
      (feature) =>
        `<li class="flex items-start gap-3"><svg class="w-6 h-6 text-[#38BDF8] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>${feature}</span></li>`
    )
    .join("");
}

function buildMain(project, locale, isArabic) {
  return `<main class="flex-1"><div class="container mx-auto px-4 py-20 space-y-20"><header class="max-w-4xl mx-auto space-y-8 text-center"><div class="text-sm font-bold text-[#38BDF8] uppercase tracking-widest">${locale.category}</div><h1 class="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">${locale.heroTitle}</h1><p class="text-xl md:text-2xl text-[#94A3B8] max-w-3xl mx-auto leading-relaxed whitespace-pre-wrap">${locale.heroDescription}</p><div class="flex flex-wrap items-center justify-center gap-4 pt-4"><a href="${locale.liveHref}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-8 py-4 bg-[#22C55E] text-white font-bold text-lg rounded-lg hover:bg-[#22C55E]/90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>${locale.liveLabel}</a></div></header><div class="relative aspect-video max-w-5xl mx-auto rounded-xl overflow-hidden border border-white/10 shadow-2xl"><img alt="${locale.heroTitle} screenshot" decoding="async" data-nimg="fill" class="object-cover object-top" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" src="/projects/${project.directory}/cover.png"/></div><div class="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-6xl mx-auto"><div class="md:col-span-2 space-y-16"><section><h2 class="text-3xl font-bold mb-6 tracking-tight">${isArabic ? "المشكلة" : "The Problem"}</h2><p class="text-[#94A3B8] text-lg leading-relaxed whitespace-pre-wrap">${locale.problem}</p></section><section><h2 class="text-3xl font-bold mb-6 tracking-tight">${isArabic ? "الحل" : "The Solution"}</h2><p class="text-[#94A3B8] text-lg leading-relaxed whitespace-pre-wrap">${locale.solution}</p></section><section><h2 class="text-3xl font-bold mb-6 tracking-tight">${isArabic ? "أهم المميزات" : "Key Features"}</h2><ul class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#94A3B8] text-lg">${buildFeatureList(locale.features)}</ul></section></div><aside class="space-y-10 bg-[#111827] p-8 rounded-2xl border border-white/5 h-fit shadow-lg sticky top-24"><div><h3 class="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4">${locale.roleTitle}</h3><ul class="space-y-2">${locale.roles.map((role) => `<li class="font-semibold text-lg text-[#F8FAFC]">${role}</li>`).join("")}</ul></div><div><h3 class="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4">${locale.stackTitle}</h3><div class="flex flex-wrap gap-2">${buildTagList(locale.stack)}</div></div><div class="pt-6 border-t border-white/5"><a href="https://wa.me/201025811613?text=${encodeURIComponent(locale.whatsappText)}" target="_blank" rel="noopener noreferrer" class="block w-full text-center py-4 bg-[#38BDF8] text-[#0B1020] font-bold text-lg rounded-lg hover:bg-[#38BDF8]/90 hover:scale-105 transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)]">${locale.ctaText}</a></div></aside></div><section class="max-w-6xl mx-auto space-y-8"><h2 class="text-3xl font-bold tracking-tight">${locale.screenshotTitle}</h2><div class="grid grid-cols-1 sm:grid-cols-2 gap-6">${buildScreenshotCards(project, locale, isArabic)}</div></section></div></main>`;
}

function buildPreloads(project) {
  return [
    `<link rel="preload" as="image" href="/projects/${project.directory}/cover.png"/>`,
    ...project.files.map(
      ([file]) => `<link rel="preload" as="image" href="/projects/${project.directory}/full-page/${file}"/>`
    )
  ].join("");
}

function renderPage(project, locale, isArabic) {
  let html = fs.readFileSync(isArabic ? templateAr : templateEn, "utf8");
  const fromLang = isArabic ? "/work/kuwait-arc/" : "/ar/work/kuwait-arc/";
  const toLang = isArabic ? `/work/${project.slug}/` : `/ar/work/${project.slug}/`;
  const workSlug = isArabic ? "/ar/work/kuwait-arc/" : "/work/kuwait-arc/";
  const replacementSlug = isArabic ? `/ar/work/${project.slug}/` : `/work/${project.slug}/`;

  html = html
    .replace(fromLang, toLang)
    .replaceAll(workSlug, replacementSlug)
    .replaceAll("kuwait-arc", project.slug);
  html = html.replace(/<title>.*?<\/title>/, `<title>${locale.title}</title>`);
  html = html.replace(
    /<meta name="description" content=".*?"\/>/,
    `<meta name="description" content="${locale.meta}"/>`
  );
  html = html.replace(
    /<link rel="preload" as="image" href="\/projects\/[^"]+\/cover\.png"\/>(?:<link rel="preload" as="image" href="\/projects\/[^"]+\/full-page\/[^"]+"\/>)+/,
    buildPreloads(project)
  );
  html = html.replace(/<main class="flex-1">[\s\S]*?<\/main>/, buildMain(project, locale, isArabic));
  return html;
}

function buildCard(project, locale, isArabic) {
  const href = isArabic ? `/ar/work/${project.slug}/` : `/work/${project.slug}/`;
  const archiveLabel = isArabic ? "تصفح الأرشيف" : "Browse Archive";
  return `<div class="group flex flex-col bg-[#111827] rounded-2xl overflow-hidden border border-white/5 hover:border-[#38BDF8]/30 transition-all hover:shadow-[0_10px_30px_rgba(56,189,248,0.05)] hover:-translate-y-1 relative" data-work-category="${project.categoryKey}"><a class="absolute inset-0 z-0" aria-label="View ${locale.cardTitle}" href="${href}"></a><div class="relative aspect-[4/3] w-full bg-[#0B1020] overflow-hidden pointer-events-none"><img alt="${locale.cardTitle}" loading="lazy" decoding="async" data-nimg="fill" class="object-cover object-top opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" src="/projects/${project.directory}/cover.png"/><div class="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80"></div></div><div class="p-8 flex-1 flex flex-col relative z-10 pointer-events-none"><div class="text-xs font-bold text-[#38BDF8] mb-3 uppercase tracking-widest">${locale.cardCategory}</div><h3 class="text-2xl font-bold mb-3 leading-snug group-hover:text-[#38BDF8] transition-colors">${locale.cardTitle}</h3><p class="text-[#94A3B8] text-sm leading-relaxed line-clamp-2">${locale.cardDescription}</p><div class="pointer-events-auto"><div class="mt-4 flex flex-wrap gap-2"><a href="${locale.liveHref}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 hover:bg-[#22C55E]/20 hover:border-[#22C55E]/40 transition-all"><span class="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>${locale.liveLabel}<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a><a class="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 hover:bg-[#38BDF8]/20 hover:border-[#38BDF8]/40 transition-all" href="${href}"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>${archiveLabel}</a></div></div><div class="mt-6 flex flex-wrap gap-2">${locale.cardTags.map((tag) => `<span class="text-xs font-semibold px-3 py-1.5 bg-[#1E293B] border border-white/5 rounded-md text-[#94A3B8]">${tag}</span>`).join("")}</div></div></div>`;
}

function insertCardAfter(relativePath, anchorHref, cardHtml, increments) {
  let html = read(relativePath);
  if (html.includes(cardHtml.includes("/ar/work/") ? `/ar/work/${increments.slug}/` : `/work/${increments.slug}/`)) return;
  const anchorIndex = html.indexOf(anchorHref);
  if (anchorIndex === -1) throw new Error(`Anchor not found in ${relativePath}: ${anchorHref}`);
  const blockStart = html.lastIndexOf('<div class="group flex flex-col', anchorIndex);
  const blockEnd = html.indexOf("</div></div></div>", anchorIndex);
  const insertionPoint = blockEnd + "</div></div></div>".length;
  html = `${html.slice(0, insertionPoint)}${cardHtml}${html.slice(insertionPoint)}`;

  const labels = increments.labels;
  for (const [key, amount] of Object.entries(increments.values)) {
    if (!amount) continue;
    const label = labels[key];
    const pattern = new RegExp(`value="${key}"(?: checked)?><span>${label}<small aria-hidden="true">(\\d+)</small>`);
    html = html.replace(pattern, (_, count) => {
      return html.match(pattern)[0].replace(String(count), String(Number(count) + amount));
    });
  }

  write(relativePath, html);
}

for (const project of projects) {
  write(`work/${project.slug}/index.html`, renderPage(project, project.en, false));
  write(`ar/work/${project.slug}/index.html`, renderPage(project, project.ar, true));
}

insertCardAfter(
  "work/index.html",
  '/work/crm-order-management-system/',
  buildCard(projects[0], projects[0].en, false),
  {
    slug: projects[0].slug,
    labels: { all: "All", ecommerce: "E-Commerce", corporate: "Corporate Sites", services: "Services & Booking", platforms: "Platforms" },
    values: { all: 1, ecommerce: 1, corporate: 0, services: 0, platforms: 0 }
  }
);

insertCardAfter(
  "work/index.html",
  '/work/torathyat/',
  buildCard(projects[1], projects[1].en, false),
  {
    slug: projects[1].slug,
    labels: { all: "All", ecommerce: "E-Commerce", corporate: "Corporate Sites", services: "Services & Booking", platforms: "Platforms" },
    values: { all: 1, ecommerce: 0, corporate: 1, services: 0, platforms: 0 }
  }
);

insertCardAfter(
  "ar/work/index.html",
  '/ar/work/crm-order-management-system/',
  buildCard(projects[0], projects[0].ar, true),
  {
    slug: projects[0].slug,
    labels: { all: "الكل", ecommerce: "متاجر إلكترونية", corporate: "مواقع شركات", services: "خدمات وحجوزات", platforms: "منصات" },
    values: { all: 1, ecommerce: 1, corporate: 0, services: 0, platforms: 0 }
  }
);

insertCardAfter(
  "ar/work/index.html",
  '/ar/work/torathyat/',
  buildCard(projects[1], projects[1].ar, true),
  {
    slug: projects[1].slug,
    labels: { all: "الكل", ecommerce: "متاجر إلكترونية", corporate: "مواقع شركات", services: "خدمات وحجوزات", platforms: "منصات" },
    values: { all: 1, ecommerce: 0, corporate: 1, services: 0, platforms: 0 }
  }
);

console.log("Torathyat and Armadillo Studio case studies created.");
