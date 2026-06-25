import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workspace = "S:\\workspace";
const templateEn = fs.readFileSync(path.join(root, "work", "kuwait-arc", "index.html"), "utf8");
const templateAr = fs.readFileSync(path.join(root, "ar", "work", "kuwait-arc", "index.html"), "utf8");

const projects = [
  {
    slug: "originals-hub",
    source: "orginal hub",
    live: "https://originalhub.net/",
    categoryKey: "ecommerce",
    categoryEn: "WooCommerce / eCommerce",
    categoryAr: "وكومرس / متجر إلكتروني",
    titleEn: "Originals Hub WooCommerce Store",
    titleAr: "متجر أوريجينالز هب WooCommerce",
    descriptionEn: "A WooCommerce storefront focused on product discovery, store pages, and a polished shopping journey.",
    descriptionAr: "متجر WooCommerce يعرض المنتجات وصفحات المتجر وتجربة شراء واضحة ومنظمة.",
    tags: ["WordPress", "WooCommerce", "PHP"]
  },
  {
    slug: "arcadia-digital",
    source: "arcdia",
    live: "https://arcadiadigital.co/",
    categoryKey: "corporate",
    categoryEn: "Corporate / Business Website",
    categoryAr: "موقع شركة / أعمال",
    titleEn: "Arcadia Digital Solutions",
    titleAr: "أركاديا الرقمية للحلول",
    descriptionEn: "A corporate service website for Arcadia Digital, presenting services, content, contact paths, and brand trust.",
    descriptionAr: "موقع شركة لأركاديا الرقمية يعرض الخدمات والمحتوى ومسارات التواصل وإشارات الثقة.",
    tags: ["WordPress", "PHP", "HTML"]
  },
  {
    slug: "diwaniya",
    source: "ديوانية",
    live: "http://diwaniyah.org/",
    categoryKey: "corporate",
    categoryEn: "Education / Content / Community",
    categoryAr: "تعليم / محتوى / مجتمع",
    titleEn: "Diwaniya Cultural Platform",
    titleAr: "منصة الديوانية الثقافية",
    descriptionEn: "A community and cultural platform with registration, gallery, and event-focused pages.",
    descriptionAr: "منصة ثقافية ومجتمعية تضم التسجيل والمعرض وصفحات الفعاليات.",
    tags: ["WordPress", "HTML", "CSS"]
  },
  {
    slug: "mahmmoud-gomaa",
    source: "mahmoud gomaa",
    live: "https://mahmoud-gomaa.com/",
    categoryKey: "corporate",
    categoryEn: "Portfolio / Architect Website",
    categoryAr: "بورتفوليو / موقع معماري",
    titleEn: "Mahmoud Gomaa Architecture Portfolio",
    titleAr: "بورتفوليو محمود جمعة المعماري",
    descriptionEn: "A personal architecture portfolio with project pages, blog content, and contact flows.",
    descriptionAr: "بورتفوليو معماري شخصي يعرض المشاريع والمقالات ومسارات التواصل.",
    tags: ["WordPress", "Portfolio", "PHP"]
  },
  {
    slug: "mashora",
    source: "مشورة",
    live: "http://mashourah-lawyer.com/",
    categoryKey: "services",
    categoryEn: "Legal / Services Website",
    categoryAr: "قانون / موقع خدمات",
    titleEn: "Mashourah Lawyer Website",
    titleAr: "موقع مشورة للمحاماة",
    descriptionEn: "A legal services website presenting practice areas, about content, and service pages.",
    descriptionAr: "موقع خدمات قانونية يعرض مجالات العمل والتعريف بالمكتب والخدمات.",
    tags: ["WordPress", "Services", "Arabic RTL"]
  },
  {
    slug: "meshari-alali",
    source: "مشاري العلي",
    live: "https://mesharialali.com/",
    categoryKey: "corporate",
    categoryEn: "Engineering / Corporate Website",
    categoryAr: "هندسة / موقع شركة",
    titleEn: "Meshari Alali Engineering Website",
    titleAr: "موقع مشاري العلي الهندسي",
    descriptionEn: "An engineering company website presenting services, projects, blog content, and company information.",
    descriptionAr: "موقع شركة هندسية يعرض الخدمات والمشاريع والمدونة ومعلومات الشركة.",
    tags: ["WordPress", "Engineering", "HTML"]
  },
  {
    slug: "light-islam",
    source: "نور الاسلام",
    live: "https://lightislam.com/",
    categoryKey: "services",
    categoryEn: "Services / Maintenance Website",
    categoryAr: "خدمات / صيانة",
    titleEn: "Light Islam Services Website",
    titleAr: "موقع نور الإسلام للخدمات",
    descriptionEn: "A services website covering maintenance, decor, portfolio work, blog content, and contact pages.",
    descriptionAr: "موقع خدمات يعرض الصيانة والديكور ومعرض الأعمال والمدونة وصفحات التواصل.",
    tags: ["WordPress", "Services", "Arabic RTL"]
  },
  {
    slug: "mishari-oud",
    source: "مشاري",
    live: "https://meemsa.net/",
    categoryKey: "ecommerce",
    categoryEn: "WooCommerce / Perfume Store",
    categoryAr: "وكومرس / متجر عطور",
    titleEn: "Mishari Oud Store",
    titleAr: "متجر مشاري للعود",
    descriptionEn: "A WooCommerce store for oud and perfumes with shop, product, cart, checkout, and contact pages.",
    descriptionAr: "متجر WooCommerce للعود والعطور يضم المتجر والمنتج والسلة والدفع والتواصل.",
    tags: ["WordPress", "WooCommerce", "PHP"]
  },
  {
    slug: "juli-tourism",
    source: "جوليا",
    live: "https://julitourism.com/",
    categoryKey: "services",
    categoryEn: "Travel / Tourism Website",
    categoryAr: "سياحة / سفر",
    titleEn: "Juli Tourism & Travel",
    titleAr: "جولي للسياحة والسفر",
    descriptionEn: "A tourism website presenting travel packages, services, blog content, and contact paths.",
    descriptionAr: "موقع سياحة وسفر يعرض البرامج والخدمات والمقالات ومسارات التواصل.",
    tags: ["WordPress", "Travel", "HTML"]
  },
  {
    slug: "baslim-auto",
    source: "بسالم",
    live: "https://basalimauto.com/",
    categoryKey: "services",
    categoryEn: "Automotive / Showroom Website",
    categoryAr: "سيارات / معرض",
    titleEn: "Basalim Auto Showroom",
    titleAr: "معرض بسالم للسيارات",
    descriptionEn: "An automotive showroom website with home, about, maintenance, and Arabic landing pages.",
    descriptionAr: "موقع معرض سيارات يضم الرئيسية والتعريف والصيانة والنسخة العربية.",
    tags: ["WordPress", "Automotive", "HTML"]
  },
  {
    slug: "lec-elevators",
    source: "lec",
    live: "http://lec-eg.com/",
    categoryKey: "corporate",
    categoryEn: "Elevators / Corporate Website",
    categoryAr: "مصاعد / موقع شركة",
    titleEn: "LEC Elevators Company",
    titleAr: "الشركة الهندسية للمصاعد",
    descriptionEn: "A corporate website for an elevator company with services, portfolio, company profile, and contact pages.",
    descriptionAr: "موقع شركة مصاعد يعرض الخدمات والأعمال والتعريف بالشركة وصفحات التواصل.",
    tags: ["WordPress", "Corporate", "PHP"]
  },
  {
    slug: "top-pack",
    source: "top pack",
    live: "https://toppack-sys.com/",
    categoryKey: "corporate",
    categoryEn: "Packaging / Corporate Website",
    categoryAr: "تعبئة وتغليف / موقع شركة",
    titleEn: "Top Pack Systems Website",
    titleAr: "موقع توب باك سيستمز",
    descriptionEn: "A packaging company website presenting products, services, videos, about content, and contact paths.",
    descriptionAr: "موقع شركة تعبئة وتغليف يعرض المنتجات والخدمات والفيديوهات والتواصل.",
    tags: ["WordPress", "Corporate", "HTML"]
  },
  {
    slug: "fast-shopping",
    source: "فاست شوبيج",
    live: "https://fastshopping24.com/",
    categoryKey: "ecommerce",
    categoryEn: "WooCommerce / eCommerce",
    categoryAr: "وكومرس / متجر إلكتروني",
    titleEn: "Fast Shopping 24 Store",
    titleAr: "متجر فاست شوبينج 24",
    descriptionEn: "A WooCommerce shopping website with home, shop, product, checkout, about, and contact pages.",
    descriptionAr: "متجر WooCommerce يضم الرئيسية والمتجر والمنتج والدفع والتعريف والتواصل.",
    tags: ["WordPress", "WooCommerce", "PHP"]
  },
  {
    slug: "omnas",
    source: "omnas",
    live: "http://omnas.com/",
    categoryKey: "corporate",
    categoryEn: "Corporate Website",
    categoryAr: "موقع شركة",
    titleEn: "Omnas Website",
    titleAr: "موقع اومناس",
    descriptionEn: "A corporate website captured as a full-page presentation.",
    descriptionAr: "موقع شركة تم عرضه كلقطة صفحة كاملة.",
    tags: ["WordPress", "HTML", "CSS"]
  },
  {
    slug: "prowindow",
    source: "prowindow",
    live: "https://prowindow-eg.com/",
    categoryKey: "corporate",
    categoryEn: "Windows / Corporate Website",
    categoryAr: "أبواب وشبابيك / موقع شركة",
    titleEn: "Pro Window Egypt Website",
    titleAr: "موقع برو ويندو مصر",
    descriptionEn: "A product-led company website for windows, doors, shutters, insect screens, and glass systems.",
    descriptionAr: "موقع شركة لمنتجات الأبواب والشبابيك والشيش وسلك الناموس وأنظمة الزجاج.",
    tags: ["WordPress", "Products", "HTML"]
  },
  {
    slug: "taha-ramadan",
    source: "taha",
    live: "https://drtaharamadan.com/",
    categoryKey: "services",
    categoryEn: "Medical / Doctor Website",
    categoryAr: "طبي / موقع طبيب",
    titleEn: "Dr Taha Ramadan Website",
    titleAr: "موقع دكتور طه رمضان",
    descriptionEn: "A medical website presenting home, about, analysis, follow-up, contact, and content pages.",
    descriptionAr: "موقع طبي يعرض الرئيسية والتعريف والتحاليل والمتابعة والتواصل والمحتوى.",
    tags: ["WordPress", "Medical", "Arabic RTL"]
  },
  {
    slug: "asia-eg",
    source: "asia",
    live: "https://asia-eg.com/",
    categoryKey: "corporate",
    categoryEn: "Corporate Website",
    categoryAr: "موقع شركة",
    titleEn: "Asia Egypt Website",
    titleAr: "موقع آسيا مصر",
    descriptionEn: "A corporate website with homepage and about-company presentation.",
    descriptionAr: "موقع شركة يعرض الصفحة الرئيسية والتعريف بالشركة.",
    tags: ["WordPress", "Corporate", "HTML"]
  },
  {
    slug: "zeta-medicine",
    source: "zeta",
    live: "https://zetamedicine.com/",
    categoryKey: "ecommerce",
    categoryEn: "Medicine / eCommerce Website",
    categoryAr: "طبي / متجر إلكتروني",
    titleEn: "Zeta Medicine Website",
    titleAr: "موقع زيتا ميديسن",
    descriptionEn: "A medicine-focused website with home, products, shop, affiliate, FAQ, about, and contact pages.",
    descriptionAr: "موقع طبي وتجاري يضم الرئيسية والمنتجات والمتجر والشركاء والأسئلة والتواصل.",
    tags: ["WordPress", "Products", "WooCommerce"]
  },
  {
    slug: "alrowad",
    source: "الرواد",
    live: "https://alrowadpacks.com/",
    categoryKey: "corporate",
    categoryEn: "Packaging / Industrial Website",
    categoryAr: "تعبئة وتغليف / صناعي",
    titleEn: "Alrowad Packs Website",
    titleAr: "موقع الرواد للتعبئة والتغليف",
    descriptionEn: "An industrial packaging website with homepage, categories, machine, about, and contact pages.",
    descriptionAr: "موقع صناعي للتعبئة والتغليف يضم الرئيسية والأقسام والماكينات والتعريف والتواصل.",
    tags: ["WordPress", "Industrial", "Arabic RTL"]
  }
];

