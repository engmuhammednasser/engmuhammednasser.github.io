import {
  cpSync,
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import { dirname, join, resolve, sep } from "node:path";

const root = resolve(process.cwd());

function pathInRoot(relativePath) {
  const target = resolve(root, relativePath);
  if (target !== root && !target.startsWith(`${root}${sep}`)) {
    throw new Error(`Path escapes workspace: ${relativePath}`);
  }
  return target;
}

function read(relativePath) {
  return readFileSync(pathInRoot(relativePath), "utf8");
}

function write(relativePath, value) {
  const target = pathInRoot(relativePath);
  writeFileSync(target, value, "utf8");
  console.log(`Updated ${relativePath}`);
}

function cloneRoute(source, destination) {
  const sourcePath = pathInRoot(source);
  const destinationPath = pathInRoot(destination);
  if (existsSync(destinationPath)) {
    rmSync(destinationPath, { recursive: true, force: true });
  }
  cpSync(sourcePath, destinationPath, { recursive: true });

  function rewriteDirectory(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const target = join(directory, entry.name);
      if (entry.isDirectory()) {
        rewriteDirectory(target);
      } else if (entry.isFile() && /\.(?:html|txt)$/.test(entry.name)) {
        const updated = readFileSync(target, "utf8")
          .replaceAll("ashhalancarrental", "oryxbag")
          .replaceAll("Ashhalan Car Rental Platform", "OryxBag E-Commerce Store")
          .replaceAll("منصة أشهلان لتأجير السيارات", "متجر OryxBag الإلكتروني");
        writeFileSync(target, updated, "utf8");
      }
    }
  }

  rewriteDirectory(destinationPath);
}

const sharedSource = read("scripts/upgrade-ashhalan-car-rental.mjs");
const cssMatch = sharedSource.match(/const caseStudyCss = `([\s\S]*?)`;/);
if (!cssMatch) {
  throw new Error("Could not load the shared case-study CSS.");
}
const caseStudyCss = cssMatch[1];

const screenshotFiles = [
  ["home-en.jpg", "Home Page — English", "الصفحة الرئيسية — الإنجليزية", true],
  ["home-ar.jpg", "Home Page — Arabic", "الصفحة الرئيسية — العربية", true],
  ["featured-products-en.jpg", "Featured Product Stories — English", "قصص المنتجات المميزة — الإنجليزية", false],
  ["shop-en.jpg", "Shop Page — English", "صفحة المتجر — الإنجليزية", true],
  ["shop-ar.jpg", "Shop Page — Arabic", "صفحة المتجر — العربية", true],
  ["filters-en.jpg", "Product Listing Filters — English", "فلاتر المنتجات — الإنجليزية", false],
  ["filters-ar.jpg", "Product Listing Filters — Arabic", "فلاتر المنتجات — العربية", false],
  ["single-product-en.jpg", "Single Product Page — English", "صفحة المنتج — الإنجليزية", true],
  ["single-product-ar.jpg", "Single Product Page — Arabic", "صفحة المنتج — العربية", true],
  ["cart-en.jpg", "Cart Page — English", "صفحة السلة — الإنجليزية", false],
  ["cart-ar.jpg", "Cart Page — Arabic", "صفحة السلة — العربية", false],
  ["checkout-en.jpg", "Checkout Page — English", "صفحة إتمام الطلب — الإنجليزية", true],
  ["checkout-ar.jpg", "Checkout Page — Arabic", "صفحة إتمام الطلب — العربية", true],
  ["rewards-en.jpg", "Rewards Page — English", "صفحة المكافآت — الإنجليزية", true],
  ["rewards-ar.jpg", "Rewards Page — Arabic", "صفحة المكافآت — العربية", true],
  ["corporate-orders-en.jpg", "Corporate Orders Page — English", "طلبات الشركات — الإنجليزية", true],
  ["corporate-orders-ar.jpg", "Corporate Orders Page — Arabic", "طلبات الشركات — العربية", true],
  ["contact-en.jpg", "Contact Page — English", "صفحة التواصل — الإنجليزية", true],
  ["contact-ar.jpg", "Contact Page — Arabic", "صفحة التواصل — العربية", true],
  ["delivery-returns-en.jpg", "Delivery & Return Policies — English", "سياسات التوصيل والإرجاع — الإنجليزية", true],
  ["delivery-returns-ar.jpg", "Delivery & Return Policies — Arabic", "سياسات التوصيل والإرجاع — العربية", true],
  ["account-login-en.jpg", "Account Login — English", "تسجيل الدخول — الإنجليزية", false],
  ["account-login-ar.jpg", "Account Login — Arabic", "تسجيل الدخول — العربية", false],
  ["about-ar.jpg", "About OryxBag — Arabic", "عن OryxBag — العربية", true]
];

