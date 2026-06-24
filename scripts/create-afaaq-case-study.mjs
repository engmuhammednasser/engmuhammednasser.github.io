import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function write(relativePath, content) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
  console.log(`Updated ${relativePath}`);
}

const screenshotFiles = [
  ["01-home.jpg", "Home Page", "الصفحة الرئيسية"],
  ["02-about-us.jpg", "About Us", "من نحن"],
  ["04-amorada-new-cairo.jpg", "Amorada New Cairo", "Amorada New Cairo"],
  ["05-amorada-hub.jpg", "Amorada Hub", "Amorada Hub"],
  ["06-press-media.jpg", "Press & Media", "الأخبار والإعلام"],
  ["07-contact-us.jpg", "Contact Us", "تواصل معنا"]
];

const content = {
  en: {
    template: "work/kuwait-arc/index.html",
    output: "work/afaaq-developments/index.html",
    langSwitchFrom: "/ar/work/kuwait-arc/",
    langSwitchTo: "/ar/work/afaaq-developments/",
    title: "Afaaq Developments Real Estate Platform",
    meta:
      "A corporate real estate platform for Afaaq Developments, presenting the developer brand, flagship compounds, leadership story, press coverage, and sales contact experience through a premium visual website.",
    category: "Corporate / Real Estate Website",
    heroTitle: "Afaaq Developments Real Estate Platform",
    heroDescription:
      "A premium real estate website for Afaaq Developments that presents the brand story, flagship compounds, leadership, press coverage, and sales contact experience through a polished corporate digital presence.",
    liveLabel: "View Live Site",
    liveHref: "https://afaaqdevelopments.com/",
    problem:
      "Afaaq Developments needed a polished digital presence that could communicate trust, present its residential and mixed-use projects with a premium feel, and give prospective buyers and investors a clear path to understand the brand, explore compounds, and get in touch with the sales team.",
    solution:
      "The website was structured as a refined corporate real estate platform that balances brand storytelling with project discovery. It showcases Afaaq's mission, leadership, compound pages, media coverage, and contact routes through a visually led experience designed to reinforce confidence and make project exploration easier.",
    features: [
      "Custom corporate real estate website",
      "Project showcase for Afaaq flagship developments",
      "Leadership and company story presentation",
      "Press & media coverage section",
      "Sales center and contact experience",
      "Performance optimization",
      "SEO-friendly information structure"
    ],
    roleTitle: "My Role",
    roles: ["Lead Developer"],
    stackTitle: "Tech Stack",
    stack: ["WordPress", "PHP", "HTML", "CSS", "JavaScript"],
    screenshotTitle: "Project Screenshots",
    fullPage: "Full page",
    hover: "Hover to scroll preview",
    tap: "Tap to view",
    ctaText:
      "Need a premium real estate website?",
    ctaButton: "Start a Similar Project",
    whatsappText:
      "Hello Muhammed, I saw the Afaaq Developments Real Estate Platform project and I need a similar project.",
    archiveHref: "/work/afaaq-developments/",
    cardTitle: "Afaaq Developments Real Estate Platform",
    cardDescription:
      "A premium real estate website for Afaaq Developments, showcasing the developer brand, flagship compounds, media coverage, and sales contact experience.",
    cardCategory: "Corporate / Real Estate Website",
    cardTags: ["WordPress", "Real Estate", "Corporate Website"],
    workHref: "/work/afaaq-developments/"
  },
  ar: {
    template: "ar/work/kuwait-arc/index.html",
    output: "ar/work/afaaq-developments/index.html",
    langSwitchFrom: "/work/kuwait-arc/",
    langSwitchTo: "/work/afaaq-developments/",
    title: "منصة Afaaq Developments للتطوير العقاري",
    meta:
      "موقع عقاري تعريفي فاخر لشركة Afaaq Developments يعرض هوية المطور ومشروعاته الرئيسية وفريقه القيادي والتغطيات الإعلامية وتجربة التواصل مع المبيعات.",
    category: "موقع شركة / تطوير عقاري",
    heroTitle: "منصة Afaaq Developments للتطوير العقاري",
    heroDescription:
      "موقع عقاري فاخر لشركة Afaaq Developments يعرض قصة العلامة ومشروعاتها الرئيسية والقيادة والتغطيات الإعلامية وتجربة التواصل مع المبيعات من خلال حضور رقمي أنيق وواضح.",
    liveLabel: "زيارة الموقع",
    liveHref: "https://afaaqdevelopments.com/",
    problem:
      "كانت Afaaq Developments تحتاج إلى حضور رقمي أكثر أناقة وثقة يعرض هوية المطور ومشروعاته السكنية والتجارية بشكل يليق بالسوق العقاري، ويساعد العملاء والمستثمرين على فهم العلامة واستكشاف المشروعات والوصول السريع إلى فريق المبيعات.",
    solution:
      "تم تقديم الموقع كمنصة عقارية تعريفية تجمع بين عرض العلامة وسرد القصة وبين استكشاف المشروعات. يعرض الموقع رسالة الشركة وقيادتها وصفحات المشروعات والتغطيات الإعلامية وبيانات التواصل من خلال تجربة بصرية راقية تساعد على بناء الثقة وتسهيل رحلة الاستكشاف.",
    features: [
      "موقع شركة عقارية مخصص",
      "عرض مشروعات Afaaq الرئيسية",
      "إبراز القيادة وقصة الشركة",
      "قسم للأخبار والتغطيات الإعلامية",
      "تجربة تواصل ومركز مبيعات واضح",
      "تحسين الأداء",
      "هيكلة معلومات مناسبة لمحركات البحث"
    ],
    roleTitle: "دوري في المشروع",
    roles: ["Lead Developer"],
    stackTitle: "التقنيات المستخدمة",
    stack: ["WordPress", "PHP", "HTML", "CSS", "JavaScript"],
    screenshotTitle: "صور المشروع",
    fullPage: "صفحة كاملة",
    hover: "مرّر لعرض الصورة كاملة",
    tap: "اضغط للعرض",
    ctaText:
      "تحتاج موقع تطوير عقاري فاخر؟",
    ctaButton: "ابدأ مشروعًا مشابهًا",
    whatsappText:
      "أهلاً محمد، شاهدت مشروع منصة Afaaq Developments للتطوير العقاري وأحتاج لمشروع مشابه.",
    archiveHref: "/ar/work/afaaq-developments/",
    cardTitle: "منصة Afaaq Developments للتطوير العقاري",
    cardDescription:
      "موقع عقاري فاخر لشركة Afaaq Developments يعرض هوية المطور ومشروعاته الرئيسية والتغطيات الإعلامية وتجربة التواصل مع المبيعات.",
    cardCategory: "موقع شركة / تطوير عقاري",
    cardTags: ["WordPress", "Real Estate", "Corporate Website"],
    workHref: "/ar/work/afaaq-developments/"
  }
};