const imageExts = new Set([".png", ".jpg", ".jpeg", ".webp"]);

const existingWorkOrder = [
  "eventgift-egypt",
  "eventgift-uae",
  "eventgift-saudi",
  "botella",
  "techmart",
  "ashhalan",
  "afaaq-developments",
  "nora24jewelry",
  "oryxbag",
  "gobe",
  "genedyeg",
  "a2mkw",
  "nuc-kw",
  "tbinnovation",
  "mediaandmore",
  "ashhalanksa",
  "ashhalanlogistics",
  "ashhalancarrental",
  "arabic-window",
  "kuwait-arc",
  "torathyat",
  "armadillo-studio",
  "alrowad",
  "crm-order-management-system",
  "gold-mine-erp",
  "originals-hub",
  "arcadia-digital",
  "diwaniya",
  "mahmmoud-gomaa",
  "meshari-alali",
  "light-islam",
  "juli-tourism",
  "baslim-auto",
  "fast-shopping",
  "mishari-oud",
  "lec-elevators"
];

const appendedWorkOrder = [
  "mashora",
  "top-pack",
  "omnas",
  "prowindow",
  "taha-ramadan",
  "asia-eg",
  "zeta-medicine"
];

function fileUrl(relativePath) {
  return `/${relativePath.replaceAll("\\", "/")}`;
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function write(relativePath, html) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html, "utf8");
}