const content = {
  en: {
    lang: "en",
    dir: "ltr",
    bodyClass:
      "inter_5901b7c6-module__ec5Qua__variable font-inter bg-[#05070D] text-[#F8FAFC] antialiased min-h-screen flex flex-col",
    title: "OryxBag E-Commerce Store",
    meta:
      "A bilingual WordPress and WooCommerce store for a UAE bags brand with custom product discovery, variations, wishlist, compare, rewards, corporate orders, and Arabic/English shopping journeys.",
    category: "Custom WooCommerce Store / Fashion & Accessories E-Commerce",
    hero:
      "OryxBag is a bilingual WordPress and WooCommerce store built for a UAE-based bags brand. The platform presents travel, business, everyday, and corporate-gifting bags through a clean storefront, product filters, color variations, detailed product pages, wishlist, compare, rewards, corporate-order requests, and Arabic and English shopping journeys.",
    liveLabel: "View Live Store",
    problemTitle: "The Problem",
    problem:
      "The client needed more than a basic product catalog. OryxBag required a polished e-commerce experience capable of presenting a lifestyle-focused bags brand, organizing products by use case, supporting color variations, making product details clear, improving purchase confidence, and serving both individual shoppers and corporate customers. The website also needed clear bilingual navigation, mobile-friendly layouts, visible offers, shipping and return information, and a simple route from discovery to purchase.",
    solutionTitle: "The Solution",
    solution:
      "A tailored WordPress and WooCommerce storefront was implemented for OryxBag. The experience combines brand storytelling, product discovery, shop filters, variation-based purchasing, custom product presentation, wishlist and compare actions, cart and checkout, rewards, corporate-order requests, and delivery and return content. Arabic RTL and English LTR interfaces keep the shopping journey clear across mobile and desktop.",
    deepDiveTitle: "Storefront Architecture & E-Commerce Experience",
    deepDiveIntro:
      "The store was structured around product discovery, purchase confidence, and repeat engagement rather than a generic WooCommerce layout.",
    sections: [
      {
        title: "Custom Storefront Experience",
        text:
          "The homepage introduces the OryxBag brand through product-led visual storytelling and clear paths into the catalog.",
        bullets: [
          "Top announcement bar, navigation, and promotional messaging",
          "Hero presentation for travel, business, and everyday bags",
          "Featured product and collection sections",
          "Brand storytelling, trust badges, newsletter, footer navigation, and social links"
        ]
      },
      {
        title: "Product Discovery & Shop Filters",
        text:
          "The shop experience helps customers narrow the catalog while keeping product cards action-oriented.",
        bullets: [
          "Product grid with AED pricing and color variations",
          "Price, color, and stock-status filters",
          "Sorting options and top-rated-products sidebar",
          "Wishlist, compare, select-options actions, and responsive sidebar behavior"
        ]
      },
      {
        title: "Custom Product Detail Page",
        text:
          "Product pages combine a large media gallery with variation selection, purchase actions, trust messaging, and detailed information.",
        bullets: [
          "Gallery, title, AED price, short description, color and quantity selectors",
          "Add to Cart, Buy Now, wishlist, compare, SKU, categories, tags, and share links",
          "Trust badges, free-shipping threshold, descriptions, features, specifications, delivery, returns, and related products",
          "O-Case example: compact 23.5 × 9 × 12.5 cm organizer in Black, Blue, Green, Grey, and Khaki"
        ]
      },
      {
        title: "Bilingual E-Commerce UX",
        text:
          "English LTR and Arabic RTL experiences were implemented with translated commerce content and direction-aware layout behavior.",
        bullets: [
          "Translated navigation, product content, buttons, and account journeys",
          "RTL/LTR spacing, alignment, and layout direction",
          "Consistent AED currency presentation",
          "Mobile-friendly shopping flows in both languages"
        ]
      },
      {
        title: "Rewards & Retention",
        text:
          "Oryx Rewards gives the store a retention layer beyond the first purchase.",
        bullets: [
          "Give 10% / Get 10% referral program",
          "Invite-friends journey and shareable referral links",
          "10% discount for a friend’s first purchase",
          "10% next-order reward for the referring customer"
        ]
      },
      {
        title: "Corporate Orders",
        text:
          "A dedicated business-order path supports corporate gifting and bulk enquiries.",
        bullets: [
          "Dedicated corporate-orders page",
          "Name, email, phone, company, and message fields",
          "Clear sales-team follow-up message",
          "Suitable for branded gifts, employee gifts, and bulk bag orders"
        ]
      },
      {
        title: "Delivery, Returns & Trust",
        text:
          "Shipping and support information is surfaced across the store to reduce uncertainty before checkout.",
        bullets: [
          "Same-day handling in Dubai subject to terms",
          "UAE, Gulf, and global shipping zones",
          "Office or warehouse pickup",
          "Free returns within seven days and visible customer-service details"
        ]
      },
      {
        title: "Theme & WooCommerce Customization",
        text:
          "The storefront presentation and WooCommerce templates were tailored to the brand without claiming custom plugin logic that is not evidenced in the project.",
        bullets: [
          "Custom storefront and reusable presentation components",
          "Product-card, single-product, variation, cart, and checkout styling",
          "Responsive implementation and RTL/LTR support",
          "WooCommerce template customization with maintainable front-end behavior"
        ]
      }
    ],
    featuresTitle: "Key Features",
    features: [
      "Custom WordPress and WooCommerce e-commerce store",
      "Bilingual Arabic RTL and English LTR experience",
      "Lifestyle-focused homepage and collection storytelling",
      "Price, color, and stock product filters",
      "Variable products with color options",
      "Wishlist and compare actions",
      "Custom product detail layout and image gallery",
      "Product specifications, features, delivery, and return sections",
      "Add to cart, buy now, cart, and checkout journey",
      "Oryx Rewards referral program",
      "Corporate-orders request form",
      "Delivery and return policy pages",
      "UAE contact and customer-service details",
      "Mobile-responsive storefront",
      "Trust badges and promotional messaging",
      "SEO-friendly product and page structure",
      "Social media integration"
    ],
    rolesTitle: "My Role",
    roles: [
      "Lead WordPress Developer",
      "WooCommerce Developer",
      "Custom Theme Developer",
      "Frontend Developer",
      "Bilingual UX Implementation",
      "E-Commerce UX Developer"
    ],
    stackTitle: "Tech Stack",
    stack: [
      "WordPress",
      "WooCommerce",
      "PHP",
      "Custom Theme Development",
      "HTML5",
      "CSS3",
      "JavaScript",
      "Responsive UI",
      "RTL / LTR",
      "WooCommerce Templates",
      "Product Variations",
      "Wishlist / Compare Integration",
      "Cart / Checkout Flow",
      "Contact Forms",
      "SEO-friendly Structure"
    ],
    screenshotTitle: "Project Screenshots",
    fullPage: "Full page",
    hover: "Hover to scroll preview",
    tap: "Tap to view",
    ctaTitle: "Need a bilingual WooCommerce store?",
    ctaText:
      "I can help shape product discovery, variations, content, and checkout into a focused shopping experience for Arabic and English customers.",
    ctaButton: "Start a Similar Project"
  },
  ar: {
    lang: "ar",
    dir: "rtl",
    bodyClass:
      "cairo_eb32b749-module__msiTQW__variable font-cairo bg-[#05070D] text-[#F8FAFC] antialiased min-h-screen flex flex-col",
    title: "متجر OryxBag الإلكتروني",
    meta:
      "متجر WordPress وWooCommerce ثنائي اللغة لعلامة حقائب إماراتية، يشمل فلاتر المنتجات والخيارات اللونية والمفضلة والمقارنة والمكافآت وطلبات الشركات.",
    category: "متجر WooCommerce مخصص / أزياء وإكسسوارات",
    hero:
      "OryxBag متجر WordPress وWooCommerce ثنائي اللغة لعلامة حقائب مقرها الإمارات. يعرض حقائب السفر والعمل والاستخدام اليومي وهدايا الشركات من خلال واجهة تسوق واضحة، وفلاتر للمنتجات، وخيارات ألوان، وصفحات منتجات تفصيلية، ومفضلة ومقارنة، ومكافآت، وطلبات شركات، ورحلة شراء بالعربية والإنجليزية.",
    liveLabel: "زيارة المتجر",
    problemTitle: "المشكلة",
    problem:
      "كان المطلوب أكثر من كتالوج منتجات بسيط. احتاج OryxBag إلى تجربة تجارة إلكترونية مصقولة تعرض علامة حقائب مرتبطة بنمط الحياة، وتنظم المنتجات حسب الاستخدام، وتدعم اختلاف الألوان، وتوضح تفاصيل المنتج، وتزيد الثقة قبل الشراء، وتخدم الأفراد وعملاء الشركات. كما احتاج الموقع إلى تنقل واضح بالعربية والإنجليزية، وتصميم متجاوب، وعروض ظاهرة، ومعلومات شحن وإرجاع سهلة الوصول، ومسار بسيط من اكتشاف المنتج إلى إتمام الطلب.",
    solutionTitle: "الحل",
    solution:
      "تم تنفيذ متجر WordPress وWooCommerce مخصص لعلامة OryxBag، يجمع بين سرد العلامة، واكتشاف المنتجات، وفلاتر المتجر، والشراء حسب الخيارات، وعرض المنتجات، والمفضلة والمقارنة، والسلة والدفع، وبرنامج المكافآت، وطلبات الشركات، وسياسات التوصيل والإرجاع. تحافظ واجهتا العربية RTL والإنجليزية LTR على رحلة تسوق واضحة في الموبايل وسطح المكتب.",
    deepDiveTitle: "بنية المتجر وتجربة التجارة الإلكترونية",
    deepDiveIntro:
      "تم تنظيم المتجر حول اكتشاف المنتجات والثقة قبل الشراء وتشجيع العودة، بدلًا من الاعتماد على تخطيط WooCommerce عام.",
    sections: [
      {
        title: "واجهة متجر مخصصة",
        text:
          "تقدم الصفحة الرئيسية العلامة بصريًا وتوجه المستخدم إلى مجموعات المنتجات بوضوح.",
        bullets: [
          "شريط إعلانات علوي وتنقل ورسائل ترويجية",
          "عرض حقائب السفر والعمل والاستخدام اليومي",
          "أقسام منتجات ومجموعات مميزة",
          "قصة العلامة وشارات الثقة والنشرة البريدية وروابط الفوتر والتواصل"
        ]
      },
      {
        title: "اكتشاف المنتجات وفلاتر المتجر",
        text:
          "تساعد تجربة المتجر المستخدم على تضييق النتائج مع إبقاء إجراءات المنتج واضحة.",
        bullets: [
          "شبكة منتجات بأسعار الدرهم وخيارات الألوان",
          "فلترة حسب السعر واللون وحالة المخزون",
          "خيارات ترتيب وقائمة أعلى المنتجات تقييمًا",
          "المفضلة والمقارنة واختيار الخيارات وSidebar متجاوب"
        ]
      },
      {
        title: "صفحة منتج مخصصة",
        text:
          "تجمع صفحات المنتجات بين معرض صور كبير وخيارات المنتج وإجراءات الشراء ورسائل الثقة والمعلومات التفصيلية.",
        bullets: [
          "المعرض والعنوان والسعر والوصف واختيار اللون والكمية",
          "الإضافة للسلة والشراء الآن والمفضلة والمقارنة وSKU والتصنيفات والمشاركة",
          "شارات الثقة وحد الشحن المجاني والوصف والمواصفات والتوصيل والإرجاع والمنتجات المرتبطة",
          "مثال O-Case: منظم مدمج 23.5 × 9 × 12.5 سم بألوان الأسود والأزرق والأخضر والرمادي والكاكي"
        ]
      },
      {
        title: "تجربة تجارة إلكترونية ثنائية اللغة",
        text:
          "تم تنفيذ واجهتي الإنجليزية LTR والعربية RTL بمحتوى تجارة إلكترونية مترجم وتخطيط يراعي اتجاه اللغة.",
        bullets: [
          "ترجمة التنقل ومحتوى المنتجات والأزرار والحساب",
          "مسافات ومحاذاة واتجاه تخطيط مناسب لكل لغة",
          "عرض متسق للأسعار بالدرهم الإماراتي",
          "رحلة شراء متجاوبة بالعربية والإنجليزية"
        ]
      },
      {
        title: "المكافآت والاحتفاظ بالعملاء",
        text:
          "يضيف Oryx Rewards طبقة تشجع المشاركة والعودة بعد الطلب الأول.",
        bullets: [
          "برنامج أعطِ 10% واحصل على 10%",
          "دعوة الأصدقاء ومشاركة رابط الإحالة",
          "خصم 10% لأول طلب للصديق",
          "مكافأة 10% على الطلب التالي للعميل المُحيل"
        ]
      },
      {
        title: "طلبات الشركات",
        text:
          "يوفر مسار مخصص للشركات إمكانية إرسال طلبات الهدايا والكميات.",
        bullets: [
          "صفحة مستقلة لطلبات الشركات",
          "حقول الاسم والبريد والهاتف والشركة والرسالة",
          "رسالة واضحة لمتابعة فريق المبيعات",
          "مناسبة للهدايا المؤسسية وهدايا الموظفين والطلبات الكبيرة"
        ]
      },
      {
        title: "التوصيل والإرجاع والثقة",
        text:
          "تظهر معلومات الشحن والدعم بوضوح لتقليل تردد المستخدم قبل الدفع.",
        bullets: [
          "تجهيز في نفس اليوم داخل دبي وفق الشروط",
          "شحن داخل الإمارات والخليج ودولي",
          "الاستلام من المكتب أو المستودع",
          "إرجاع مجاني خلال سبعة أيام ومعلومات خدمة عملاء واضحة"
        ]
      },
      {
        title: "تخصيص القالب وWooCommerce",
        text:
          "تم تخصيص عرض المتجر وقوالب WooCommerce بما يناسب العلامة دون ادعاء وجود منطق إضافة مخصصة غير موثق.",
        bullets: [
          "واجهة متجر ومكونات عرض قابلة لإعادة الاستخدام",
          "تخصيص بطاقات المنتجات وصفحة المنتج والخيارات والسلة والدفع",
          "تنفيذ متجاوب ودعم RTL وLTR",
          "تخصيص قوالب WooCommerce مع سلوك Frontend قابل للصيانة"
        ]
      }
    ],
    featuresTitle: "أهم المميزات",
    features: [
      "متجر WordPress وWooCommerce مخصص",
      "تجربة عربية RTL وإنجليزية LTR",
      "صفحة رئيسية تركّز على أسلوب الحياة والمجموعات",
      "فلاتر السعر واللون والمخزون",
      "منتجات متغيرة بخيارات ألوان",
      "المفضلة والمقارنة",
      "صفحة منتج مخصصة ومعرض صور",
      "مواصفات ومميزات وتوصيل وإرجاع داخل صفحة المنتج",
      "السلة والشراء الآن ومسار الدفع",
      "برنامج إحالة Oryx Rewards",
      "نموذج طلبات الشركات",
      "صفحات سياسات التوصيل والإرجاع",
      "بيانات تواصل وخدمة عملاء داخل الإمارات",
      "متجر متجاوب مع الموبايل",
      "شارات ثقة ورسائل ترويجية",
      "هيكل منتجات وصفحات مناسب لمحركات البحث",
      "تكامل وسائل التواصل الاجتماعي"
    ],
    rolesTitle: "دوري في المشروع",
    roles: [
      "مطور WordPress رئيسي",
      "مطور WooCommerce",
      "مطور قالب مخصص",
      "مطور واجهات أمامية",
      "تنفيذ تجربة ثنائية اللغة",
      "مطور تجربة التجارة الإلكترونية"
    ],
    stackTitle: "التقنيات المستخدمة",
    stack: [
      "WordPress",
      "WooCommerce",
      "PHP",
      "Custom Theme Development",
      "HTML5",
      "CSS3",
      "JavaScript",
      "Responsive UI",
      "RTL / LTR",
      "WooCommerce Templates",
      "Product Variations",
      "Wishlist / Compare Integration",
      "Cart / Checkout Flow",
      "Contact Forms",
      "SEO-friendly Structure"
    ],
    screenshotTitle: "صور المشروع",
    fullPage: "صفحة كاملة",
    hover: "مرّر لعرض الصورة كاملة",
    tap: "اضغط للعرض",
    ctaTitle: "تحتاج إلى متجر WooCommerce ثنائي اللغة؟",
    ctaText:
      "يمكنني مساعدتك في تنظيم اكتشاف المنتجات والخيارات والمحتوى والدفع داخل تجربة تسوق واضحة للعملاء بالعربية والإنجليزية.",
    ctaButton: "ابدأ مشروعًا مشابهًا"
  }
};