function buildFeatures(list, isArabic) {
  return list
    .map(
      (item) =>
        `<li class="flex items-start gap-3"><svg class="w-6 h-6 text-[#38BDF8] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>${item}</span></li>`
    )
    .join("");
}

function buildTags(tags) {
  return tags
    .map(
      (tag) =>
        `<span class="px-4 py-2 bg-[#1E293B] text-sm font-semibold rounded-md border border-white/5 text-[#94A3B8]">${tag}</span>`
    )
    .join("");
}

function buildScreenshotCards(locale) {
  const fullPageLabel = locale.fullPage;
  const hoverLabel = locale.hover;
  const tapLabel = locale.tap;

  return screenshotFiles
    .map(([file, titleEn, titleAr]) => {
      const label = locale === content.ar ? titleAr : titleEn;
      const ariaLabel =
        locale === content.ar ? `عرض ${label} كاملاً` : `View ${titleEn} full screenshot`;
      return `<div class="flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#111827] shadow-lg hover:border-white/20 hover:shadow-[0_8px_30px_rgba(56,189,248,0.07)] transition-all duration-300"><button type="button" aria-label="${ariaLabel}" class="relative block w-full text-left rtl:text-right outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] focus-visible:ring-inset cursor-zoom-in" style="height:420px;overflow:hidden;flex-shrink:0"><img src="/projects/afaaq-developments/full-page/${file}" alt="${locale.heroTitle} screenshot" style="width:100%;height:auto;display:block;transform:translateY(0);transition:transform 1.5s ease-in-out;will-change:transform"/><div aria-hidden="true" style="position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(to top, rgba(17,24,39,0.95) 0%, transparent 100%);opacity:1;transition:opacity 0.5s ease;pointer-events:none"></div><div aria-hidden="true" class="absolute top-3 ${locale === content.ar ? "left" : "right"}-3 flex items-center gap-1 px-2.5 py-1.5 bg-black/60 border border-white/15 text-white/70 text-xs font-semibold rounded-lg backdrop-blur-sm"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>${fullPageLabel}</div><div aria-hidden="true" style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);opacity:0.85;transition:opacity 0.3s ease;white-space:nowrap;pointer-events:none" class="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-sm border border-white/10 rounded-full"><svg class="w-3 h-3 text-[#38BDF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7M12 3v18"></path></svg><span class="text-white/70 text-xs font-medium hidden md:inline">${hoverLabel}</span><span class="text-white/70 text-xs font-medium md:hidden">${tapLabel}</span></div><div aria-hidden="true" class="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors duration-300"><div style="opacity:0;transform:scale(0.8);transition:opacity 0.2s ease, transform 0.2s ease" class="p-3 bg-black/60 backdrop-blur-sm rounded-full border border-white/10"><svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"></path></svg></div></div></button><div class="px-5 py-4 space-y-1.5 flex-1"><p class="text-white font-semibold text-base leading-snug">${label}</p></div></div>`;
    })
    .join("");
}