function normalizeName(name) {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

function isCoverName(name) {
  const n = normalizeName(path.parse(name).name);
  return n.includes("cover") || n.includes("كوفر");
}

function isHomeName(name) {
  const n = normalizeName(path.parse(name).name);
  return n.includes("home") || n.includes("الرئيس") || n.includes("مشورة") || n.includes("full page");
}

function sortImages(files) {
  return [...files].sort((a, b) => {
    const score = (file) => {
      if (isCoverName(file)) return 0;
      if (isHomeName(file)) return 1;
      return 2;
    };
    return score(a.name) - score(b.name) || a.name.localeCompare(b.name, "ar");
  });
}

function titleFromFile(fileName, isArabic) {
  const base = path.parse(fileName).name.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  const lower = base.toLowerCase();
  if (isCoverName(fileName)) return isArabic ? "صورة الكوفر" : "Cover";
  if (lower.includes("home") || base.includes("الرئيس")) return isArabic ? "الصفحة الرئيسية" : "Home Page";
  if (lower.includes("about") || base.includes("من نحن") || base.includes("عن") || base.includes("معلومات")) return isArabic ? "من نحن" : "About Page";
  if (lower.includes("contact") || base.includes("تواصل") || base.includes("اتصل")) return isArabic ? "صفحة التواصل" : "Contact Page";
  if (lower.includes("blog") || base.includes("مدونة")) return isArabic ? "المدونة" : "Blog Page";
  if (lower.includes("shop") || base.includes("متجر")) return isArabic ? "صفحة المتجر" : "Shop Page";
  if (lower.includes("product") || lower.includes("prodcut") || base.includes("المنتج") || base.includes("ماكينة")) return isArabic ? "صفحة المنتج" : "Product Page";
  if (lower.includes("checkout") || base.includes("تيشك")) return isArabic ? "إتمام الطلب" : "Checkout Page";
  if (lower.includes("cart")) return isArabic ? "سلة التسوق" : "Cart Page";
  if (lower.includes("service") || lower.includes("serv") || base.includes("خدمات") || base.includes("صيانة")) return isArabic ? "الخدمات" : "Services Page";
  if (base.includes("المعرض") || lower.includes("portfolio") || lower.includes("porfiloi")) return isArabic ? "معرض الأعمال" : "Portfolio Page";
  return base;
}

function importImages(project) {
  const sourceDir = path.join(workspace, project.source);
  if (!fs.existsSync(sourceDir)) throw new Error(`Source folder not found: ${sourceDir}`);

  const files = fs.readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && imageExts.has(path.extname(entry.name).toLowerCase()));
  const sorted = sortImages(files);
  if (!sorted.length) throw new Error(`No images found in ${sourceDir}`);

  const projectDir = path.join(root, "projects", project.slug);
  const fullPageDir = path.join(projectDir, "full-page");
  fs.mkdirSync(fullPageDir, { recursive: true });

  const coverEntry = sorted.find((entry) => isCoverName(entry.name)) || sorted.find((entry) => isHomeName(entry.name)) || sorted[0];
  fs.copyFileSync(path.join(sourceDir, coverEntry.name), path.join(projectDir, `cover${path.extname(coverEntry.name).toLowerCase()}`));
  const coverFile = `projects/${project.slug}/cover${path.extname(coverEntry.name).toLowerCase()}`;

  const screenshots = sorted.map((entry, index) => {
    const ext = path.extname(entry.name).toLowerCase();
    const base = path.parse(entry.name).name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || `screenshot-${index + 1}`;
    const file = `${String(index + 1).padStart(2, "0")}-${base}${ext}`;
    fs.copyFileSync(path.join(sourceDir, entry.name), path.join(fullPageDir, file));
    return {
      file,
      original: entry.name,
      titleEn: titleFromFile(entry.name, false),
      titleAr: titleFromFile(entry.name, true)
    };
  });

  fs.writeFileSync(
    path.join(fullPageDir, "manifest.json"),
    JSON.stringify({ importedAt: new Date().toISOString(), source: sourceDir, live: project.live, screenshots }, null, 2),
    "utf8"
  );

  return { coverFile, screenshots };
}

