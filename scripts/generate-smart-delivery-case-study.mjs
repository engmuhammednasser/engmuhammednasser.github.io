import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = resolve(process.cwd());
const slug = "shipping-delivery-operations-platform";
const sourceDir = process.env.SMART_DELIVERY_MEDIA_SOURCE
  ? resolve(process.env.SMART_DELIVERY_MEDIA_SOURCE)
  : resolve(root, "..", "سكرين شوت سماارت ديلفري", "Smart_Delivery_Portfolio_Optimized_26", "optimized-webp");
const mediaDir = resolve(root, "projects", slug);
const liveUrl = "https://smartdeliverysa.com/";
const caseStudy = { en: `/work/${slug}/`, ar: `/ar/work/${slug}/` };

const media = [
  ["01-admin-dashboard.webp", 1920, 2185, "Admin operations dashboard overview", "نظرة عامة على لوحة عمليات الإدارة"],
  ["02-public-landing-page.webp", 1920, 3440, "Smart Delivery public landing experience", "واجهة Smart Delivery العامة"],
  ["03-admin-shipments-list.webp", 1920, 1945, "Admin shipments list with operational filters", "قائمة الشحنات في لوحة الإدارة مع فلاتر التشغيل"],
  ["04-admin-shipment-detail-history.webp", 1920, 1220, "Shipment detail page with status history", "صفحة تفاصيل الشحنة مع سجل الحالات"],
  ["05-admin-pickup-courier-assignment.webp", 1920, 1776, "Pickup courier assignment workflow", "مسار إسناد مندوب الاستلام"],
  ["06-admin-pickup-couriers.webp", 1920, 897, "Pickup couriers administration view", "واجهة إدارة مندوبي الاستلام"],
  ["07-admin-warehouse-manager.webp", 1920, 1842, "Warehouse manager operations screen", "واجهة مدير المخزن للعمليات"],
  ["08-merchant-dashboard.webp", 1920, 1762, "Merchant portal dashboard", "لوحة تحكم التاجر"],
  ["09-merchant-create-shipment.webp", 1920, 2177, "Merchant create shipment flow", "مسار إنشاء شحنة من بوابة التاجر"],
  ["10-admin-create-shipment.webp", 1920, 1916, "Admin create shipment form", "نموذج إنشاء شحنة من لوحة الإدارة"],
  ["11-admin-customers-merchants.webp", 1920, 1111, "Customers and merchants administration", "إدارة العملاء والتجار"],
  ["12-admin-users-management.webp", 1920, 1599, "Users and permissions management", "إدارة المستخدمين والصلاحيات"],
  ["13-admin-cities-locations.webp", 1920, 2526, "Cities and locations master data", "بيانات المدن والمواقع"],
  ["14-admin-user-notifications.webp", 1920, 2713, "User notifications administration", "إدارة إشعارات المستخدمين"],
  ["15-public-tracking-entry.webp", 1920, 1388, "Public tracking number entry", "إدخال رقم التتبع العام"],
  ["16-public-tracking-result.webp", 1920, 1721, "Public tracking result timeline", "نتيجة التتبع العام وخط الحالة"],
  ["17-admin-rbac-403-access-denied.webp", 1920, 868, "Role-based access denied state", "حالة منع الوصول حسب الصلاحيات"],
  ["18-merchant-api-integrations.webp", 1920, 3778, "Merchant API integrations screen", "واجهة تكاملات API للتاجر"],
  ["19-admin-login.webp", 1920, 868, "Admin login screen", "شاشة دخول الإدارة"],
  ["20-merchant-login.webp", 1920, 1450, "Merchant login screen", "شاشة دخول التاجر"],
  ["21-merchant-registration.webp", 1920, 1760, "Merchant registration screen", "شاشة تسجيل التاجر"],
  ["22-courier-app-login.webp", 720, 1280, "Courier mobile login UX screen", "شاشة تصميم دخول المندوب للموبايل"],
  ["23-courier-app-registration.webp", 720, 1280, "Courier mobile registration UX screen", "شاشة تصميم تسجيل المندوب للموبايل"],
  ["24-courier-app-home.webp", 720, 1280, "Courier mobile home UX screen", "شاشة تصميم الصفحة الرئيسية للمندوب"],
  ["25-courier-app-pickups.webp", 720, 1280, "Courier mobile pickups UX screen", "شاشة تصميم استلامات المندوب"],
  ["26-courier-app-order-verification.webp", 720, 1280, "Courier order verification UX screen", "شاشة تصميم تحقق طلب المندوب"],
].map(([file, width, height, altEn, altAr]) => ({ file, width, height, alt: { en: altEn, ar: altAr }, path: `/projects/${slug}/${file}` }));