function buildMain(locale) {
  return `<main class="flex-1"><div class="container mx-auto px-4 py-20 space-y-20"><header class="max-w-4xl mx-auto space-y-8 text-center"><div class="text-sm font-bold text-[#38BDF8] uppercase tracking-widest">${locale.category}</div><h1 class="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">${locale.heroTitle}</h1><p class="text-xl md:text-2xl text-[#94A3B8] max-w-3xl mx-auto leading-relaxed whitespace-pre-wrap">${locale.heroDescription}</p><div class="flex flex-wrap items-center justify-center gap-4 pt-4"><a href="${locale.liveHref}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-8 py-4 bg-[#22C55E] text-white font-bold text-lg rounded-lg hover:bg-[#22C55E]/90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>${locale.liveLabel}</a></div></header><div class="relative aspect-video max-w-5xl mx-auto rounded-xl overflow-hidden border border-white/10 shadow-2xl"><img alt="${locale.heroTitle} screenshot" decoding="async" data-nimg="fill" class="object-cover object-top" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" src="/projects/afaaq-developments/cover.png"/></div><div class="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-6xl mx-auto"><div class="md:col-span-2 space-y-16"><section><h2 class="text-3xl font-bold mb-6 tracking-tight">${locale === content.ar ? "المشكلة" : "The Problem"}</h2><p class="text-[#94A3B8] text-lg leading-relaxed whitespace-pre-wrap">${locale.problem}</p></section><section><h2 class="text-3xl font-bold mb-6 tracking-tight">${locale === content.ar ? "الحل" : "The Solution"}</h2><p class="text-[#94A3B8] text-lg leading-relaxed whitespace-pre-wrap">${locale.solution}</p></section><section><h2 class="text-3xl font-bold mb-6 tracking-tight">${locale === content.ar ? "أهم المميزات" : "Key Features"}</h2><ul class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#94A3B8] text-lg">${buildFeatures(locale.features, locale === content.ar)}</ul></section></div><aside class="space-y-10 bg-[#111827] p-8 rounded-2xl border border-white/5 h-fit shadow-lg sticky top-24"><div><h3 class="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4">${locale.roleTitle}</h3><ul class="space-y-2">${locale.roles.map((role) => `<li class="font-semibold text-lg text-[#F8FAFC]">${role}</li>`).join("")}</ul></div><div><h3 class="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4">${locale.stackTitle}</h3><div class="flex flex-wrap gap-2">${buildTags(locale.stack)}</div></div><div class="pt-6 border-t border-white/5"><a href="https://wa.me/201025811613?text=${encodeURIComponent(locale.whatsappText)}" target="_blank" rel="noopener noreferrer" class="block w-full text-center py-4 bg-[#38BDF8] text-[#0B1020] font-bold text-lg rounded-lg hover:bg-[#38BDF8]/90 hover:scale-105 transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)]">${locale.ctaText}</a></div></aside></div><section class="max-w-6xl mx-auto space-y-8"><h2 class="text-3xl font-bold tracking-tight">${locale.screenshotTitle}</h2><div class="grid grid-cols-1 sm:grid-cols-2 gap-6">${buildScreenshotCards(locale)}</div></section></div></main>`;
}

function buildPreloads() {
  return [
    '<link rel="preload" as="image" href="/projects/afaaq-developments/cover.png"/>',
    ...screenshotFiles.map(
      ([file]) => `<link rel="preload" as="image" href="/projects/afaaq-developments/full-page/${file}"/>`
    )
  ].join("");
}