function buildTagList(tags) {
  return tags.map((tag) => `<span class="px-4 py-2 bg-[#1E293B] text-sm font-semibold rounded-md border border-white/5 text-[#94A3B8]">${tag}</span>`).join("");
}

function buildFeatureList(isArabic) {
  const features = isArabic
    ? ["تصميم متجاوب", "صور صفحات حقيقية", "صفحات تعريف وخدمات", "مسار تواصل واضح", "هيكلة مناسبة لمحركات البحث", "عرض منظم للأعمال"]
    : ["Responsive design", "Real page screenshots", "About and service pages", "Clear contact path", "SEO-friendly structure", "Organized project showcase"];
  return features.map((feature) => `<li class="flex items-start gap-3"><svg class="w-6 h-6 text-[#38BDF8] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>${feature}</span></li>`).join("");
}

function buildScreenshotCards(project, imported, isArabic) {
  return imported.screenshots.map((shot) => {
    const label = isArabic ? shot.titleAr : shot.titleEn;
    const aria = isArabic ? `عرض ${label} كاملاً` : `View ${label} full screenshot`;
    const img = `/projects/${project.slug}/full-page/${shot.file}`;
    const fullPage = isArabic ? "صفحة كاملة" : "Full page";
    const hover = isArabic ? "مرر لعرض الصورة كاملة" : "Hover to scroll preview";
    const tap = isArabic ? "اضغط للعرض" : "Tap to view";
    return `<div class="flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#111827] shadow-lg hover:border-white/20 hover:shadow-[0_8px_30px_rgba(56,189,248,0.07)] transition-all duration-300"><button type="button" aria-label="${aria}" class="relative block w-full text-left rtl:text-right outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] focus-visible:ring-inset cursor-zoom-in" style="height:420px;overflow:hidden;flex-shrink:0"><img src="${img}" alt="${label}" style="width:100%;height:auto;display:block;transform:translateY(0);transition:transform 1.5s ease-in-out;will-change:transform"/><div aria-hidden="true" style="position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(to top, rgba(17,24,39,0.95) 0%, transparent 100%);opacity:1;transition:opacity 0.5s ease;pointer-events:none"></div><div aria-hidden="true" class="absolute top-3 ${isArabic ? "left" : "right"}-3 flex items-center gap-1 px-2.5 py-1.5 bg-black/60 border border-white/15 text-white/70 text-xs font-semibold rounded-lg backdrop-blur-sm"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>${fullPage}</div><div aria-hidden="true" style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);opacity:0.85;transition:opacity 0.3s ease;white-space:nowrap;pointer-events:none" class="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-sm border border-white/10 rounded-full"><svg class="w-3 h-3 text-[#38BDF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7M12 3v18"></path></svg><span class="text-white/70 text-xs font-medium hidden md:inline">${hover}</span><span class="text-white/70 text-xs font-medium md:hidden">${tap}</span></div><div aria-hidden="true" class="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors duration-300"><div style="opacity:0;transform:scale(0.8);transition:opacity 0.2s ease, transform 0.2s ease" class="p-3 bg-black/60 backdrop-blur-sm rounded-full border border-white/10"><svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"></path></svg></div></div></button><div class="px-5 py-4 space-y-1.5 flex-1"><p class="text-white font-semibold text-base leading-snug">${label}</p></div></div>`;
  }).join("");
}