const copy = {
  en: {
    lang: "en",
    dir: "ltr",
    bodyClass: "inter_5901b7c6-module__ec5Qua__variable font-inter bg-[#05070D] text-[#F8FAFC] antialiased min-h-screen flex flex-col",
    logo: "/logos/logo-desktop-en.png",
    logoAlt: "Muhammed Nasser Logo",
    home: "/",
    switchHref: caseStudy.ar,
    switchLabel: "AR",
    skip: "Skip to main content",
    nav: ["Services", "Work", "About", "Developer Lab", "Backend Systems", "Start a Project"],
    navHref: ["/services/", "/work/", "/about/", "/lab/", "/backend/", "/contact/"],
    menu: "Menu",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    whatsapp: "WhatsApp",
    whatsappText: "Hello Muhammed, I saw the Smart Delivery operations platform case study and I need a similar project.",
    title: "Shipping & Delivery Operations Platform",
    brand: "Smart Delivery",
    eyebrow: "Product UI/UX • Laravel Operations Platform",
    role: "Product UI/UX Design • Laravel Backend • Business Logic • Full-Stack Integration",
    description: "A single-company logistics operations platform for managing shipment lifecycle, role-based workflows, public tracking, warehouse operations, merchant workflows, and financial shipping operations.",
    live: "Live Landing Page",
    details: "Technical Details & Screenshots",
    sections: {
      overview: "Project Overview",
      challenge: "Business & Operational Challenge",
      design: "Product Experience Design",
      architecture: "System Architecture",
      lifecycle: "Shipment Lifecycle",
      shipment: "Shipment Management",
      pickup: "Pickup & Warehouse Operations",
      merchant: "Merchant Portal",
      tracking: "Public Tracking Without Exposing Internal Operations",
      access: "Role-Based Access & Data Visibility",
      admin: "Operational Administration",
      finance: "Financial Operations Foundation",
      auth: "Access / Authentication Surfaces",
      mobile: "Courier Mobile UX Concept & Screen Design",
      engineering: "Engineering Decisions & QA",
      boundaries: "Scope & Boundaries",
    },
    paragraphs: {
      overview: "Smart Delivery needed one operational surface for shipment creation, pickup assignment, warehouse movement, delivery progress, merchant self-service, public tracking, and finance-adjacent shipping operations. The result is a modular Laravel operations platform for one company, with clear separation between the Admin Inertia UI, the Merchant Vue SPA, and the public tracking experience.",
      challenge: "Shipping operations have many moving parts: staff roles, merchants, couriers, warehouses, public shipment visibility, Arabic/English surfaces, and money-related COD or wallet events. The work focused on making those flows understandable and controlled without presenting the product as SaaS, microservices, or a public operations demo.",
      design: "The product design connected four surfaces: the public Smart Delivery landing page, the internal Admin operations dashboard, the standalone Merchant Portal, and courier mobile UX concept screens. Each surface has a different job, so the case study keeps their responsibilities distinct.",
      architecture: "Admin users work through a Laravel + Inertia + Vue interface. Merchants use a separate Vue 3 + TypeScript SPA that consumes the backend REST API. Public tracking uses a limited unauthenticated projection, while Laravel modules coordinate authorization, shipment lifecycle rules, warehouse workflows, finance foundations, and persistence.",
      lifecycle: "The shipment flow is modeled as controlled state transitions: Created, Pickup, Warehouse, Transit, Delivery, then Delivered, Failed, or Returned. Status changes are handled transactionally with history context and row-level locking where the workflow requires consistency.",
      tracking: "Public tracking exposes a minimal customer-facing shipment status timeline while hiding internal notes, courier data, warehouse data, financial values, and ownership identifiers.",
      finance: "The platform contains controlled wallet, COD, settlement, top-up, transaction, finance-summary, reporting, and export foundations around shipping operations. This is a financial operations foundation, not a complete accounting platform.",
      mobile: "These screens represent Mobile Experience Design / Figma courier UX screens. They demonstrate the courier workflow concept and UI direction; they are not presented as evidence that the mobile app implementation itself is part of the audited codebase.",
      boundaries: "This is a single-company operations platform, not SaaS or multi-tenant marketing. It is a modular Laravel monolith with separate web surfaces, not microservices. The approved external URL is the public Smart Delivery landing page only; there is no public Admin, Merchant, or operations-system demo.",
    },
    bullets: [
      "Admin Operations Dashboard built with Laravel, Inertia, and Vue.",
      "Merchant Portal delivered as a separate Vue 3 + TypeScript SPA over REST APIs.",
      "Role-based access and scoped visibility for operations, finance, warehouse, merchants, customers, couriers, and API clients.",
      "Privacy-safe public shipment tracking with rate limiting and limited public fields.",
      "Wallet, COD, settlement, top-up, ledger, reporting, and export foundations around shipping operations.",
    ],
    roles: ["Super Admin", "Operations Manager", "Finance", "Warehouse Staff", "Customer Support", "Merchant", "Individual Customer", "Pickup Courier", "Delivery Courier", "API Client"],
    tech: ["PHP 8.2+", "Laravel 12", "Inertia", "Vue 3", "TypeScript", "Sanctum", "Spatie Permission", "Tailwind", "MySQL/MariaDB"],
    lifecycle: ["Created", "Pickup", "Warehouse", "Transit", "Delivery", "Delivered / Failed / Returned"],
    finance: ["Wallets", "COD", "Settlements", "Ledger Transactions", "Top-Up Requests", "SAR monetary contract"],
  },
  ar: {
    lang: "ar",
    dir: "rtl",
    bodyClass: "cairo_eb32b749-module__msiTQW__variable font-cairo bg-[#05070D] text-[#F8FAFC] antialiased min-h-screen flex flex-col",
    logo: "/logos/logo-desktop-ar.png",
    logoAlt: "شعار محمد ناصر",
    home: "/ar/",
    switchHref: caseStudy.en,
    switchLabel: "EN",
    skip: "تخطي إلى المحتوى الرئيسي",
    nav: ["الخدمات", "الأعمال", "عنّي", "المعمل البرمجي", "أنظمة Backend", "ابدأ مشروعك"],
    navHref: ["/ar/services/", "/ar/work/", "/ar/about/", "/ar/lab/", "/ar/backend/", "/ar/contact/"],
    menu: "القائمة",
    openMenu: "افتح القائمة",
    closeMenu: "أغلق القائمة",
    whatsapp: "واتساب",
    whatsappText: "أهلاً محمد، شاهدت دراسة حالة منصة سمارت ديلفري وأحتاج مشروعاً مشابهاً.",
    title: "منصة إدارة عمليات الشحن والتوصيل",
    brand: "Smart Delivery",
    eyebrow: "تصميم تجربة المنتج • منصة تشغيل Laravel",
    role: "تصميم تجربة المنتج والواجهات • Laravel Backend • منطق الأعمال • التكامل بين الواجهات والـ API",
    description: "منصة تشغيل لشركة واحدة لإدارة دورة الشحنات والصلاحيات والتتبع العام وعمليات المخازن وتجربة التاجر والعمليات المالية المرتبطة بالشحن.",
    live: "مشاهدة اللاندنج بيدج لايف",
    details: "التفاصيل التقنية والصور",
    sections: {
      overview: "نظرة عامة على المشروع",
      challenge: "التحدي التشغيلي والتجاري",
      design: "تصميم تجربة المنتج",
      architecture: "معمارية النظام",
      lifecycle: "دورة حياة الشحنة",
      shipment: "إدارة الشحنات",
      pickup: "عمليات الاستلام والمخزن",
      merchant: "بوابة التاجر",
      tracking: "تتبع عام بدون كشف العمليات الداخلية",
      access: "الصلاحيات ونطاقات رؤية البيانات",
      admin: "الإدارة التشغيلية",
      finance: "Financial Operations Foundation",
      auth: "واجهات الدخول والتسجيل",
      mobile: "تصميم تجربة مندوب التوصيل على الموبايل",
      engineering: "قرارات هندسية و QA",
      boundaries: "النطاق والحدود",
    },
    paragraphs: {
      overview: "احتاجت Smart Delivery إلى سطح تشغيلي واحد ينظم إنشاء الشحنات، إسناد الاستلام، حركة المخزن، مراحل التوصيل، خدمة التاجر الذاتية، التتبع العام، والعمليات المالية المرتبطة بالشحن. النتيجة منصة تشغيل Laravel لشركة واحدة مع فصل واضح بين لوحة الإدارة المبنية بـ Inertia، وبوابة التاجر المستقلة بـ Vue، وتجربة التتبع العامة.",
      challenge: "عمليات الشحن تجمع أدواراً وصلاحيات مختلفة، تجاراً، مندوبين، مخازن، تتبعاً عاماً، واجهات عربية وإنجليزية، وأحداثاً مالية مرتبطة بالـ COD والمحافظ. ركز العمل على جعل هذه المسارات واضحة ومضبوطة بدون تسويق المنتج كـ SaaS أو Microservices أو ديمو عام لنظام التشغيل.",
      design: "ربط تصميم المنتج بين أربع واجهات: اللاندنج بيدج العامة، لوحة عمليات الإدارة، بوابة التاجر المستقلة، وشاشات مفهوم تجربة المندوب على الموبايل. لكل واجهة وظيفة مختلفة، لذلك تعرض دراسة الحالة المسؤوليات بشكل منفصل وواضح.",
      architecture: "تعمل لوحة الإدارة من خلال Laravel + Inertia + Vue. يستخدم التجار SPA مستقلة مبنية بـ Vue 3 و TypeScript وتتصل بـ REST API. أما التتبع العام فيستخدم إسقاطاً محدوداً لا يحتاج تسجيل دخول، بينما تنظم وحدات Laravel الصلاحيات، دورة الشحنة، المخزن، الأساس المالي، وقاعدة البيانات.",
      lifecycle: "تم التعامل مع رحلة الشحنة كمسار حالات مضبوط: إنشاء، استلام، مخزن، نقل، توصيل، ثم تم التسليم أو فشل التسليم أو الإرجاع. تغييرات الحالة تتم داخل معاملات قاعدة بيانات مع سجل سياق واستخدام قفل الصف عند الحاجة للحفاظ على الاتساق.",
      tracking: "يعرض التتبع العام خط حالة مبسطاً مناسباً للعميل، مع إخفاء الملاحظات الداخلية وبيانات المندوب والمخزن والقيم المالية ومعرفات الملكية.",
      finance: "تحتوي المنصة على أساس منضبط للمحافظ، COD، التسويات، طلبات الشحن، سجل المعاملات، ملخصات مالية، تقارير، وتصدير حول عمليات الشحن. هذا أساس عمليات مالية وليس نظام محاسبة كامل.",
      mobile: "هذه الشاشات تمثل تصميم تجربة المندوب على الموبايل من Figma. هي توضح اتجاه الواجهة ومفهوم workflow المندوب، ولا يتم تقديمها كدليل على أن تنفيذ تطبيق الموبايل نفسه جزء من الكود الذي تمت مراجعته.",
      boundaries: "هذا نظام تشغيل لشركة واحدة، وليس SaaS أو منصة متعددة المستأجرين. المعمارية Modular Laravel Monolith بواجهات ويب منفصلة، وليست Microservices. الرابط الخارجي المعتمد هو اللاندنج بيدج العامة فقط؛ لا يوجد ديمو عام للوحة الإدارة أو بوابة التاجر أو نظام العمليات.",
    },
    bullets: [
      "لوحة عمليات الإدارة مبنية بـ Laravel و Inertia و Vue.",
      "بوابة التاجر SPA مستقلة مبنية بـ Vue 3 و TypeScript وتستهلك REST APIs.",
      "صلاحيات ونطاقات رؤية للعمليات، المالية، المخزن، التجار، العملاء، المندوبين، ومسار API.",
      "تتبع عام محدود وآمن للخصوصية مع rate limiting وحقول عامة فقط.",
      "أساس للمحافظ و COD والتسويات وطلبات الشحن وسجل المعاملات والتقارير والتصدير حول عمليات الشحن.",
    ],
    roles: ["Super Admin", "Operations Manager", "Finance", "Warehouse Staff", "Customer Support", "Merchant", "Individual Customer", "Pickup Courier", "Delivery Courier", "API Client"],
    tech: ["PHP 8.2+", "Laravel 12", "Inertia", "Vue 3", "TypeScript", "Sanctum", "Spatie Permission", "Tailwind", "MySQL/MariaDB"],
    lifecycle: ["تم الإنشاء", "الاستلام", "المخزن", "النقل", "التوصيل", "تم التسليم / فشل / إرجاع"],
    finance: ["Wallets", "COD", "Settlements", "Ledger Transactions", "Top-Up Requests", "SAR monetary contract"],
  },
};

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[character]));
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function importMedia() {
  ensureDir(mediaDir);
  for (const item of media) {
    const source = join(sourceDir, item.file);
    if (!existsSync(source)) throw new Error(`Missing approved media source: ${source}`);
    copyFileSync(source, join(mediaDir, item.file));
  }
}