function element(type, props = {}, children = undefined, key = null) {
  const finalProps = { ...props };
  if (children !== undefined) finalProps.children = children;
  return ["$", type, key, finalProps];
}

function bulletList(items, columns = false) {
  return element(
    "ul",
    {
      className: columns
        ? "case-feature-list text-[#94A3B8]"
        : "case-bullet-list text-[#94A3B8]"
    },
    items.map((item, index) =>
      element(
        "li",
        { className: "case-bullet-item" },
        [
          element("span", {
            className: "case-bullet-dot rounded-full bg-[#38BDF8]"
          }),
          element("span", { className: "case-bullet-text" }, item)
        ],
        String(index)
      )
    )
  );
}

function screenshots() {
  return screenshotFiles.map(([file, enTitle, arTitle, isFullPage]) => ({
    src: `/projects/oryxbag/${file}`,
    alt: {
      en: `OryxBag E-Commerce Store — ${enTitle}`,
      ar: `متجر OryxBag الإلكتروني — ${arTitle}`
    },
    title: { en: enTitle, ar: arTitle },
    isFullPage
  }));
}

function buildPageTree(lang, galleryRef) {
  const copy = content[lang];
  const heroImage = lang === "ar" ? "home-ar.jpg" : "home-en.jpg";
  const technicalCards = copy.sections.map((section, index) =>
    element(
      "article",
      {
        className:
          "case-tech-card bg-[#111827] border border-white/5 rounded-2xl hover:border-[#38BDF8]/25 transition-colors"
      },
      [
        element(
          "div",
          {
            className:
              "case-card-number w-10 h-10 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center font-extrabold"
          },
          String(index + 1).padStart(2, "0")
        ),
        element("h3", { className: "case-card-title font-bold text-white" }, section.title),
        element("p", { className: "case-card-copy text-[#94A3B8]" }, section.text),
        bulletList(section.bullets)
      ],
      String(index)
    )
  );

  const aside = element(
    "aside",
    {
      className:
        "case-sidebar bg-[#111827] rounded-2xl border border-white/5 h-fit shadow-lg sticky top-24"
    },
    [
      element("div", {}, [
        element(
          "h3",
          {
            className:
              "case-sidebar-heading font-bold uppercase tracking-widest text-[#94A3B8]"
          },
          copy.rolesTitle
        ),
        element(
          "ul",
          { className: "case-role-list" },
          copy.roles.map((role, index) =>
            element(
              "li",
              { className: "case-role-item font-semibold text-[#F8FAFC]" },
              role,
              String(index)
            )
          )
        )
      ]),
      element("div", {}, [
        element(
          "h3",
          {
            className:
              "case-sidebar-heading font-bold uppercase tracking-widest text-[#94A3B8]"
          },
          copy.stackTitle
        ),
        element(
          "div",
          { className: "case-stack flex flex-wrap" },
          copy.stack.map((item, index) =>
            element(
              "span",
              {
                className:
                  "case-stack-item px-3 py-2 bg-[#1E293B] text-xs font-semibold rounded-md border border-white/5 text-[#94A3B8]"
              },
              item,
              String(index)
            )
          )
        )
      ]),
      element(
        "div",
        { className: "case-sidebar-cta border-t border-white/5" },
        element(
          "a",
          {
            href: lang === "ar" ? "/ar/contact/" : "/contact/",
            className:
              "case-primary-button block w-full text-center bg-[#38BDF8] text-[#0B1020] font-bold text-base rounded-lg hover:bg-[#38BDF8]/90 transition-all"
          },
          copy.ctaButton
        )
      )
    ]
  );

  return element(
    "div",
    { className: "case-study-page" },
    [
      element("style", { dangerouslySetInnerHTML: { __html: caseStudyCss } }),
      element("header", { className: "case-hero" }, [
        element(
          "div",
          {
            className:
              "case-kicker inline-block rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-sm font-bold text-[#38BDF8] uppercase tracking-widest text-center"
          },
          copy.category
        ),
        element("h1", { className: "case-title font-extrabold" }, copy.title),
        element("p", { className: "case-lead text-[#94A3B8]" }, copy.hero),
        element(
          "div",
          { className: "case-hero-action flex items-center justify-center" },
          element(
            "a",
            {
              href: "https://oryxbag.com/",
              target: "_blank",
              rel: "noopener noreferrer",
              className:
                "case-primary-button inline-flex bg-[#22C55E] text-white font-bold text-lg rounded-lg hover:bg-[#22C55E]/90 transition-all"
            },
            copy.liveLabel
          )
        )
      ]),
      element(
        "div",
        {
          className:
            "case-hero-media relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#111827]"
        },
        element("img", {
          src: `/projects/oryxbag/${heroImage}`,
          alt: copy.title,
          className: "w-full h-full object-cover object-top",
          loading: "eager"
        })
      ),
      element("div", { className: "case-overview-grid" }, [
        element("div", { className: "case-main-content" }, [
          element(
            "section",
            { className: "case-copy-panel bg-[#111827]/60 border border-white/5 rounded-2xl" },
            [
              element("h2", { className: "case-section-title font-bold" }, copy.problemTitle),
              element("p", { className: "case-body-copy text-[#94A3B8]" }, copy.problem)
            ]
          ),
          element(
            "section",
            { className: "case-copy-panel bg-[#111827]/60 border border-white/5 rounded-2xl" },
            [
              element("h2", { className: "case-section-title font-bold" }, copy.solutionTitle),
              element("p", { className: "case-body-copy text-[#94A3B8]" }, copy.solution)
            ]
          ),
          element("section", { className: "case-deep-dive" }, [
            element("div", {}, [
              element("h2", { className: "case-section-title font-bold" }, copy.deepDiveTitle),
              element("p", { className: "case-section-intro text-[#94A3B8]" }, copy.deepDiveIntro)
            ]),
            element("div", { className: "case-tech-grid" }, technicalCards)
          ]),
          element("section", { className: "case-features" }, [
            element("h2", { className: "case-section-title font-bold" }, copy.featuresTitle),
            bulletList(copy.features, true)
          ])
        ]),
        aside
      ]),
      element("section", { className: "case-screenshots" }, [
        element("h2", { className: "case-section-title font-bold" }, copy.screenshotTitle),
        element(galleryRef, { lang, screenshots: screenshots() })
      ]),
      element(
        "section",
        {
          className:
            "case-cta text-center bg-[#111827] border border-[#38BDF8]/20 rounded-2xl"
        },
        [
          element("h2", { className: "case-cta-title font-bold" }, copy.ctaTitle),
          element("p", { className: "case-cta-copy text-[#94A3B8]" }, copy.ctaText),
          element(
            "a",
            {
              href: lang === "ar" ? "/ar/contact/" : "/contact/",
              className:
                "case-primary-button inline-flex rounded-xl bg-[#38BDF8] text-[#0B1020] font-bold text-lg"
            },
            copy.ctaButton
          )
        ]
      )
    ]
  );
}