function buildMain(project, imported, isArabic) {
  const title = isArabic ? project.titleAr : project.titleEn;
  const category = isArabic ? project.categoryAr : project.categoryEn;
  const description = isArabic ? project.descriptionAr : project.descriptionEn;
  const problemTitle = isArabic ? "المشكلة" : "The Problem";
  const solutionTitle = isArabic ? "الحل" : "The Solution";
  const featuresTitle = isArabic ? "أهم المميزات" : "Key Features";
  const roleTitle = isArabic ? "دوري في المشروع" : "My Role";
  const stackTitle = isArabic ? "التقنيات المستخدمة" : "Tech Stack";
  const screenshotsTitle = isArabic ? "صور المشروع" : "Project Screenshots";
  const liveLabel = isArabic ? "زيارة الموقع" : "View Live Site";
  const cta = isArabic ? "تحتاج مشروع مشابه؟" : "Need a similar project?";
  const problem = isArabic
    ? "كان المشروع يحتاج إلى عرض أوضح للهوية والخدمات والصفحات المهمة داخل تجربة منظمة وسهلة التصفح."
    : "The project needed a clearer presentation for the brand, services, and key pages inside a structured browsing experience.";
  const solution = isArabic
    ? `تم تنظيم المشروع كدراسة حالة تعرض الصور الحقيقية للموقع، مع كوفر واضح للكارد وصفحات داخلية كاملة يمكن استعراضها بالتمرير.`
    : `The project is presented as a case study using real site screenshots, a clear card cover, and full internal pages that can be explored with scroll previews.`;

  return `<main class="flex-1"><div class="container mx-auto px-4 py-20 space-y-20"><header class="max-w-4xl mx-auto space-y-8 text-center"><div class="text-sm font-bold text-[#38BDF8] uppercase tracking-widest">${category}</div><h1 class="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">${title}</h1><p class="text-xl md:text-2xl text-[#94A3B8] max-w-3xl mx-auto leading-relaxed whitespace-pre-wrap">${description}</p><div class="flex flex-wrap items-center justify-center gap-4 pt-4"><a href="${project.live}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-8 py-4 bg-[#22C55E] text-white font-bold text-lg rounded-lg hover:bg-[#22C55E]/90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>${liveLabel}</a></div></header><div class="relative aspect-video max-w-5xl mx-auto rounded-xl overflow-hidden border border-white/10 shadow-2xl"><img alt="${title} screenshot" decoding="async" data-nimg="fill" class="object-cover object-top" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" src="${fileUrl(imported.coverFile)}"/></div><div class="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-6xl mx-auto"><div class="md:col-span-2 space-y-16"><section><h2 class="text-3xl font-bold mb-6 tracking-tight">${problemTitle}</h2><p class="text-[#94A3B8] text-lg leading-relaxed whitespace-pre-wrap">${problem}</p></section><section><h2 class="text-3xl font-bold mb-6 tracking-tight">${solutionTitle}</h2><p class="text-[#94A3B8] text-lg leading-relaxed whitespace-pre-wrap">${solution}</p></section><section><h2 class="text-3xl font-bold mb-6 tracking-tight">${featuresTitle}</h2><ul class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#94A3B8] text-lg">${buildFeatureList(isArabic)}</ul></section></div><aside class="space-y-10 bg-[#111827] p-8 rounded-2xl border border-white/5 h-fit shadow-lg sticky top-24"><div><h3 class="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4">${roleTitle}</h3><ul class="space-y-2"><li class="font-semibold text-lg text-[#F8FAFC]">Lead Developer</li></ul></div><div><h3 class="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4">${stackTitle}</h3><div class="flex flex-wrap gap-2">${buildTagList(project.tags)}</div></div><div class="pt-6 border-t border-white/5"><a href="https://wa.me/201025811613?text=${encodeURIComponent(`${isArabic ? "أهلاً محمد، شاهدت مشروع" : "Hello Muhammed, I saw the"} ${title} ${isArabic ? "وأحتاج لمشروع مشابه." : "project and I need a similar project."}`)}" target="_blank" rel="noopener noreferrer" class="block w-full text-center py-4 bg-[#38BDF8] text-[#0B1020] font-bold text-lg rounded-lg hover:bg-[#38BDF8]/90 hover:scale-105 transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)]">${cta}</a></div></aside></div><section class="max-w-6xl mx-auto space-y-8"><h2 class="text-3xl font-bold tracking-tight">${screenshotsTitle}</h2><div class="grid grid-cols-1 sm:grid-cols-2 gap-6">${buildScreenshotCards(project, imported, isArabic)}</div></section></div></main>`;
}