function updateProjects() {
  const dataPath = resolve(root, "data/projects.json");
  const data = JSON.parse(readFileSync(dataPath, "utf8"));
  const optimized = `/projects/${slug}/optimized`;
  const record = {
    id: slug,
    slug,
    category: "platforms",
    featured: true,
    title: {
      en: copy.en.title,
      ar: copy.ar.title,
    },
    description: {
      en: copy.en.description,
      ar: copy.ar.description,
    },
    eyebrow: {
      en: copy.en.eyebrow,
      ar: copy.ar.eyebrow,
    },
    technologies: ["Laravel", "Vue 3", "TypeScript", "REST API", "RBAC"],
    thumbnail: {
      original: media[0].path,
      avif480: existsSync(resolve(root, `${optimized}/thumb-480.avif`.replace(/^\//, ""))) ? `${optimized}/thumb-480.avif` : null,
      avif800: existsSync(resolve(root, `${optimized}/thumb-800.avif`.replace(/^\//, ""))) ? `${optimized}/thumb-800.avif` : null,
      webp480: existsSync(resolve(root, `${optimized}/thumb-480.webp`.replace(/^\//, ""))) ? `${optimized}/thumb-480.webp` : null,
      webp800: existsSync(resolve(root, `${optimized}/thumb-800.webp`.replace(/^\//, ""))) ? `${optimized}/thumb-800.webp` : null,
      width: media[0].width,
      height: media[0].height,
      aspectRatio: media[0].width / media[0].height,
    },
    caseStudy,
    liveUrl,
    availability: "case-study+live",
    status: "published",
  };
  data.projects = [record, ...data.projects.filter((project) => project.slug !== slug)];
  writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`);
}

function nav(locale) {
  const c = copy[locale];
  const links = c.nav.map((label, index) => `<a class="hover:text-[#38BDF8] transition-colors whitespace-nowrap text-sm font-medium${index === 5 ? " px-4 py-2 bg-[#38BDF8]/10 hover:bg-[#38BDF8] text-[#38BDF8] hover:text-[#020617] border border-[#38BDF8]/20 hover:border-transparent rounded-lg font-bold" : ""}" href="${c.navHref[index]}">${escapeHtml(label)}</a>`).join("");
  const mobileLinks = c.nav.map((label, index) => `<a class="flex items-center gap-4 px-6 py-4 transition-colors duration-300 border-l-4 border-transparent text-[#F8FAFC] hover:border-[#38BDF8]/50 hover:bg-white/5 hover:text-[#38BDF8]" href="${c.navHref[index]}"><span class="text-lg font-semibold">${escapeHtml(label)}</span></a>`).join("");
  const whatsApp = `https://wa.me/201025811613?text=${encodeURIComponent(c.whatsappText)}`;
  return `<header class="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B1020]/80 backdrop-blur"><div class="container mx-auto px-4 h-14 flex items-center justify-between gap-4"><a class="flex items-center flex-shrink-0 min-w-0" style="max-width:clamp(160px, 50vw, 300px)" href="${c.home}"><img src="${c.logo}" alt="${escapeHtml(c.logoAlt)}" width="300" height="48" class="h-10 md:h-12 w-auto object-contain" style="max-width:100%"></a><nav aria-label="${locale === "ar" ? "التنقل الرئيسي" : "Primary navigation"}" class="hidden md:flex items-center gap-6 flex-shrink-0">${links}<a class="px-3 py-1 rounded border border-white/20 hover:bg-white/10 transition-colors text-sm font-medium" href="${c.switchHref}">${c.switchLabel}</a></nav><div class="md:hidden"><button aria-controls="mobile-navigation" aria-label="${escapeHtml(c.openMenu)}" aria-expanded="false" class="relative z-[60] flex flex-col justify-center items-center w-10 h-10 rounded-lg border border-white/20 hover:border-[#38BDF8]/60 hover:bg-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50"><span class="block w-5 h-0.5 bg-white transition-all duration-300"></span><span class="block w-5 h-0.5 bg-white mt-1 transition-all duration-300"></span><span class="block w-5 h-0.5 bg-white mt-1 transition-all duration-300"></span></button><div id="mobile-navigation" class="fixed top-0 ${locale === "ar" ? "right-0 translate-x-full" : "left-0 -translate-x-full"} z-50 h-[100dvh] w-[85vw] max-w-sm bg-[#0B1020] rtl:border-l ltr:border-r border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out" role="dialog" aria-modal="true" aria-label="${locale === "ar" ? "القائمة الرئيسية" : "Main navigation"}"><div class="flex items-center justify-between p-5 border-b border-white/10 shrink-0"><span class="text-sm font-bold text-[#38BDF8] uppercase tracking-widest">${escapeHtml(c.menu)}</span><button aria-label="${escapeHtml(c.closeMenu)}" class="w-9 h-9 flex items-center justify-center rounded-lg border border-white/20 hover:border-[#38BDF8]/60 hover:bg-white/5 transition-all text-white"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><nav class="flex-1 overflow-y-auto py-4" aria-label="${locale === "ar" ? "روابط التنقل" : "Navigation links"}">${mobileLinks}</nav><div class="p-5 border-t border-white/10 space-y-3 shrink-0"><a class="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-white/20 hover:border-[#38BDF8]/50 hover:bg-white/5 transition-all text-sm font-semibold text-[#94A3B8] hover:text-white" href="${c.switchHref}">${c.switchLabel}</a><a href="${whatsApp}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#22C55E] text-white font-bold text-sm hover:bg-[#22C55E]/90 transition-all">${escapeHtml(c.whatsapp)}</a></div></div></div></div></header>`;
}

function screenshot(item, locale, className = "") {
  const c = copy[locale];
  return `<figure class="${className || "rounded-xl border border-white/10 bg-[#111827] overflow-hidden"}"><button type="button" aria-label="${escapeHtml(item.alt[locale])} — ${locale === "ar" ? "عرض الصورة كاملة" : "View full screenshot"}" data-case-study-screenshot data-full-src="${item.path}" class="relative block w-full text-left rtl:text-right outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] focus-visible:ring-inset cursor-zoom-in" style="width:100%;max-height:560px;overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;touch-action:pan-y;scrollbar-width:thin;scrollbar-color:rgba(148,163,184,.8) rgba(15,23,42,.65)"><img src="${item.path}" width="${item.width}" height="${item.height}" alt="${escapeHtml(item.alt[locale])}" loading="lazy" decoding="async" style="position:static;width:100%;height:auto;max-width:none;display:block;transform:translateY(0);transition:none;will-change:auto"><div aria-hidden="true" style="position:sticky;bottom:0;left:0;right:0;height:80px;background:linear-gradient(to top, rgba(17,24,39,.95) 0%, transparent 100%);pointer-events:none"></div><span data-case-study-scroll-hint aria-hidden="true">${locale === "ar" ? "مرّر لعرض الصورة" : "Scroll to explore"}</span></button><figcaption class="px-5 py-4 text-sm leading-relaxed text-[#94A3B8]">${escapeHtml(item.alt[locale])}</figcaption></figure>`;
}

function section(title, body, inner = "", id = "") {
  return `<section${id ? ` id="${id}"` : ""} class="space-y-6"><div class="max-w-3xl"><h2 class="text-3xl font-bold tracking-tight">${title}</h2>${body ? `<p class="mt-4 text-lg leading-relaxed text-[#94A3B8]">${body}</p>` : ""}</div>${inner}</section>`;
}

function chips(items) {
  return `<div class="flex flex-wrap gap-3">${items.map((item) => `<span class="rounded-lg border border-white/10 bg-[#1E293B] px-4 py-2 text-sm font-semibold text-[#CBD5E1]">${escapeHtml(item)}</span>`).join("")}</div>`;
}

function page(locale) {
  const c = copy[locale];
  const img = Object.fromEntries(media.map((item) => [item.file.slice(0, 2), item]));
  const architecture = `<div class="grid gap-4 md:grid-cols-3"><div class="rounded-xl border border-white/10 bg-[#111827] p-5"><h3 class="font-bold">Admin Inertia UI</h3><p class="mt-2 text-sm text-[#94A3B8]">Laravel + Inertia + Vue</p></div><div class="rounded-xl border border-white/10 bg-[#111827] p-5"><h3 class="font-bold">Merchant SPA / Public Tracking</h3><p class="mt-2 text-sm text-[#94A3B8]">Vue 3, TypeScript, REST API, limited public projection</p></div><div class="rounded-xl border border-white/10 bg-[#111827] p-5"><h3 class="font-bold">Laravel 12 Modules</h3><p class="mt-2 text-sm text-[#94A3B8]">Authorization, lifecycle, warehouse, finance foundations, database</p></div></div>`;
  const phoneFlow = `<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">${["22", "23", "24", "25", "26"].map((key) => screenshot(img[key], locale, "rounded-[1.5rem] border border-white/10 bg-[#0B1020] overflow-hidden shadow-xl")).join("")}</div>`;
  return `<!DOCTYPE html><html lang="${c.lang}" dir="${c.dir}" class="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="preload" href="/_next/static/media/83afe278b6a6bb3c-s.p.2bn3s6zvc0dyp.woff2" as="font" crossorigin="" type="font/woff2"><link rel="preload" href="/_next/static/media/9ff27b8a0a8f3dc0-s.p.40_3w74kn95bo.woff2" as="font" crossorigin="" type="font/woff2"><link rel="preload" href="${c.logo}" as="image"><link rel="stylesheet" href="/_next/static/chunks/3b8hwydtiy37e.css" data-precedence="next"><link rel="stylesheet" href="/scripts/portfolio-effects.css" data-portfolio-effects="style"><title>${escapeHtml(c.title)} | Muhammed Nasser</title><meta name="description" content="${escapeHtml(c.description)}"><link rel="icon" href="/favicon.png"><style>.sd-page{max-width:1180px;margin:0 auto;padding:clamp(3rem,6vw,5rem) 1rem;display:flex;flex-direction:column;gap:clamp(4rem,7vw,6rem)}.sd-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:1.25rem}.sd-shot-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:1.5rem}.sd-hero{display:grid;grid-template-columns:minmax(0,1fr);gap:2rem;align-items:center}@media (min-width:960px){.sd-hero{grid-template-columns:.9fr 1.1fr}}body{overflow-x:hidden}</style></head><body class="${c.bodyClass}"><a href="#main-content" data-skip-link>${escapeHtml(c.skip)}</a>${nav(locale)}<main id="main-content" class="flex-1"><div class="sd-page"><section class="sd-hero"><div class="space-y-6"><div class="text-sm font-bold uppercase tracking-widest text-[#38BDF8]">${escapeHtml(c.eyebrow)}</div><div><p class="mb-3 text-base font-semibold text-[#94A3B8]">${escapeHtml(c.brand)}</p><h1 class="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">${escapeHtml(c.title)}</h1></div><p class="text-xl leading-relaxed text-[#CBD5E1]">${escapeHtml(c.description)}</p><p class="text-sm font-semibold text-[#94A3B8]">${escapeHtml(c.role)}</p><div class="flex flex-wrap gap-3"><a href="#technical-details" class="rounded-lg border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-5 py-3 text-sm font-bold text-[#38BDF8] hover:bg-[#38BDF8]/20">${escapeHtml(c.details)}</a><a href="${liveUrl}" target="_blank" rel="noopener noreferrer" class="rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/10 px-5 py-3 text-sm font-bold text-[#22C55E] hover:bg-[#22C55E]/20">${escapeHtml(c.live)}</a></div></div>${screenshot(img["02"], locale)}</section>${section(c.sections.overview, c.paragraphs.overview, `<div class="sd-grid">${chips(c.tech)}${chips(c.roles)}</div><div class="mt-6">${screenshot(img["01"], locale)}</div>`)}${section(c.sections.challenge, c.paragraphs.challenge)}${section(c.sections.design, c.paragraphs.design, `<div class="sd-shot-grid">${screenshot(img["08"], locale)}</div>`)}${section(c.sections.architecture, c.paragraphs.architecture, architecture, "technical-details")}${section(c.sections.lifecycle, c.paragraphs.lifecycle, `${chips(c.lifecycle)}<div class="mt-6">${screenshot(img["04"], locale)}</div>`)}${section(c.sections.shipment, "", `<div class="sd-shot-grid">${screenshot(img["03"], locale)}${screenshot(img["10"], locale)}</div>`)}${section(c.sections.pickup, "", `<div class="sd-shot-grid">${screenshot(img["05"], locale)}${screenshot(img["06"], locale)}${screenshot(img["07"], locale)}</div>`)}${section(c.sections.merchant, "", `<div class="sd-shot-grid">${screenshot(img["08"], locale)}${screenshot(img["09"], locale)}${screenshot(img["18"], locale)}</div>`)}${section(c.sections.tracking, c.paragraphs.tracking, `<div class="sd-shot-grid">${screenshot(img["15"], locale)}${screenshot(img["16"], locale)}</div>`)}${section(c.sections.access, "", `<div class="sd-shot-grid">${screenshot(img["17"], locale)}${screenshot(img["12"], locale)}</div>`)}${section(c.sections.admin, "", `<div class="sd-shot-grid">${screenshot(img["11"], locale)}${screenshot(img["12"], locale)}${screenshot(img["13"], locale)}${screenshot(img["14"], locale)}</div>`)}${section(c.sections.finance, c.paragraphs.finance, chips(c.finance))}${section(c.sections.auth, "", `<div class="sd-shot-grid">${screenshot(img["19"], locale)}${screenshot(img["20"], locale)}${screenshot(img["21"], locale)}</div>`)}${section(c.sections.mobile, c.paragraphs.mobile, phoneFlow)}${section(c.sections.engineering, "", `<ul class="grid gap-3 text-[#CBD5E1]">${c.bullets.map((item) => `<li class="rounded-lg border border-white/10 bg-[#111827] p-4">${escapeHtml(item)}</li>`).join("")}</ul>`)}${section(c.sections.boundaries, c.paragraphs.boundaries)}</div></main><footer class="border-t border-white/10 bg-[#0B1020] py-8 mt-12"><div class="container mx-auto px-4 text-center text-[#94A3B8]"><p>© 2026 ${locale === "ar" ? "محمد ناصر. جميع الحقوق محفوظة." : "Muhammed Nasser. All rights reserved."}</p></div></footer><script src="/scripts/portfolio-effects.js" defer data-portfolio-effects="script"></script><script src="/scripts/case-study-screenshots.js" defer></script><script src="/scripts/mobile-navigation.js" defer data-mobile-navigation="script"></script></body></html>`;
}

function writeRoutes() {
  for (const locale of ["en", "ar"]) {
    const file = resolve(root, locale === "ar" ? `ar/work/${slug}/index.html` : `work/${slug}/index.html`);
    ensureDir(dirname(file));
    writeFileSync(file, page(locale));
  }
}

function backendCard(locale) {
  const c = copy[locale];
  const title = escapeHtml(c.title);
  const desc = escapeHtml(c.description);
  const eyebrow = escapeHtml(locale === "ar" ? "منصة تشغيل / Laravel" : "Operations Platform / Laravel");
  const href = locale === "ar" ? caseStudy.ar : caseStudy.en;
  const liveLabel = escapeHtml(c.live);
  const details = escapeHtml(locale === "ar" ? "عرض دراسة الحالة / التفاصيل التقنية والصور" : "View Case Study / Technical Details & Screenshots");
  return `<article data-backend-featured="${slug}" class="group flex flex-col bg-[#111827] rounded-2xl overflow-hidden border border-[#38BDF8]/25 hover:border-[#38BDF8]/50 transition-all hover:shadow-[0_10px_30px_rgba(56,189,248,0.08)]"><a class="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#38BDF8]" href="${href}"><div class="relative aspect-[4/3] w-full bg-[#0B1020] overflow-hidden"><img alt="${title}" loading="lazy" decoding="async" class="h-full w-full object-cover object-top opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" src="${media[0].path}" width="${media[0].width}" height="${media[0].height}"><div class="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80"></div></div><div class="p-8 flex-1 flex flex-col"><div class="text-xs font-bold text-[#38BDF8] mb-3 uppercase tracking-widest">${eyebrow}</div><h2 class="text-2xl font-bold mb-3 leading-snug group-hover:text-[#38BDF8] transition-colors">${title}</h2><p class="text-[#94A3B8] text-sm leading-relaxed line-clamp-2 flex-1">${desc}</p></div></a><div class="px-8 pb-8 flex flex-wrap gap-3"><a href="${href}" class="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border border-[#38BDF8]/20 bg-[#38BDF8]/10 text-[#38BDF8] hover:bg-[#38BDF8]/20">${details}</a><a href="${liveUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border border-[#22C55E]/20 bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20">${liveLabel}</a></div></article>`;
}

function updateBackendIndex() {
  for (const [file, locale] of [[resolve(root, "backend/index.html"), "en"], [resolve(root, "ar/backend/index.html"), "ar"]]) {
    let html = readFileSync(file, "utf8");
    html = html.replace(new RegExp(`<article data-backend-featured="${slug}"[\\s\\S]*?<\\/article>`, "g"), "");
    const marker = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">';
    if (!html.includes(marker)) throw new Error(`Could not locate backend grid in ${file}`);
    html = html.replace(marker, `${marker}${backendCard(locale)}`);
    writeFileSync(file, html);
  }
}

importMedia();
updateProjects();
writeRoutes();
updateBackendIndex();
console.log(`Generated ${slug} case-study routes, media, project data, and Backend Systems placement.`);