function updateLine(value, id, nextValue) {
  const expression = new RegExp(`^${id}:.*$`, "m");
  if (!expression.test(value)) throw new Error(`Missing RSC line ${id}`);
  return value.replace(expression, `${id}:${JSON.stringify(nextValue)}`);
}

function updateFullPayload(relativePath, lang) {
  let value = read(relativePath);
  value = updateLine(value, "5", buildPageTree(lang, "$L18"));
  const copy = content[lang];
  const metadata = [
    ["$", "title", "0", { children: copy.title }],
    ["$", "meta", "1", { name: "description", content: copy.meta }],
    ["$", "link", "2", { rel: "shortcut icon", href: "/favicon.png" }],
    ["$", "link", "3", { rel: "icon", href: "/favicon.ico?favicon.2vob68tjqpejf.ico", sizes: "256x256", type: "image/x-icon" }],
    ["$", "link", "4", { rel: "icon", href: "/favicon.png" }],
    ["$", "link", "5", { rel: "apple-touch-icon", href: "/favicon.png" }],
    ["$", "$L19", "6", {}]
  ];
  value = updateLine(value, "d", metadata);
  write(relativePath, value);
}

function updatePagePayload(relativePath, lang) {
  const lines = read(relativePath).split(/\r?\n/);
  const index = lines.findIndex((line) => line.startsWith("0:"));
  const payload = JSON.parse(lines[index].slice(2));
  payload.rsc[3].children[0] = buildPageTree(lang, "$L9");
  lines[index] = `0:${JSON.stringify(payload)}`;
  write(relativePath, `${lines.join("\n").replace(/\n+$/, "")}\n`);
}