function buildPreloads(project, imported) {
  return [
    `<link rel="preload" as="image" href="${fileUrl(imported.coverFile)}"/>`,
    ...imported.screenshots.slice(0, 4).map((shot) => `<link rel="preload" as="image" href="/projects/${project.slug}/full-page/${shot.file}"/>`)
  ].join("");
}

function renderPage(project, imported, isArabic) {
  const template = isArabic ? templateAr : templateEn;
  const title = isArabic ? project.titleAr : project.titleEn;
  const desc = isArabic ? project.descriptionAr : project.descriptionEn;
  let html = template
    .replaceAll("kuwait-arc", project.slug)
    .replaceAll("/work/kuwait-arc/", `/work/${project.slug}/`)
    .replaceAll("/ar/work/kuwait-arc/", `/ar/work/${project.slug}/`);

  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(/<meta name="description" content=".*?"\/>/, `<meta name="description" content="${desc}"/>`);
  html = html.replace(/<link rel="preload" as="image" href="\/projects\/[^"]+\/cover\.[^"]+"\/>(?:<link rel="preload" as="image" href="\/projects\/[^"]+\/full-page\/[^"]+"\/>)*/g, buildPreloads(project, imported));
  html = html.replace(/<main class="flex-1">[\s\S]*?<\/main>/, buildMain(project, imported, isArabic));
  html = html.replace(/<script src="\/scripts\/[^"]*screenshots\.js" defer><\/script>/g, "");
  html = html.replace("</body>", `<script src="/scripts/case-study-screenshots.js" defer></script></body>`);
  return html;
}