function buildPage(locale) {
  let html = read(locale.template);
  html = html.replace(locale.langSwitchFrom, locale.langSwitchTo).replaceAll("kuwait-arc", "afaaq-developments");
  html = html.replace(/<title>.*?<\/title>/, `<title>${locale.title}</title>`);
  html = html.replace(
    /<meta name="description" content=".*?"\/>/,
    `<meta name="description" content="${locale.meta}"/>`
  );
  html = html.replace(
    /<link rel="preload" as="image" href="\/projects\/kuwait-arc\/cover\.png"\/>(?:<link rel="preload" as="image" href="\/projects\/kuwait-arc\/full-page\/[^"]+"\/>)+/,
    buildPreloads()
  );
  html = html.replace(/<main class="flex-1">[\s\S]*?<\/main>/, buildMain(locale));
  return html;
}

function buildWorkCard(locale) {
  return `<div class="group flex flex-col bg-[#111827] rounded-2xl overflow-hidden border border-white/5 hover:border-[#38BDF8]/30 transition-all hover:shadow-[0_10px_30px_rgba(56,189,248,0.05)] hover:-translate-y-1 relative" data-work-category="corporate"><a class="absolute inset-0 z-0" aria-label="View ${locale.cardTitle}" href="${locale.workHref}"></a><div class="relative aspect-[4/3] w-full bg-[#0B1020] overflow-hidden pointer-events-none"><img alt="${locale.cardTitle}" loading="lazy" decoding="async" data-nimg="fill" class="object-cover object-top opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" src="/projects/afaaq-developments/cover.png"/><div class="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80"></div></div><div class="p-8 flex-1 flex flex-col relative z-10 pointer-events-none"><div class="text-xs font-bold text-[#38BDF8] mb-3 uppercase tracking-widest">${locale.cardCategory}</div><h3 class="text-2xl font-bold mb-3 leading-snug group-hover:text-[#38BDF8] transition-colors">${locale.cardTitle}</h3><p class="text-[#94A3B8] text-sm leading-relaxed line-clamp-2">${locale.cardDescription}</p><div class="pointer-events-auto"><div class="mt-4 flex flex-wrap gap-2"><a href="${locale.liveHref}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 hover:bg-[#22C55E]/20 hover:border-[#22C55E]/40 transition-all"><span class="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>${locale.liveLabel}<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a><a class="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 hover:bg-[#38BDF8]/20 hover:border-[#38BDF8]/40 transition-all" href="${locale.archiveHref}"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>${locale === content.ar ? "تصفح الأرشيف" : "Browse Archive"}</a></div></div><div class="mt-6 flex flex-wrap gap-2">${locale.cardTags.map((tag) => `<span class="text-xs font-semibold px-3 py-1.5 bg-[#1E293B] border border-white/5 rounded-md text-[#94A3B8]">${tag}</span>`).join("")}</div></div></div>`;
}

function insertCardAfter(relativePath, anchorHref, cardHtml, allLabel, corporateLabel) {
  let html = read(relativePath);
  if (html.includes('/work/afaaq-developments/') || html.includes('/ar/work/afaaq-developments/')) {
    write(relativePath, html);
    return;
  }

  const anchorIndex = html.indexOf(anchorHref);
  if (anchorIndex === -1) {
    throw new Error(`Could not find anchor card in ${relativePath}`);
  }

  const start = html.lastIndexOf('<div class="group flex flex-col', anchorIndex);
  const end = html.indexOf('</div></div></div>', anchorIndex);
  const insertionPoint = end + '</div></div></div>'.length;
  html = `${html.slice(0, insertionPoint)}${cardHtml}${html.slice(insertionPoint)}`;

  html = html.replace(
    new RegExp(`value="all" checked><span>${allLabel}<small aria-hidden="true">(\\d+)</small>`),
    (_, count) => `value="all" checked><span>${allLabel}<small aria-hidden="true">${Number(count) + 1}</small>`
  );
  html = html.replace(
    new RegExp(`value="corporate"><span>${corporateLabel}<small aria-hidden="true">(\\d+)</small>`),
    (_, count) => `value="corporate"><span>${corporateLabel}<small aria-hidden="true">${Number(count) + 1}</small>`
  );

  write(relativePath, html);
}

write(content.en.output, buildPage(content.en));
write(content.ar.output, buildPage(content.ar));

insertCardAfter(
  "work/index.html",
  '/work/ashhalan/',
  buildWorkCard(content.en),
  "All",
  "Corporate Websites"
);

insertCardAfter(
  "ar/work/index.html",
  '/ar/work/ashhalan/',
  buildWorkCard(content.ar),
  "الكل",
  "مواقع شركات"
);

console.log("Afaaq case study created.");