function updateHeadPayload(relativePath, lang) {
  const lines = read(relativePath).split(/\r?\n/);
  const index = lines.findIndex((line) => line.startsWith("0:"));
  const payload = JSON.parse(lines[index].slice(2));
  const copy = content[lang];
  function walk(node) {
    if (Array.isArray(node)) {
      if (node[0] === "$" && node[1] === "title" && node[3]) node[3].children = copy.title;
      if (node[0] === "$" && node[1] === "meta" && node[3]?.name === "description") {
        node[3].content = copy.meta;
      }
      node.forEach(walk);
    } else if (node && typeof node === "object") {
      Object.values(node).forEach(walk);
    }
  }
  walk(payload);
  lines[index] = `0:${JSON.stringify(payload)}`;
  write(relativePath, `${lines.join("\n").replace(/\n+$/, "")}\n`);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderBullets(items, columns = false) {
  return `<ul class="${columns ? "case-feature-list" : "case-bullet-list"} text-[#94A3B8]">${items
    .map(
      (item) =>
        `<li class="case-bullet-item"><span class="case-bullet-dot rounded-full bg-[#38BDF8]"></span><span class="case-bullet-text">${escapeHtml(item)}</span></li>`
    )
    .join("")}</ul>`;
}

function renderGallery(lang) {
  const copy = content[lang];
  return `<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">${screenshotFiles
    .map(([file, enTitle, arTitle, isFullPage]) => {
      const title = lang === "ar" ? arTitle : enTitle;
      return `<article class="case-shot-card flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#111827] shadow-lg"><button type="button" class="case-shot relative block w-full text-left rtl:text-right outline-none cursor-zoom-in" style="height:420px;overflow:hidden;flex-shrink:0" data-src="/projects/oryxbag/${file}" data-title="${escapeHtml(title)}"><img src="/projects/oryxbag/${file}" alt="${escapeHtml(title)}" loading="lazy" style="width:100%;height:auto;display:block;transform:translateY(0);transition:transform 1.5s ease-in-out;will-change:transform"><div aria-hidden="true" style="position:absolute;bottom:0;left:0;right:0;height:90px;background:linear-gradient(to top,rgba(17,24,39,.96),transparent);pointer-events:none"></div>${isFullPage ? `<span class="absolute top-3 right-3 px-2.5 py-1.5 bg-black/60 border border-white/15 text-white/70 text-xs font-semibold rounded-lg">${copy.fullPage}</span>` : ""}<span class="absolute bottom-3 left-1/2 px-3 py-1.5 bg-black/70 border border-white/10 rounded-full text-white/70 text-xs font-medium" style="transform:translateX(-50%);white-space:nowrap"><span class="hidden md:inline">${copy.hover}</span><span class="md:hidden">${copy.tap}</span></span></button><div><p class="case-shot-title text-white font-semibold text-base">${escapeHtml(title)}</p></div></article>`;
    })
    .join("")}</div>`;
}

function extractTag(html, tagName) {
  const start = html.indexOf(`<${tagName}`);
  const end = html.indexOf(`</${tagName}>`, start);
  return html.slice(start, end + tagName.length + 3);
}

function renderStaticPage(lang, sourceHtml) {
  const copy = content[lang];
  let header = extractTag(sourceHtml, "header");
  header = header
    .replaceAll("/ar/work/ashhalancarrental/", "/ar/work/oryxbag/")
    .replaceAll("/work/ashhalancarrental/", "/work/oryxbag/");
  const footer = extractTag(sourceHtml, "footer");
  const hero = lang === "ar" ? "home-ar.jpg" : "home-en.jpg";
  const cards = copy.sections
    .map(
      (section, index) =>
        `<article class="case-tech-card bg-[#111827] border border-white/5 rounded-2xl"><div class="case-card-number w-10 h-10 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center font-extrabold">${String(index + 1).padStart(2, "0")}</div><h3 class="case-card-title font-bold text-white">${escapeHtml(section.title)}</h3><p class="case-card-copy text-[#94A3B8]">${escapeHtml(section.text)}</p>${renderBullets(section.bullets)}</article>`
    )
    .join("");
  const roles = copy.roles
    .map((role) => `<li class="case-role-item font-semibold text-[#F8FAFC]">${escapeHtml(role)}</li>`)
    .join("");
  const stack = copy.stack
    .map((item) => `<span class="case-stack-item px-3 py-2 bg-[#1E293B] text-xs font-semibold rounded-md border border-white/5 text-[#94A3B8]">${escapeHtml(item)}</span>`)
    .join("");

  const main = `<main class="flex-1" style="max-width:100vw;overflow-x:hidden"><div class="case-study-page"><header class="case-hero"><div class="case-kicker inline-block rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-sm font-bold text-[#38BDF8] uppercase tracking-widest text-center">${escapeHtml(copy.category)}</div><h1 class="case-title font-extrabold">${escapeHtml(copy.title)}</h1><p class="case-lead text-[#94A3B8]">${escapeHtml(copy.hero)}</p><div class="case-hero-action"><a href="https://oryxbag.com/" target="_blank" rel="noopener noreferrer" class="case-primary-button inline-flex bg-[#22C55E] text-white font-bold text-lg rounded-lg">${escapeHtml(copy.liveLabel)}</a></div></header><div class="case-hero-media relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#111827]"><img src="/projects/oryxbag/${hero}" alt="${escapeHtml(copy.title)}" class="w-full h-full object-cover object-top"></div><div class="case-overview-grid"><div class="case-main-content"><section class="case-copy-panel bg-[#111827]/60 border border-white/5 rounded-2xl"><h2 class="case-section-title font-bold">${escapeHtml(copy.problemTitle)}</h2><p class="case-body-copy text-[#94A3B8]">${escapeHtml(copy.problem)}</p></section><section class="case-copy-panel bg-[#111827]/60 border border-white/5 rounded-2xl"><h2 class="case-section-title font-bold">${escapeHtml(copy.solutionTitle)}</h2><p class="case-body-copy text-[#94A3B8]">${escapeHtml(copy.solution)}</p></section><section class="case-deep-dive"><div><h2 class="case-section-title font-bold">${escapeHtml(copy.deepDiveTitle)}</h2><p class="case-section-intro text-[#94A3B8]">${escapeHtml(copy.deepDiveIntro)}</p></div><div class="case-tech-grid">${cards}</div></section><section class="case-features"><h2 class="case-section-title font-bold">${escapeHtml(copy.featuresTitle)}</h2>${renderBullets(copy.features, true)}</section></div><aside class="case-sidebar bg-[#111827] rounded-2xl border border-white/5 h-fit shadow-lg sticky top-24"><div><h3 class="case-sidebar-heading font-bold uppercase tracking-widest text-[#94A3B8]">${escapeHtml(copy.rolesTitle)}</h3><ul class="case-role-list">${roles}</ul></div><div><h3 class="case-sidebar-heading font-bold uppercase tracking-widest text-[#94A3B8]">${escapeHtml(copy.stackTitle)}</h3><div class="case-stack flex flex-wrap">${stack}</div></div><div class="case-sidebar-cta border-t border-white/5"><a href="${lang === "ar" ? "/ar/contact/" : "/contact/"}" class="case-primary-button block w-full text-center bg-[#38BDF8] text-[#0B1020] font-bold rounded-lg">${escapeHtml(copy.ctaButton)}</a></div></aside></div><section class="case-screenshots"><h2 class="case-section-title font-bold">${escapeHtml(copy.screenshotTitle)}</h2>${renderGallery(lang)}</section><section class="case-cta text-center bg-[#111827] border border-[#38BDF8]/20 rounded-2xl"><h2 class="case-cta-title font-bold">${escapeHtml(copy.ctaTitle)}</h2><p class="case-cta-copy text-[#94A3B8]">${escapeHtml(copy.ctaText)}</p><a href="${lang === "ar" ? "/ar/contact/" : "/contact/"}" class="case-primary-button inline-flex rounded-xl bg-[#38BDF8] text-[#0B1020] font-bold text-lg">${escapeHtml(copy.ctaButton)}</a></section></div></main>`;
  const modal = `<div id="case-modal" hidden style="position:fixed;inset:0;z-index:100;background:rgba(2,6,23,.94);padding:24px;overflow:auto"><button id="case-modal-close" type="button" aria-label="Close" style="position:fixed;top:18px;right:18px;z-index:101;width:44px;height:44px;border-radius:999px;background:#111827;color:white;border:1px solid rgba(255,255,255,.2);font-size:25px;cursor:pointer">×</button><img id="case-modal-image" alt="" style="display:block;max-width:1400px;width:100%;height:auto;margin:50px auto 20px;border-radius:16px"></div><script>(function(){document.querySelectorAll('.case-shot').forEach(function(button){var image=button.querySelector('img');button.addEventListener('mouseenter',function(){var d=Math.max(0,image.getBoundingClientRect().height-button.clientHeight);image.style.transitionDuration=Math.max(1.5,d/260)+'s';image.style.transform='translateY(-'+d+'px)'});button.addEventListener('mouseleave',function(){image.style.transitionDuration='1.2s';image.style.transform='translateY(0)'});button.addEventListener('click',function(){var modal=document.getElementById('case-modal'),target=document.getElementById('case-modal-image');target.src=button.dataset.src;target.alt=button.dataset.title;modal.hidden=false;document.body.style.overflow='hidden'})});function close(){document.getElementById('case-modal').hidden=true;document.body.style.overflow=''}document.getElementById('case-modal-close').addEventListener('click',close);document.getElementById('case-modal').addEventListener('click',function(e){if(e.target.id==='case-modal')close()});document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});var menuButton=document.querySelector('button[aria-label="Open menu"]'),menu=document.querySelector('[role="dialog"]');if(menuButton&&menu){var closeButton=menu.querySelector('button[aria-label="Close menu"]');menuButton.addEventListener('click',function(){menu.classList.remove('-translate-x-full','translate-x-full');menuButton.setAttribute('aria-expanded','true')});if(closeButton)closeButton.addEventListener('click',function(){menu.classList.add(document.documentElement.dir==='rtl'?'translate-x-full':'-translate-x-full');menuButton.setAttribute('aria-expanded','false')})}})();</script>`;
  return `<!DOCTYPE html><html lang="${copy.lang}" dir="${copy.dir}" class="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(copy.title)}</title><meta name="description" content="${escapeHtml(copy.meta)}"><link rel="stylesheet" href="/_next/static/chunks/3b8hwydtiy37e.css"><link rel="icon" href="/favicon.png"><style>${caseStudyCss}[hidden]{display:none!important}</style></head><body class="${copy.bodyClass}">${header}${main}${footer}${modal}</body></html>`;
}

function buildWorkCard(lang, refs) {
  const ar = lang === "ar";
  const title = ar ? "متجر OryxBag الإلكتروني" : "OryxBag E-Commerce Store";
  const description = ar
    ? "متجر WooCommerce ثنائي اللغة لعلامة حقائب إماراتية، يضم واجهة مخصصة وفلاتر وخيارات ألوان وصفحات منتجات ومفضلة ومقارنة ومكافآت وطلبات شركات."
    : "A bilingual WooCommerce store for a UAE bags brand, featuring custom storefront sections, product filters, color variations, product pages, wishlist, compare, rewards, and corporate orders.";
  return element(
    "div",
    {
      className:
        "group flex flex-col bg-[#111827] rounded-2xl overflow-hidden border border-white/5 hover:border-[#38BDF8]/30 transition-all hover:shadow-[0_10px_30px_rgba(56,189,248,0.05)] hover:-translate-y-1 relative"
    },
    [
      element(refs.link, {
        href: ar ? "/ar/work/oryxbag" : "/work/oryxbag",
        className: "absolute inset-0 z-0",
        "aria-label": `View ${title}`,
        children: "$undefined"
      }),
      element(
        "div",
        { className: "relative aspect-[4/3] w-full bg-[#0B1020] overflow-hidden pointer-events-none" },
        [
          element(refs.image, {
            src: "/projects/oryxbag/home-en.jpg",
            alt: title,
            fill: true,
            sizes: "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
            className:
              "object-cover object-top opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          }),
          element("div", {
            className:
              "absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80"
          })
        ]
      ),
      element(
        "div",
        { className: "p-8 flex-1 flex flex-col relative z-10 pointer-events-none" },
        [
          element(
            "div",
            { className: "text-xs font-bold text-[#38BDF8] mb-3 uppercase tracking-widest" },
            ar ? "WooCommerce / تجارة إلكترونية ثنائية اللغة" : "WooCommerce / Bilingual E-Commerce"
          ),
          element(
            "h3",
            { className: "text-2xl font-bold mb-3 leading-snug group-hover:text-[#38BDF8]" },
            title
          ),
          element("p", { className: "text-[#94A3B8] text-sm leading-relaxed line-clamp-2" }, description),
          element(
            "div",
            { className: "pointer-events-auto" },
            element(refs.actions, {
              href: "https://oryxbag.com/",
              labelAr: "زيارة الموقع",
              labelEn: "Live Site",
              locale: lang,
              archiveHref: ar ? "/ar/work/oryxbag" : "/work/oryxbag"
            })
          ),
          element(
            "div",
            { className: "mt-6 flex flex-wrap gap-2" },
            ["WooCommerce", "Bilingual UX", "Product Variations"].map((tag) =>
              element(
                "span",
                {
                  className:
                    "text-xs font-semibold px-3 py-1.5 bg-[#1E293B] border border-white/5 rounded-md text-[#94A3B8]"
                },
                tag,
                tag
              )
            )
          )
        ]
      )
    ],
    "oryxbag"
  );
}

function buildFeaturedCard(lang, refs) {
  const ar = lang === "ar";
  const title = ar ? "متجر OryxBag الإلكتروني" : "OryxBag E-Commerce Store";
  const description = ar
    ? "متجر WooCommerce ثنائي اللغة لعلامة حقائب إماراتية، يضم فلاتر وخيارات ألوان وصفحات منتجات ومفضلة ومقارنة ومكافآت وطلبات شركات."
    : "A bilingual WooCommerce store for a UAE bags brand, featuring product filters, color variations, product pages, wishlist, compare, rewards, corporate orders, and Arabic/English journeys.";
  return element(
    refs.link,
    {
      href: ar ? "/ar/work/oryxbag/" : "/work/oryxbag/",
      className:
        "group flex flex-col bg-[#111827] rounded-2xl overflow-hidden border border-white/5 hover:border-[#38BDF8]/30 transition-all hover:shadow-[0_10px_30px_rgba(56,189,248,0.05)] hover:-translate-y-1"
    },
    [
      element(
        "div",
        { className: "relative aspect-[4/3] w-full bg-[#0B1020] overflow-hidden" },
        [
          element(refs.image, {
            src: "/projects/oryxbag/home-en.jpg",
            alt: title,
            fill: true,
            sizes: "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
            className:
              "object-cover object-top opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          }),
          element("div", {
            className:
              "absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80"
          })
        ]
      ),
      element("div", { className: "p-8 flex-1 flex flex-col font-sans" }, [
        element(
          "div",
          { className: "text-xs font-bold text-[#38BDF8] mb-3 uppercase tracking-widest" },
          ar ? "WooCommerce / متجر ثنائي اللغة" : "WooCommerce / Bilingual E-Commerce"
        ),
        element("h3", { className: "text-xl font-bold mb-3 leading-snug" }, title),
        element("p", { className: "text-[#94A3B8] text-sm leading-relaxed flex-1 line-clamp-3" }, description),
        element(
          "div",
          { className: "mt-4 flex flex-wrap gap-1.5" },
          ["WooCommerce", "UAE", "Arabic / English"].map((tag, index) =>
            element(
              "span",
              {
                className:
                  "px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#1F2937]/50 text-[#94A3B8] border border-white/5"
              },
              tag,
              String(index)
            )
          )
        ),
        element(
          "div",
          { className: "mt-6 text-sm font-semibold text-white/70" },
          ar ? "قراءة دراسة الحالة" : "Read Case Study"
        )
      ])
    ],
    "oryxbag"
  );
}

function appendRefToArray(node, ref, minimumRefs) {
  let done = false;
  function walk(value) {
    if (done) return;
    if (Array.isArray(value)) {
      if (value.includes(ref)) {
        done = true;
        return;
      }
      const refs = value.filter((item) => typeof item === "string" && /^\$L/.test(item));
      if (refs.length >= minimumRefs && !value.includes(ref)) {
        value.push(ref);
        done = true;
        return;
      }
      value.forEach(walk);
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(walk);
    }
  }
  walk(node);
  if (!done) throw new Error(`Could not append ${ref}`);
}

function addRawLine(relativePath, rootLineId, newLineId, newNode, minimumRefs) {
  const lines = read(relativePath).split(/\r?\n/).filter(Boolean);
  const rootIndex = lines.findIndex((line) => line.startsWith(`${rootLineId}:`));
  const rootNode = JSON.parse(lines[rootIndex].slice(rootLineId.length + 1));
  appendRefToArray(rootNode, `$L${newLineId}`, minimumRefs);
  lines[rootIndex] = `${rootLineId}:${JSON.stringify(rootNode)}`;
  const existing = lines.findIndex((line) => line.startsWith(`${newLineId}:`));
  const newLine = `${newLineId}:${JSON.stringify(newNode)}`;
  if (existing === -1) lines.push(newLine);
  else lines[existing] = newLine;
  write(relativePath, `${lines.join("\n")}\n`);
}

function addPagePayloadLine(relativePath, newLineId, newNode, minimumRefs) {
  const lines = read(relativePath).split(/\r?\n/).filter(Boolean);
  const rootIndex = lines.findIndex((line) => line.startsWith("0:"));
  const payload = JSON.parse(lines[rootIndex].slice(2));
  appendRefToArray(payload, `$L${newLineId}`, minimumRefs);
  lines[rootIndex] = `0:${JSON.stringify(payload)}`;
  const existing = lines.findIndex((line) => line.startsWith(`${newLineId}:`));
  const newLine = `${newLineId}:${JSON.stringify(newNode)}`;
  if (existing === -1) lines.push(newLine);
  else lines[existing] = newLine;
  write(relativePath, `${lines.join("\n")}\n`);
}

function findBalanced(html, start, tagName) {
  const pattern = new RegExp(`<${tagName}(?:\\s|>)|<\\/${tagName}>`, "g");
  pattern.lastIndex = start;
  let depth = 0;
  let match;
  while ((match = pattern.exec(html))) {
    if (match[0].startsWith("</")) {
      depth -= 1;
      if (depth === 0) return [start, pattern.lastIndex];
    } else depth += 1;
  }
  throw new Error(`Unbalanced ${tagName}`);
}

function renderWorkCardHtml(lang) {
  const ar = lang === "ar";
  const title = ar ? "متجر OryxBag الإلكتروني" : "OryxBag E-Commerce Store";
  const description = ar
    ? "متجر WooCommerce ثنائي اللغة لعلامة حقائب إماراتية، يضم واجهة مخصصة وفلاتر وخيارات ألوان وصفحات منتجات ومفضلة ومقارنة ومكافآت وطلبات شركات."
    : "A bilingual WooCommerce store for a UAE bags brand, featuring custom storefront sections, product filters, color variations, product pages, wishlist, compare, rewards, and corporate orders.";
  return `<div class="group flex flex-col bg-[#111827] rounded-2xl overflow-hidden border border-white/5 hover:border-[#38BDF8]/30 transition-all hover:-translate-y-1 relative"><a href="${ar ? "/ar/work/oryxbag/" : "/work/oryxbag/"}" class="absolute inset-0 z-0" aria-label="View ${escapeHtml(title)}"></a><div class="relative aspect-[4/3] w-full bg-[#0B1020] overflow-hidden pointer-events-none"><img src="/projects/oryxbag/home-en.jpg" alt="${escapeHtml(title)}" class="object-cover object-top" style="position:absolute;height:100%;width:100%;inset:0;color:transparent"><div class="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80"></div></div><div class="p-8 flex-1 flex flex-col relative z-10 pointer-events-none"><div class="text-xs font-bold text-[#38BDF8] mb-3 uppercase tracking-widest">${ar ? "WooCommerce / تجارة إلكترونية ثنائية اللغة" : "WooCommerce / Bilingual E-Commerce"}</div><h3 class="text-2xl font-bold mb-3 leading-snug">${escapeHtml(title)}</h3><p class="text-[#94A3B8] text-sm leading-relaxed line-clamp-2">${escapeHtml(description)}</p><div class="pointer-events-auto flex items-center gap-3 mt-4"><a href="https://oryxbag.com/" target="_blank" rel="noopener noreferrer" class="text-sm font-semibold text-[#38BDF8]">${ar ? "زيارة الموقع" : "Live Site"}</a><a href="${ar ? "/ar/work/oryxbag/" : "/work/oryxbag/"}" class="text-sm font-semibold text-white/70">${ar ? "تصفح الأرشيف" : "Browse Archive"}</a></div><div class="mt-6 flex flex-wrap gap-2">${["WooCommerce", "Bilingual UX", "Product Variations"].map((tag) => `<span class="text-xs font-semibold px-3 py-1.5 bg-[#1E293B] border border-white/5 rounded-md text-[#94A3B8]">${tag}</span>`).join("")}</div></div></div>`;
}

function renderFeaturedCardHtml(lang) {
  const ar = lang === "ar";
  const title = ar ? "متجر OryxBag الإلكتروني" : "OryxBag E-Commerce Store";
  const description = ar
    ? "متجر WooCommerce ثنائي اللغة لعلامة حقائب إماراتية، يضم فلاتر وخيارات ألوان وصفحات منتجات ومفضلة ومقارنة ومكافآت وطلبات شركات."
    : "A bilingual WooCommerce store for a UAE bags brand, featuring product filters, color variations, product pages, wishlist, compare, rewards, corporate orders, and Arabic/English journeys.";
  return `<a class="group flex flex-col bg-[#111827] rounded-2xl overflow-hidden border border-white/5 hover:border-[#38BDF8]/30 transition-all hover:-translate-y-1" href="${ar ? "/ar/work/oryxbag/" : "/work/oryxbag/"}"><div class="relative aspect-[4/3] w-full bg-[#0B1020] overflow-hidden"><img src="/projects/oryxbag/home-en.jpg" alt="${escapeHtml(title)}" class="object-cover object-top" style="position:absolute;height:100%;width:100%;inset:0;color:transparent"><div class="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80"></div></div><div class="p-8 flex-1 flex flex-col font-sans"><div class="text-xs font-bold text-[#38BDF8] mb-3 uppercase tracking-widest">${ar ? "WooCommerce / متجر ثنائي اللغة" : "WooCommerce / Bilingual E-Commerce"}</div><h3 class="text-xl font-bold mb-3 leading-snug">${escapeHtml(title)}</h3><p class="text-[#94A3B8] text-sm leading-relaxed flex-1 line-clamp-3">${escapeHtml(description)}</p><div class="mt-4 flex flex-wrap gap-1.5"><span class="px-2 py-0.5 rounded-md text-[11px] bg-[#1F2937]/50 text-[#94A3B8]">WooCommerce</span><span class="px-2 py-0.5 rounded-md text-[11px] bg-[#1F2937]/50 text-[#94A3B8]">UAE</span><span class="px-2 py-0.5 rounded-md text-[11px] bg-[#1F2937]/50 text-[#94A3B8]">Arabic / English</span></div><div class="mt-6 text-sm font-semibold text-white/70">${ar ? "قراءة دراسة الحالة" : "Read Case Study"}</div></div></a>`;
}

function insertIntoStaticGrid(relativePath, marker, cardHtml) {
  let html = read(relativePath);
  if (html.includes('href="/work/oryxbag/"') || html.includes('href="/ar/work/oryxbag/"')) return;
  const markerIndex = html.indexOf(marker);
  const gridStart = html.indexOf('<div class="grid ', markerIndex);
  const [, gridEnd] = findBalanced(html, gridStart, "div");
  const closing = html.lastIndexOf("</div>", gridEnd);
  html = `${html.slice(0, closing)}${cardHtml}${html.slice(closing)}`;
  write(relativePath, html);
}

function replaceEmbeddedLine(html, id, rawLine) {
  const pattern = /<script>self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")\]\)<\/script>/g;
  let replaced = false;
  const result = html.replace(pattern, (full, encoded) => {
    let decoded;
    try { decoded = JSON.parse(encoded); } catch { return full; }
    if (!decoded.startsWith(`${id}:`)) return full;
    replaced = true;
    return `<script>self.__next_f.push([1,${JSON.stringify(`${rawLine}\n`)}])</script>`;
  });
  if (!replaced) throw new Error(`Missing embedded RSC line ${id}`);
  return result;
}

function syncEmbedded(relativePath, rawPath, ids, newLineId) {
  let html = read(relativePath);
  const rawLines = read(rawPath).split(/\r?\n/);
  for (const id of ids) {
    const raw = rawLines.find((line) => line.startsWith(`${id}:`));
    html = replaceEmbeddedLine(html, id, raw);
  }
  const newRaw = rawLines.find((line) => line.startsWith(`${newLineId}:`));
  if (!html.includes(`"${newLineId}:`)) {
    html = html.replace("</body>", `<script>self.__next_f.push([1,${JSON.stringify(`${newRaw}\n`)}])</script></body>`);
  }
  write(relativePath, html);
}

function findReferenceArray(node, refs) {
  let match = null;
  function walk(value) {
    if (match) return;
    if (Array.isArray(value)) {
      if (refs.every((ref) => value.includes(ref))) {
        match = value;
        return;
      }
      value.forEach(walk);
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(walk);
    }
  }
  walk(node);
  if (!match) throw new Error(`Could not find reference array containing ${refs.join(", ")}`);
  return match;
}

function reorderRawReferences(relativePath, rootLineId, movedRef, anchorRef, replaceAnchor = false) {
  const lines = read(relativePath).split(/\r?\n/).filter(Boolean);
  const rootIndex = lines.findIndex((line) => line.startsWith(`${rootLineId}:`));
  const rootNode = JSON.parse(lines[rootIndex].slice(rootLineId.length + 1));
  const serialized = JSON.stringify(rootNode);
  if (replaceAnchor && serialized.includes(`"${movedRef}"`) && !serialized.includes(`"${anchorRef}"`)) return;
  const refs = findReferenceArray(rootNode, [movedRef, anchorRef]);
  const movedIndex = refs.indexOf(movedRef);
  refs.splice(movedIndex, 1);
  const anchorIndex = refs.indexOf(anchorRef);
  if (replaceAnchor) refs.splice(anchorIndex, 1, movedRef);
  else refs.splice(anchorIndex + 1, 0, movedRef);
  lines[rootIndex] = `${rootLineId}:${JSON.stringify(rootNode)}`;
  write(relativePath, `${lines.join("\n")}\n`);
}

function findStaticCard(html, href, outerTag) {
  const hrefIndex = html.indexOf(`href="${href}"`);
  if (hrefIndex === -1) throw new Error(`Missing static card ${href}`);
  const start = html.lastIndexOf(`<${outerTag} class="group flex flex-col`, hrefIndex);
  if (start === -1) throw new Error(`Missing ${outerTag} wrapper for ${href}`);
  return findBalanced(html, start, outerTag);
}

function replaceStaticCard(relativePath, oldHref, newHref, outerTag = "a") {
  let html = read(relativePath);
  if (!html.includes(`href="${oldHref}"`) && html.includes(`href="${newHref}"`)) return;
  const [newStart, newEnd] = findStaticCard(html, newHref, outerTag);
  const newCard = html.slice(newStart, newEnd);
  html = `${html.slice(0, newStart)}${html.slice(newEnd)}`;
  const [oldStart, oldEnd] = findStaticCard(html, oldHref, outerTag);
  html = `${html.slice(0, oldStart)}${newCard}${html.slice(oldEnd)}`;
  write(relativePath, html);
}

function moveStaticCardAfter(relativePath, movedHref, anchorHref, outerTag = "div") {
  let html = read(relativePath);
  const [movedStart, movedEnd] = findStaticCard(html, movedHref, outerTag);
  const movedCard = html.slice(movedStart, movedEnd);
  html = `${html.slice(0, movedStart)}${html.slice(movedEnd)}`;
  const [, anchorEnd] = findStaticCard(html, anchorHref, outerTag);
  html = `${html.slice(0, anchorEnd)}${movedCard}${html.slice(anchorEnd)}`;
  write(relativePath, html);
}

cloneRoute("work/ashhalancarrental", "work/oryxbag");
cloneRoute("ar/work/ashhalancarrental", "ar/work/oryxbag");

for (const lang of ["en", "ar"]) {
  const base = lang === "ar" ? "ar/work/oryxbag" : "work/oryxbag";
  const page = lang === "ar"
    ? `${base}/__next.ar/work/$d$slug/__PAGE__.txt`
    : `${base}/__next.!KGVuKQ/work/$d$slug/__PAGE__.txt`;
  const sourceHtml = read(`${base}/index.html`);
  updateFullPayload(`${base}/index.txt`, lang);
  updateFullPayload(`${base}/__next._full.txt`, lang);
  updatePagePayload(page, lang);
  updateHeadPayload(`${base}/__next._head.txt`, lang);
  write(`${base}/index.html`, renderStaticPage(lang, sourceHtml));
}

addRawLine("work/index.txt", "5", "35", buildWorkCard("en", { link: "$L10", image: "$L13", actions: "$L14" }), 20);
addRawLine("work/__next._full.txt", "5", "35", buildWorkCard("en", { link: "$L10", image: "$L13", actions: "$L14" }), 20);
addPagePayloadLine("work/__next.!KGVuKQ/work/__PAGE__.txt", "29", buildWorkCard("en", { link: "$L2", image: "$L3", actions: "$L4" }), 20);
addRawLine("ar/work/index.txt", "5", "35", buildWorkCard("ar", { link: "$L10", image: "$L13", actions: "$L14" }), 20);
addRawLine("ar/work/__next._full.txt", "5", "35", buildWorkCard("ar", { link: "$L10", image: "$L13", actions: "$L14" }), 20);
addPagePayloadLine("ar/work/__next.ar/work/__PAGE__.txt", "29", buildWorkCard("ar", { link: "$L2", image: "$L3", actions: "$L4" }), 20);
insertIntoStaticGrid("work/index.html", "View All Projects", renderWorkCardHtml("en"));
insertIntoStaticGrid("ar/work/index.html", "تصفح كل الأعمال", renderWorkCardHtml("ar"));
syncEmbedded("work/index.html", "work/index.txt", ["5"], "35");
syncEmbedded("ar/work/index.html", "ar/work/index.txt", ["5"], "35");

function featuredSectionId(relativePath) {
  const line = read(relativePath).split(/\r?\n/).find((item) =>
    item.includes("Featured Case Studies") || item.includes("دراسات حالة مختارة")
  );
  return line.slice(0, line.indexOf(":"));
}

for (const [lang, prefix] of [["en", ""], ["ar", "ar/"]]) {
  const fullPaths = [`${prefix}index.txt`, `${prefix}__next._full.txt`];
  for (const path of fullPaths) {
    const sectionId = featuredSectionId(path);
    addRawLine(path, sectionId, "3a", buildFeaturedCard(lang, { link: "$L10", image: "$L26" }), 4);
  }
  const pagePath = lang === "ar" ? "ar/__next.ar/__PAGE__.txt" : "__next.!KGVuKQ/__PAGE__.txt";
  addPagePayloadLine(pagePath, "2d", buildFeaturedCard(lang, { link: "$L2", image: lang === "ar" ? "$L18" : "$L17" }), 4);
  insertIntoStaticGrid(`${prefix}index.html`, lang === "ar" ? "دراسات حالة مختارة" : "Featured Case Studies", renderFeaturedCardHtml(lang));
  const sectionId = featuredSectionId(`${prefix}index.txt`);
  syncEmbedded(`${prefix}index.html`, `${prefix}index.txt`, [sectionId], "3a");
}

for (const path of ["work/index.txt", "work/__next._full.txt", "ar/work/index.txt", "ar/work/__next._full.txt"]) {
  reorderRawReferences(path, "5", "$L35", "$L1b");
}
reorderRawReferences("work/__next.!KGVuKQ/work/__PAGE__.txt", "0", "$L29", "$Lb");
reorderRawReferences("ar/work/__next.ar/work/__PAGE__.txt", "0", "$L29", "$Lb");
moveStaticCardAfter("work/index.html", "/work/oryxbag/", "/work/nora24jewelry/", "div");
moveStaticCardAfter("ar/work/index.html", "/ar/work/oryxbag/", "/ar/work/nora24jewelry/", "div");
syncEmbedded("work/index.html", "work/index.txt", ["5"], "35");
syncEmbedded("ar/work/index.html", "ar/work/index.txt", ["5"], "35");

for (const path of ["index.txt", "__next._full.txt"]) {
  reorderRawReferences(path, featuredSectionId(path), "$L3a", "$L29", true);
}
for (const path of ["ar/index.txt", "ar/__next._full.txt"]) {
  reorderRawReferences(path, featuredSectionId(path), "$L3a", "$L29", true);
}
reorderRawReferences("__next.!KGVuKQ/__PAGE__.txt", "0", "$L2d", "$L1a", true);
reorderRawReferences("ar/__next.ar/__PAGE__.txt", "0", "$L2d", "$L1b", true);
replaceStaticCard("index.html", "/work/ashhalan/", "/work/oryxbag/");
replaceStaticCard("ar/index.html", "/ar/work/ashhalan/", "/ar/work/oryxbag/");
syncEmbedded("index.html", "index.txt", [featuredSectionId("index.txt")], "3a");
syncEmbedded("ar/index.html", "ar/index.txt", [featuredSectionId("ar/index.txt")], "3a");

console.log("OryxBag case study created.");
await import("./add-work-filters.mjs");
await import("./add-portfolio-effects.mjs");