function buildCard(project, imported, isArabic) {
  const title = isArabic ? project.titleAr : project.titleEn;
  const category = isArabic ? project.categoryAr : project.categoryEn;
  const description = isArabic ? project.descriptionAr : project.descriptionEn;
  const liveLabel = isArabic ? "زيارة الموقع" : "Live Site";
  const archiveLabel = isArabic ? "تصفح الأرشيف" : "Browse Archive";
  const href = isArabic ? `/ar/work/${project.slug}/` : `/work/${project.slug}/`;
  return `<div class="group flex flex-col bg-[#111827] rounded-2xl overflow-hidden border border-white/5 hover:border-[#38BDF8]/30 transition-all hover:shadow-[0_10px_30px_rgba(56,189,248,0.05)] hover:-translate-y-1 relative" data-work-category="${project.categoryKey}"><a class="absolute inset-0 z-0" aria-label="View ${title}" href="${href}"></a><div class="relative aspect-[4/3] w-full bg-[#0B1020] overflow-hidden pointer-events-none"><img alt="${title}" loading="lazy" decoding="async" data-nimg="fill" class="object-cover object-top opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" src="${fileUrl(imported.coverFile)}"/><div class="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80"></div></div><div class="p-8 flex-1 flex flex-col relative z-10 pointer-events-none"><div class="text-xs font-bold text-[#38BDF8] mb-3 uppercase tracking-widest">${category}</div><h3 class="text-2xl font-bold mb-3 leading-snug group-hover:text-[#38BDF8] transition-colors">${title}</h3><p class="text-[#94A3B8] text-sm leading-relaxed line-clamp-2">${description}</p><div class="pointer-events-auto"><div class="mt-4 flex flex-wrap gap-2"><a href="${project.live}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 hover:bg-[#22C55E]/20 hover:border-[#22C55E]/40 transition-all"><span class="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>${liveLabel}<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a><a class="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 hover:bg-[#38BDF8]/20 hover:border-[#38BDF8]/40 transition-all" href="${href}"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>${archiveLabel}</a></div></div><div class="mt-6 flex flex-wrap gap-2">${project.tags.map((tag) => `<span class="text-xs font-semibold px-3 py-1.5 bg-[#1E293B] border border-white/5 rounded-md text-[#94A3B8]">${tag}</span>`).join("")}</div></div></div>`;
}

const workGridStart = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 work-project-grid gap-8">';

function getWorkGridBounds(html) {
  const start = html.indexOf(workGridStart);
  if (start === -1) return null;
  const contentStart = start + workGridStart.length;
  const end = html.indexOf("</div></main>", contentStart);
  if (end === -1) return null;
  return { start: contentStart, end };
}

function findCardStarts(html) {
  return [...html.matchAll(/<div[^>]*data-work-category="[^"]+"[^>]*>/g)].map((match) => match.index);
}

function removeCard(html, slug, isArabic) {
  const needles = isArabic ? [`/ar/work/${slug}/`, `/ar/work/${slug}"`] : [`/work/${slug}/`, `/work/${slug}"`];
  let changed = true;
  while (changed) {
    changed = false;
    const idx = Math.min(...needles.map((needle) => {
      const found = html.indexOf(needle);
      return found === -1 ? Number.POSITIVE_INFINITY : found;
    }));
    if (!Number.isFinite(idx)) break;
    const starts = findCardStarts(html);
    const start = starts.filter((cardStart) => cardStart <= idx).at(-1) ?? -1;
    const nextStart = starts.find((cardStart) => cardStart > start);
    let end = nextStart ?? -1;
    if (end === -1) end = html.indexOf("</div></main>", start);
    if (start === -1 || end === -1) break;
    html = html.slice(0, start) + html.slice(end);
    changed = true;
  }
  return html;
}

function updateFilterCounts(html) {
  const counts = { all: 0, ecommerce: 0, corporate: 0, services: 0, platforms: 0 };
  const bounds = getWorkGridBounds(html);
  const gridHtml = bounds ? html.slice(bounds.start, bounds.end) : html;
  for (const match of gridHtml.matchAll(/data-work-category="([^"]+)"/g)) {
    counts.all += 1;
    if (counts[match[1]] !== undefined) counts[match[1]] += 1;
  }
  for (const [key, count] of Object.entries(counts)) {
    html = html.replace(new RegExp(`value="${key}"( checked)?><span>([^<]+)<small aria-hidden="true">\\d+</small>`), `value="${key}"$1><span>$2<small aria-hidden="true">${count}</small>`);
  }
  return html;
}

function getCardSlug(card, isArabic) {
  const prefix = isArabic ? "/ar/work/" : "/work/";
  const match = card.match(new RegExp(`href="${prefix.replace(/\//g, "\\/")}([^"/]+)\\/"`));
  return match ? match[1] : null;
}

function extractCards(html, isArabic) {
  const cards = new Map();
  const bounds = getWorkGridBounds(html);
  const gridHtml = bounds ? html.slice(bounds.start, bounds.end) : html;
  const starts = findCardStarts(gridHtml);
  for (let i = 0; i < starts.length; i += 1) {
    const start = starts[i];
    const end = starts[i + 1] ?? gridHtml.length;
    if (end === -1) break;
    const card = gridHtml.slice(start, end);
    const slug = getCardSlug(card, isArabic);
    if (slug && !cards.has(slug)) cards.set(slug, card);
  }
  return cards;
}

function replaceWorkCards(html, cardsHtml) {
  const bounds = getWorkGridBounds(html);
  if (!bounds) return html;
  return html.slice(0, bounds.start) + cardsHtml + html.slice(bounds.end);
}

function dedupeWorkGrid(html, isArabic) {
  const bounds = getWorkGridBounds(html);
  if (!bounds) return html;
  const gridHtml = html.slice(bounds.start, bounds.end);
  const starts = findCardStarts(gridHtml);
  const cards = [];
  const seen = new Set();
  const prefixPattern = isArabic ? "\\/ar\\/work\\/" : "\\/work\\/";
  for (let i = 0; i < starts.length; i += 1) {
    const start = starts[i];
    const end = starts[i + 1] ?? gridHtml.length;
    const card = gridHtml.slice(start, end);
    const match = card.match(new RegExp(`href="${prefixPattern}([^"/]+)\\/?`));
    const slug = match ? match[1] : null;
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    cards.push(card);
  }
  return html.slice(0, bounds.start) + cards.join("") + html.slice(bounds.end);
}

function updateWorkIndex(relativePath, importedBySlug, isArabic) {
  let html = read(relativePath);
  const currentCards = extractCards(html, isArabic);
  const importedCards = new Map(projects.map((project) => [
    project.slug,
    buildCard(project, importedBySlug.get(project.slug), isArabic)
  ]));
  const rendered = [];
  const used = new Set();
  for (const slug of existingWorkOrder) {
    const card = importedCards.get(slug) || currentCards.get(slug);
    if (card && !used.has(slug)) {
      rendered.push(card);
      used.add(slug);
    }
  }
  for (const slug of appendedWorkOrder) {
    const card = importedCards.get(slug) || currentCards.get(slug);
    if (card && !used.has(slug)) {
      rendered.push(card);
      used.add(slug);
    }
  }
  for (const [slug, card] of currentCards.entries()) {
    if (!used.has(slug)) {
      rendered.push(importedCards.get(slug) || card);
      used.add(slug);
    }
  }
  const renderedUnique = [];
  const renderedSlugs = new Set();
  for (const card of rendered) {
    const slug = getCardSlug(card, isArabic);
    if (!slug || renderedSlugs.has(slug)) continue;
    renderedSlugs.add(slug);
    renderedUnique.push(card);
  }
  const cards = renderedUnique.join("");
  html = replaceWorkCards(html, cards);
  html = dedupeWorkGrid(html, isArabic);
  html = updateFilterCounts(html);
  write(relativePath, html);
}

const importedBySlug = new Map();
for (const project of projects) {
  const imported = importImages(project);
  importedBySlug.set(project.slug, imported);
  write(`work/${project.slug}/index.html`, renderPage(project, imported, false));
  write(`ar/work/${project.slug}/index.html`, renderPage(project, imported, true));
}

updateWorkIndex("work/index.html", importedBySlug, false);
updateWorkIndex("ar/work/index.html", importedBySlug, true);

console.log(`Imported ${projects.length} workspace projects.`);
