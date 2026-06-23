import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());

const screenshotFiles = [
  ["home-en.jpg", "Home Page — English", "الصفحة الرئيسية — الإنجليزية", true],
  ["booking-filter-en.jpg", "Booking Filter — English", "فلتر الحجز — الإنجليزية", false],
  ["cars-listing-en.jpg", "Cars Listing Page — English", "صفحة قائمة السيارات — الإنجليزية", true],
  ["single-car-en.jpg", "Single Car Page — English", "صفحة تفاصيل السيارة — الإنجليزية", true],
  ["finance-calculator-en.jpg", "Finance Calculator — English", "حاسبة التمويل — الإنجليزية", true],
  ["about-en.jpg", "About Page — English", "صفحة من نحن — الإنجليزية", true],
  ["contact-en.jpg", "Contact Page — English", "صفحة التواصل — الإنجليزية", true],
  ["home-ar.jpg", "Home Page — Arabic", "الصفحة الرئيسية — العربية", true],
  ["cars-listing-ar.jpg", "Cars Listing Page — Arabic", "صفحة قائمة السيارات — العربية", true],
  ["single-car-ar.jpg", "Single Car Page — Arabic", "صفحة تفاصيل السيارة — العربية", true],
  ["booking-completion-ar.jpg", "Booking Completion Page — Arabic", "صفحة إكمال الحجز — العربية", true],
  ["finance-calculator-ar.jpg", "Finance Calculator — Arabic", "حاسبة التمويل — العربية", true],
  ["about-ar.jpg", "About Page — Arabic", "صفحة من نحن — العربية", true],
  ["contact-ar.jpg", "Contact Page — Arabic", "صفحة التواصل — العربية", true]
];

const content = {
  en: {
    lang: "en",
    dir: "ltr",
    bodyClass:
      "inter_5901b7c6-module__ec5Qua__variable font-inter bg-[#05070D] text-[#F8FAFC] antialiased min-h-screen flex flex-col",
    title: "Ashhalan Car Rental Platform",
    meta:
      "A fully custom WordPress car rental and booking platform for Saudi Arabia with fleet browsing, pickup-based search, add-ons, booking completion, finance calculation, and bilingual Arabic/English UX.",
    category: "Custom Car Rental Platform / Booking System",
    hero:
      "A fully custom car rental platform built for the Saudi market. It combines fleet browsing, branch, airport, and train-station pickup filters, monthly rental plans, detailed vehicle pages, optional add-ons, a custom booking journey, a standalone finance calculator, and a bilingual Arabic/English experience.",
    liveLabel: "View Live Platform",
    problemTitle: "The Problem",
    problem:
      "The client needed more than a brochure website. They needed a complete rental platform capable of presenting a large vehicle fleet, organizing cars by type, specifications, and daily pricing, supporting multiple pickup scenarios, presenting monthly plans, and guiding users from vehicle selection through booking completion. The experience also had to remain fast, clear, mobile-friendly, bilingual, and localized for customers in Saudi Arabia.",
    solutionTitle: "The Solution",
    solution:
      "A fully custom WordPress platform was built with a theme designed and developed from scratch. Custom components handle vehicle data, fleet listings, pricing, optional add-ons, booking filters, single-car pages, booking summaries, booking completion, and finance calculations. The interface does not rely on a ready-made template; it was implemented around performance, usability, RTL/LTR support, and a clear booking journey.",
    deepDiveTitle: "Platform Architecture & Custom Experiences",
    deepDiveIntro:
      "The platform was structured around the real rental journey rather than a generic website template. Each major step was implemented as a dedicated interface and logic layer.",
    sections: [
      {
        title: "Custom Booking Experience",
        text:
          "The hero search experience adapts to the selected rental service and gathers the information needed before displaying suitable vehicles.",
        bullets: [
          "Daily rental, airport pickup, train-station pickup, and monthly plans",
          "Branch or pickup-location selection",
          "Pickup and return date selection",
          "A direct search flow into the available fleet"
        ]
      },
      {
        title: "Custom Car Detail Page",
        text:
          "Each vehicle has a purpose-built detail page that combines product-style presentation with the information needed to make a rental decision.",
        bullets: [
          "Vehicle image, rating, type, and daily price",
          "Passengers, transmission, fuel type, and luggage capacity",
          "Daily-priced add-ons: insurance, WiFi, GPS, child seat, extra driver, and roadside assistance",
          "Booking summary, free-cancellation message, and “Or Similar Model” notice"
        ]
      },
      {
        title: "Booking Completion Flow",
        text:
          "A dedicated completion page turns the selected vehicle and dates into a clear booking summary before collecting customer and payment details.",
        bullets: [
          "Selected vehicle, pickup, and return information",
          "Rental-day, base-price, and add-on calculations",
          "Customer, identity, driving-license, and contact fields",
          "A focused interface designed to reduce friction at the final step"
        ]
      },
      {
        title: "Finance Calculator",
        text:
          "The platform includes a custom-built finance calculator rather than a generic embedded widget.",
        bullets: [
          "Car price and finance-provider selection",
          "Down-payment and final-payment percentages",
          "Finance duration in years",
          "Monthly payment, total amount, finance amount, and month count",
          "A clear notice that calculations are approximate"
        ]
      },
      {
        title: "Bilingual UX: Arabic + English",
        text:
          "Arabic RTL and English LTR interfaces were treated as two complete reading experiences, not as a simple text swap.",
        bullets: [
          "Direction-aware spacing and alignment",
          "Readable labels, buttons, forms, and booking summaries",
          "Consistent hierarchy across Arabic and English",
          "Responsive behavior across mobile and desktop"
        ]
      },
      {
        title: "Custom Theme & Plugin Logic",
        text:
          "The theme and interface were built from scratch without a ready-made template. Rental filters, add-ons, booking calculations, and finance logic were implemented as custom components to retain control over performance and the user journey.",
        bullets: [
          "Purpose-built WordPress theme",
          "Custom rental and booking components",
          "Reduced dependence on generic ready-made plugins",
          "Maintainable control over UX and front-end behavior"
        ]
      }
    ],
    featuresTitle: "Key Features",
    features: [
      "Fully custom WordPress theme built from scratch",
      "Custom car rental booking flow",
      "Dynamic hero booking filter",
      "Branch, airport, and train-station pickup options",
      "Monthly rental plan cards",
      "Custom car detail pages",
      "Optional add-ons with daily pricing",
      "Booking summary and date-based pricing logic",
      "Custom booking-completion page",
      "Finance calculator with provider-based rates",
      "Arabic RTL and English LTR experience",
      "Responsive UI for mobile and desktop",
      "Performance-focused front-end structure",
      "WhatsApp and contact integrations",
      "SEO-friendly project and page structure"
    ],
    roleTitle: "My Role",
    roles: [
      "Lead WordPress Developer",
      "Custom Theme Developer",
      "Custom Plugin / Booking Logic Developer",
      "Frontend Developer",
      "UX Implementation"
    ],
    stackTitle: "Tech Stack",
    stack: [
      "WordPress",
      "PHP",
      "Custom Theme",
      "Custom Plugin Development",
      "HTML5",
      "CSS3",
      "JavaScript",
      "Responsive UI",
      "RTL / LTR",
      "Booking Logic",
      "Finance Calculator"
    ],
    screenshotTitle: "Project Screenshots",
    fullPage: "Full page",
    hover: "Hover to scroll preview",
    tap: "Tap to view",
    cta: "Need a custom booking platform?",
    ctaText:
      "I can help turn a complex service workflow into a focused WordPress platform with custom interfaces and business logic.",
    ctaButton: "Start a Similar Project",
    footerName: "Muhammed Nasser. All rights reserved."
  },
  ar: {
    lang: "ar",
    dir: "rtl",
    bodyClass:
      "cairo_eb32b749-module__msiTQW__variable font-cairo bg-[#05070D] text-[#F8FAFC] antialiased min-h-screen flex flex-col",
    title: "منصة أشهلان لتأجير السيارات",
    meta:
      "منصة وردبريس مخصصة بالكامل لتأجير السيارات والحجز في السعودية، تشمل تصفح الأسطول وفلاتر الاستلام والإضافات وإكمال الحجز وحاسبة التمويل وتجربة عربية وإنجليزية.",
    category: "منصة تأجير سيارات مخصصة / نظام حجز",
    hero:
      "منصة مخصصة بالكامل لتأجير السيارات في السوق السعودي، تجمع بين تصفح الأسطول، وفلاتر الاستلام من الفروع والمطارات ومحطات القطار، وخطط التأجير الشهرية، وصفحات تفاصيل السيارات، والإضافات الاختيارية، ومسار حجز مخصص، وحاسبة تمويل مستقلة، وتجربة متكاملة بالعربية والإنجليزية.",
    liveLabel: "زيارة المنصة",
    problemTitle: "المشكلة",
    problem:
      "لم يكن العميل يحتاج إلى موقع تعريفي فقط، بل إلى منصة تأجير متكاملة تعرض أسطولًا كبيرًا من المركبات وتنظم السيارات حسب النوع والمواصفات والسعر اليومي، وتدعم أكثر من سيناريو للاستلام، وتعرض الخطط الشهرية، وتقود المستخدم من اختيار السيارة حتى إكمال الحجز. وكان يجب أن تكون التجربة سريعة وواضحة ومتجاوبة وثنائية اللغة ومناسبة للمستخدم داخل السعودية.",
    solutionTitle: "الحل",
    solution:
      "تم بناء منصة WordPress مخصصة بالكامل بقالب صُمم وطُوّر من الصفر. جرى تنفيذ مكونات مخصصة لبيانات السيارات والقوائم والأسعار والإضافات وفلاتر الحجز وصفحات السيارة وملخص الحجز وإكماله وحساب التمويل. لا تعتمد الواجهة على قالب جاهز، وركز التنفيذ على الأداء وسهولة الاستخدام ودعم RTL وLTR وتقديم رحلة حجز واضحة.",
    deepDiveTitle: "بنية المنصة والتجارب المخصصة",
    deepDiveIntro:
      "تم تنظيم المنصة حول رحلة التأجير الفعلية بدلًا من هيكل موقع عام، مع واجهة ومنطق مخصصين لكل خطوة رئيسية.",
    sections: [
      {
        title: "تجربة حجز مخصصة",
        text:
          "يتكيف فلتر البحث في الواجهة الرئيسية مع نوع خدمة التأجير المختارة ويجمع البيانات المطلوبة قبل عرض السيارات المناسبة.",
        bullets: [
          "تأجير يومي، استلام من المطار، استلام من محطة القطار، وخطط شهرية",
          "اختيار الفرع أو موقع الاستلام",
          "اختيار تاريخ الاستلام والإرجاع",
          "مسار بحث مباشر إلى السيارات المتاحة"
        ]
      },
      {
        title: "صفحة تفاصيل سيارة مخصصة",
        text:
          "لكل مركبة صفحة مصممة خصيصًا تجمع بين العرض البصري والمعلومات اللازمة لاتخاذ قرار التأجير.",
        bullets: [
          "صورة السيارة والتقييم والنوع والسعر اليومي",
          "عدد الركاب وناقل الحركة والوقود وسعة الحقائب",
          "إضافات بسعر يومي: التأمين وWiFi وGPS ومقعد الطفل والسائق الإضافي والمساعدة على الطريق",
          "ملخص الحجز ورسالة الإلغاء المجاني وتنبيه «أو موديل مشابه»"
        ]
      },
      {
        title: "مسار إكمال الحجز",
        text:
          "تحول صفحة الإكمال السيارة والتواريخ المحددة إلى ملخص واضح قبل جمع بيانات العميل والدفع.",
        bullets: [
          "عرض السيارة ومعلومات الاستلام والإرجاع",
          "حساب مدة التأجير والسعر الأساسي والإضافات",
          "حقول بيانات العميل والهوية ورخصة القيادة والتواصل",
          "واجهة مركزة تقلل الاحتكاك في الخطوة النهائية"
        ]
      },
      {
        title: "حاسبة تمويل مخصصة",
        text:
          "تحتوي المنصة على حاسبة تمويل مبنية خصيصًا للمشروع وليست مجرد أداة عامة مضمّنة.",
        bullets: [
          "إدخال سعر السيارة واختيار جهة التمويل",
          "نسبة الدفعة الأولى والدفعة الأخيرة",
          "مدة التمويل بالسنوات",
          "حساب القسط الشهري والإجمالي ومبلغ التمويل وعدد الأشهر",
          "تنبيه واضح بأن النتائج تقريبية"
        ]
      },
      {
        title: "تجربة ثنائية اللغة: العربية والإنجليزية",
        text:
          "تم التعامل مع واجهتي العربية RTL والإنجليزية LTR كتجربتي قراءة كاملتين، وليس كمجرد استبدال للنصوص.",
        bullets: [
          "مسافات ومحاذاة تراعي اتجاه اللغة",
          "وضوح الأزرار والحقول والعناوين وملخصات الحجز",
          "تسلسل بصري متسق في اللغتين",
          "تجاوب كامل مع الموبايل وسطح المكتب"
        ]
      },
      {
        title: "قالب مخصص ومنطق إضافات مخصص",
        text:
          "تم بناء القالب والواجهة من الصفر دون قالب جاهز، وتنفيذ فلاتر التأجير والإضافات وحسابات الحجز والتمويل كمكونات مخصصة للحفاظ على التحكم في الأداء وتجربة المستخدم.",
        bullets: [
          "قالب WordPress مصمم للمشروع",
          "مكونات مخصصة للتأجير والحجز",
          "تقليل الاعتماد على الإضافات العامة الجاهزة",
          "تحكم قابل للصيانة في تجربة المستخدم وسلوك الواجهة"
        ]
      }
    ],
    featuresTitle: "أهم المميزات",
    features: [
      "قالب WordPress مخصص بالكامل مبني من الصفر",
      "مسار مخصص لحجز وتأجير السيارات",
      "فلتر حجز ديناميكي في الواجهة الرئيسية",
      "خيارات الاستلام من الفرع والمطار ومحطة القطار",
      "بطاقات خطط التأجير الشهرية",
      "صفحات تفاصيل سيارات مخصصة",
      "إضافات اختيارية بأسعار يومية",
      "ملخص حجز ومنطق تسعير حسب التواريخ",
      "صفحة مخصصة لإكمال الحجز",
      "حاسبة تمويل بمعدلات مرتبطة بجهة التمويل",
      "تجربة عربية RTL وإنجليزية LTR",
      "واجهة متجاوبة للموبايل وسطح المكتب",
      "بنية Frontend تركز على الأداء",
      "تكاملات واتساب والتواصل",
      "هيكل صفحات مناسب لمحركات البحث"
    ],
    roleTitle: "دوري في المشروع",
    roles: [
      "مطور WordPress رئيسي",
      "مطور قالب مخصص",
      "مطور إضافة ومنطق حجز مخصص",
      "مطور واجهات أمامية",
      "تنفيذ تجربة المستخدم"
    ],
    stackTitle: "التقنيات المستخدمة",
    stack: [
      "WordPress",
      "PHP",
      "Custom Theme",
      "Custom Plugin Development",
      "HTML5",
      "CSS3",
      "JavaScript",
      "Responsive UI",
      "RTL / LTR",
      "Booking Logic",
      "Finance Calculator"
    ],
    screenshotTitle: "صور المشروع",
    fullPage: "صفحة كاملة",
    hover: "مرّر لعرض الصورة كاملة",
    tap: "اضغط للعرض",
    cta: "تحتاج إلى منصة حجز مخصصة؟",
    ctaText:
      "يمكنني مساعدتك في تحويل سير عمل خدمي معقد إلى منصة WordPress واضحة بواجهات ومنطق أعمال مخصصين.",
    ctaButton: "ابدأ مشروعًا مشابهًا",
    footerName: "محمد ناصر. جميع الحقوق محفوظة."
  }
};

const workCard = {
  en: {
    category: "Custom Car Rental Platform / Booking System",
    title: "Ashhalan Car Rental Platform",
    description:
      "A fully custom car rental and booking platform for Ashhalan in Saudi Arabia, featuring fleet browsing, pickup-based booking filters, car detail pages, add-ons, booking completion, a finance calculator, and bilingual Arabic/English UX.",
    tags: ["WordPress", "Custom Theme", "Booking Logic"],
    href: "/work/ashhalancarrental",
    archiveHref: "/work/ashhalancarrental",
    locale: "en",
    alt: "Ashhalan Car Rental Platform"
  },
  ar: {
    category: "منصة تأجير سيارات مخصصة / نظام حجز",
    title: "منصة أشهلان لتأجير السيارات",
    description:
      "منصة مخصصة بالكامل لتأجير السيارات والحجز لأشهلان في السعودية، تشمل تصفح الأسطول، وفلاتر الحجز حسب موقع الاستلام، وصفحات السيارات، والإضافات، وإكمال الحجز، وحاسبة التمويل، وتجربة عربية وإنجليزية.",
    tags: ["WordPress", "Custom Theme", "Booking Logic"],
    href: "/ar/work/ashhalancarrental",
    archiveHref: "/ar/work/ashhalancarrental",
    locale: "ar",
    alt: "منصة أشهلان لتأجير السيارات"
  }
};

const featuredCard = {
  en: {
    category: "Custom Booking Platform",
    title: "Ashhalan Car Rental Platform",
    description:
      "A fully custom Saudi car rental platform with fleet browsing, pickup-based booking filters, vehicle pages, add-ons, booking completion, finance calculation, and bilingual UX.",
    tags: ["WordPress", "Booking System", "Arabic / English"],
    href: "/work/ashhalancarrental/",
    alt: "Ashhalan Car Rental Platform"
  },
  ar: {
    category: "منصة حجز مخصصة",
    title: "منصة أشهلان لتأجير السيارات",
    description:
      "منصة سعودية مخصصة لتأجير السيارات تشمل تصفح الأسطول وفلاتر الاستلام وصفحات السيارات والإضافات وإكمال الحجز وحاسبة التمويل وتجربة ثنائية اللغة.",
    tags: ["WordPress", "نظام حجز", "عربي / إنجليزي"],
    href: "/ar/work/ashhalancarrental/",
    alt: "منصة أشهلان لتأجير السيارات"
  }
};

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

function write(relativePath, value) {
  writeFileSync(join(root, relativePath), value, "utf8");
  console.log(`Updated ${relativePath}`);
}

function element(type, props = {}, children = undefined, key = null) {
  const finalProps = { ...props };
  if (children !== undefined) {
    finalProps.children = children;
  }
  return ["$", type, key, finalProps];
}

const caseStudyCss = `
.case-study-page{width:100%;max-width:1280px;margin-inline:auto;padding-block:clamp(3rem,6vw,5.5rem);padding-inline:clamp(1.25rem,4vw,2.5rem);display:flex;flex-direction:column;gap:clamp(4rem,7vw,6.5rem);overflow-x:hidden}
.case-study-page h1,.case-study-page h2,.case-study-page h3,.case-study-page p,.case-study-page ul{margin-top:0;margin-bottom:0}
.case-hero{max-width:1060px;margin-inline:auto;padding-inline:clamp(0rem,2vw,1.5rem);display:flex;flex-direction:column;align-items:center;gap:1.5rem;text-align:center}
.case-kicker{max-width:100%;padding:.65rem 1.15rem;line-height:1.55;overflow-wrap:anywhere;white-space:normal;box-sizing:border-box}
.case-title{max-width:1050px;font-size:clamp(2.45rem,5.3vw,4.65rem);line-height:1.08;letter-spacing:-.035em;overflow-wrap:anywhere}
.case-lead{max-width:920px;font-size:clamp(1.05rem,1.75vw,1.4rem);line-height:1.78}
.case-hero-action{margin-top:.25rem}
.case-primary-button{padding:1rem 2rem;line-height:1.2}
.case-hero-media{width:100%;max-width:1180px;margin-inline:auto}
.case-overview-grid{width:100%;max-width:1180px;margin-inline:auto;display:grid;grid-template-columns:minmax(0,2fr) minmax(280px,1fr);gap:clamp(2.25rem,4vw,3.75rem);align-items:start}
.case-main-content{display:flex;flex-direction:column;gap:clamp(3rem,5vw,4.25rem);min-width:0}
.case-copy-panel{padding:clamp(1.5rem,3vw,2.25rem)}
.case-section-title{font-size:clamp(1.75rem,3vw,2.15rem);line-height:1.25;margin-bottom:1.25rem}
.case-body-copy,.case-section-intro{font-size:clamp(1rem,1.4vw,1.125rem);line-height:1.9}
.case-deep-dive,.case-features,.case-screenshots{display:flex;flex-direction:column;gap:2rem}
.case-tech-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.5rem}
.case-tech-card{padding:clamp(1.4rem,2.5vw,1.85rem);display:flex;flex-direction:column;min-width:0}
.case-card-number{margin-bottom:1.25rem}
.case-card-title{font-size:1.25rem;line-height:1.38;margin-bottom:.85rem}
.case-card-copy{font-size:.95rem;line-height:1.82;margin-bottom:1.35rem}
.case-bullet-list{display:flex;flex-direction:column;gap:.8rem;padding:0;list-style:none}
.case-feature-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:2rem;row-gap:1rem;padding:0;list-style:none}
.case-bullet-item{display:flex;align-items:flex-start;gap:.8rem;min-width:0}
.case-bullet-dot{width:.45rem;height:.45rem;margin-top:.62em;flex:0 0 auto}
.case-bullet-text{font-size:.95rem;line-height:1.75;overflow-wrap:anywhere}
.case-sidebar{padding:clamp(1.5rem,3vw,2rem);display:flex;flex-direction:column;gap:2.5rem}
.case-sidebar-heading{font-size:.78rem;line-height:1.55;margin-bottom:1rem}
.case-role-list{display:flex;flex-direction:column;gap:.75rem;padding:0;list-style:none}
.case-role-item{font-size:1rem;line-height:1.62}
.case-stack{gap:.55rem}
.case-stack-item{line-height:1.35}
.case-sidebar-cta{padding-top:1.5rem}
.case-screenshots{width:100%;max-width:1180px;margin-inline:auto}
.case-screenshots>h2{margin-bottom:0}
.case-shot-card>div{padding:1rem 1.25rem}
.case-shot-title{line-height:1.55}
.case-cta{width:100%;max-width:1000px;margin-inline:auto;padding:clamp(2rem,5vw,3.5rem)}
.case-cta-title{font-size:clamp(1.75rem,3vw,2.15rem);line-height:1.3;margin-bottom:1rem}
.case-cta-copy{max-width:760px;margin-inline:auto;margin-bottom:2rem;font-size:clamp(1rem,1.4vw,1.125rem);line-height:1.85}
[dir="rtl"] .case-kicker{letter-spacing:0;text-transform:none;line-height:1.85}
[dir="rtl"] .case-title{line-height:1.24;letter-spacing:-.02em}
[dir="rtl"] .case-lead{line-height:2}
[dir="rtl"] .case-section-title,[dir="rtl"] .case-card-title,[dir="rtl"] .case-cta-title{line-height:1.5}
[dir="rtl"] .case-body-copy,[dir="rtl"] .case-section-intro{line-height:2.05}
[dir="rtl"] .case-card-copy{line-height:1.95}
[dir="rtl"] .case-bullet-text{line-height:1.9}
[dir="rtl"] .case-role-item{line-height:1.8}
[dir="rtl"] .case-cta-copy{line-height:2}
@media(max-width:1023px){
  .case-overview-grid{grid-template-columns:minmax(0,1fr);gap:3rem}
  .case-sidebar{position:static}
}
@media(max-width:767px){
  .case-study-page{padding-block:3rem;padding-inline:1rem;gap:4rem}
  .case-hero{gap:1.2rem;padding-inline:0}
  .case-kicker{padding:.65rem .85rem;font-size:.72rem;line-height:1.55}
  .case-title{font-size:clamp(2.15rem,11vw,2.75rem);line-height:1.12}
  .case-lead{font-size:1.02rem;line-height:1.75}
  .case-primary-button{padding:.95rem 1.5rem;font-size:1rem}
  .case-hero-media{border-radius:1rem}
  .case-overview-grid{gap:2.5rem}
  .case-main-content{gap:2.75rem}
  .case-copy-panel{padding:1.35rem}
  .case-section-title{font-size:1.65rem;margin-bottom:1rem}
  .case-body-copy,.case-section-intro{font-size:1rem;line-height:1.85}
  .case-deep-dive,.case-features,.case-screenshots{gap:1.5rem}
  .case-tech-grid{grid-template-columns:minmax(0,1fr);gap:1rem}
  .case-tech-card{padding:1.35rem}
  .case-card-number{margin-bottom:1rem}
  .case-card-title{font-size:1.18rem;margin-bottom:.7rem}
  .case-card-copy{font-size:.94rem;margin-bottom:1.1rem}
  .case-feature-list{grid-template-columns:minmax(0,1fr);row-gap:.85rem}
  .case-sidebar{padding:1.4rem;gap:2rem}
  .case-shot{height:340px!important}
  .case-shot-card>div{padding:.9rem 1rem}
  .case-cta{padding:2rem 1.35rem}
  [dir="rtl"] .case-title{line-height:1.3}
  [dir="rtl"] .case-lead{line-height:1.95}
  [dir="rtl"] .case-body-copy,[dir="rtl"] .case-section-intro{line-height:2}
}
`;

function bulletList(items, columns = true) {
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
            className:
              "case-bullet-dot rounded-full bg-[#38BDF8]"
          }),
          element("span", { className: "case-bullet-text" }, item)
        ],
        String(index)
      )
    )
  );
}

function buildScreenshots(lang) {
  return screenshotFiles.map(([file, enTitle, arTitle, isFullPage]) => ({
    src: `/projects/ashhalancarrental/${file}`,
    alt: {
      en: `Ashhalan Car Rental Platform — ${enTitle}`,
      ar: `منصة أشهلان لتأجير السيارات — ${arTitle}`
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
        element(
          "h3",
          { className: "case-card-title font-bold text-white" },
          section.title
        ),
        element(
          "p",
          {
            className:
              "case-card-copy text-[#94A3B8]"
          },
          section.text
        ),
        bulletList(section.bullets, false)
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
          copy.roleTitle
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
          copy.stack.map((technology, index) =>
            element(
              "span",
              {
                className:
                  "case-stack-item px-3 py-2 bg-[#1E293B] text-xs font-semibold rounded-md border border-white/5 text-[#94A3B8]"
              },
              technology,
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
            href:
              lang === "ar"
                ? "https://wa.me/201025811613?text=%D8%A3%D9%87%D9%84%D8%A7%D9%8B%20%D9%85%D8%AD%D9%85%D8%AF%D8%8C%20%D8%A3%D8%AD%D8%AA%D8%A7%D8%AC%20%D8%A5%D9%84%D9%89%20%D9%85%D9%86%D8%B5%D8%A9%20%D8%AD%D8%AC%D8%B2%20%D9%85%D8%AE%D8%B5%D8%B5%D8%A9%20%D9%85%D8%B4%D8%A7%D8%A8%D9%87%D8%A9%20%D9%84%D9%85%D8%B4%D8%B1%D9%88%D8%B9%20%D8%A3%D8%B4%D9%87%D9%84%D8%A7%D9%86."
                : "https://wa.me/201025811613?text=Hello%20Muhammed%2C%20I%20saw%20the%20Ashhalan%20Car%20Rental%20case%20study%20and%20need%20a%20similar%20custom%20booking%20platform.",
            target: "_blank",
            rel: "noopener noreferrer",
            className:
              "case-primary-button block w-full text-center bg-[#38BDF8] text-[#0B1020] font-bold text-base rounded-lg hover:bg-[#38BDF8]/90 hover:scale-105 transition-all"
          },
          copy.ctaButton
        )
      )
    ]
  );

  return element(
    "div",
    {
      className: "case-study-page",
      style: { maxWidth: "100vw", overflowX: "hidden" }
    },
    [
      element("style", {
        dangerouslySetInnerHTML: { __html: caseStudyCss }
      }),
      element(
        "header",
        { className: "case-hero" },
        [
          element(
            "div",
            {
              className:
                "case-kicker inline-block rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-sm font-bold text-[#38BDF8] uppercase tracking-widest text-center",
              style: {
                overflowWrap: "anywhere",
                maxWidth: "100%",
                whiteSpace: "normal",
                boxSizing: "border-box"
              }
            },
            copy.category
          ),
          element(
            "h1",
            {
              className:
                "case-title font-extrabold",
              style: { overflowWrap: "anywhere" }
            },
            copy.title
          ),
          element(
            "p",
            {
              className:
                "case-lead text-[#94A3B8]"
            },
            copy.hero
          ),
          element(
            "div",
            { className: "case-hero-action flex items-center justify-center" },
            element(
              "a",
              {
                href: "https://ashhalancarrental.com/",
                target: "_blank",
                rel: "noopener noreferrer",
                className:
                  "case-primary-button inline-flex items-center gap-2 bg-[#22C55E] text-white font-bold text-lg rounded-lg hover:bg-[#22C55E]/90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              },
              copy.liveLabel
            )
          )
        ]
      ),
      element(
        "div",
        {
          className:
            "case-hero-media relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#111827]"
        },
        element("img", {
          src: `/projects/ashhalancarrental/${heroImage}`,
          alt: copy.title,
          className: "w-full h-full object-cover object-top",
          loading: "eager"
        })
      ),
      element(
        "div",
        { className: "case-overview-grid" },
        [
          element(
            "div",
            { className: "case-main-content" },
            [
              element(
                "section",
                {
                  className:
                    "case-copy-panel bg-[#111827]/60 border border-white/5 rounded-2xl"
                },
                [
                  element(
                    "h2",
                    { className: "case-section-title font-bold" },
                    copy.problemTitle
                  ),
                  element(
                    "p",
                    {
                      className:
                        "case-body-copy text-[#94A3B8]"
                    },
                    copy.problem
                  )
                ]
              ),
              element(
                "section",
                {
                  className:
                    "case-copy-panel bg-[#111827]/60 border border-white/5 rounded-2xl"
                },
                [
                  element(
                    "h2",
                    { className: "case-section-title font-bold" },
                    copy.solutionTitle
                  ),
                  element(
                    "p",
                    {
                      className:
                        "case-body-copy text-[#94A3B8]"
                    },
                    copy.solution
                  )
                ]
              ),
              element("section", { className: "case-deep-dive" }, [
                element("div", {}, [
                  element(
                    "h2",
                    { className: "case-section-title font-bold" },
                    copy.deepDiveTitle
                  ),
                  element(
                    "p",
                    {
                      className:
                        "case-section-intro text-[#94A3B8]"
                    },
                    copy.deepDiveIntro
                  )
                ]),
                element(
                  "div",
                  { className: "case-tech-grid" },
                  technicalCards
                )
              ]),
              element("section", { className: "case-features" }, [
                element(
                  "h2",
                  { className: "case-section-title font-bold" },
                  copy.featuresTitle
                ),
                bulletList(copy.features, true)
              ])
            ]
          ),
          aside
        ]
      ),
      element(
        "section",
        { className: "case-screenshots" },
        [
          element(
            "h2",
            { className: "case-section-title font-bold" },
            copy.screenshotTitle
          ),
          element(galleryRef, {
            lang,
            screenshots: buildScreenshots(lang)
          })
        ]
      ),
      element(
        "section",
        {
          className:
            "case-cta text-center bg-[#111827] border border-[#38BDF8]/20 rounded-2xl"
        },
        [
          element(
            "h2",
            { className: "case-cta-title font-bold" },
            copy.cta
          ),
          element(
            "p",
            {
              className:
                "case-cta-copy text-[#94A3B8]"
            },
            copy.ctaText
          ),
          element(
            "a",
            {
              href: lang === "ar" ? "/ar/contact/" : "/contact/",
              className:
                "case-primary-button inline-flex rounded-xl bg-[#38BDF8] text-[#0B1020] font-bold text-lg hover:bg-[#38BDF8]/90 transition-all"
            },
            copy.ctaButton
          )
        ]
      )
    ]
  );
}

function updateLine(contentValue, id, value) {
  const line = `${id}:${JSON.stringify(value)}`;
  const expression = new RegExp(`^${id}:.*$`, "m");
  if (!expression.test(contentValue)) {
    throw new Error(`Could not find RSC line ${id}`);
  }
  return contentValue.replace(expression, line);
}

function updateFullPayload(relativePath, lang) {
  let value = read(relativePath);
  value = updateLine(value, "5", buildPageTree(lang, "$L18"));
  const copy = content[lang];
  const metadata = [
    ["$", "title", "0", { children: copy.title }],
    ["$", "meta", "1", { name: "description", content: copy.meta }],
    ["$", "link", "2", { rel: "shortcut icon", href: "/favicon.png" }],
    [
      "$",
      "link",
      "3",
      {
        rel: "icon",
        href: "/favicon.ico?favicon.2vob68tjqpejf.ico",
        sizes: "256x256",
        type: "image/x-icon"
      }
    ],
    ["$", "link", "4", { rel: "icon", href: "/favicon.png" }],
    ["$", "link", "5", { rel: "apple-touch-icon", href: "/favicon.png" }],
    ["$", "$L19", "6", {}]
  ];
  value = updateLine(value, "d", metadata);
  write(relativePath, value);
}

function updatePagePayload(relativePath, lang) {
  const lines = read(relativePath).split(/\r?\n/);
  const lineIndex = lines.findIndex((line) => line.startsWith("0:"));
  if (lineIndex === -1) {
    throw new Error(`Could not find page payload in ${relativePath}`);
  }
  const payload = JSON.parse(lines[lineIndex].slice(2));
  payload.rsc[3].children[0] = buildPageTree(lang, "$L9");
  lines[lineIndex] = `0:${JSON.stringify(payload)}`;
  write(relativePath, `${lines.join("\n").replace(/\n+$/, "")}\n`);
}

function updateHeadPayload(relativePath, lang) {
  const lines = read(relativePath).split(/\r?\n/);
  const lineIndex = lines.findIndex((line) => line.startsWith("0:"));
  const payload = JSON.parse(lines[lineIndex].slice(2));
  const copy = content[lang];

  function walk(node) {
    if (Array.isArray(node)) {
      if (node[0] === "$" && node[1] === "title" && node[3]) {
        node[3].children = copy.title;
      }
      if (
        node[0] === "$" &&
        node[1] === "meta" &&
        node[3]?.name === "description"
      ) {
        node[3].content = copy.meta;
      }
      node.forEach(walk);
      return;
    }
    if (node && typeof node === "object") {
      Object.values(node).forEach(walk);
    }
  }

  walk(payload);
  lines[lineIndex] = `0:${JSON.stringify(payload)}`;
  write(relativePath, `${lines.join("\n").replace(/\n+$/, "")}\n`);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderBulletList(items, compact = false) {
  return `<ul class="${
    compact
      ? "case-bullet-list text-[#94A3B8]"
      : "case-feature-list text-[#94A3B8]"
  }">${items
    .map(
      (item) =>
        `<li class="case-bullet-item"><span class="case-bullet-dot rounded-full bg-[#38BDF8]"></span><span class="case-bullet-text">${escapeHtml(
          item
        )}</span></li>`
    )
    .join("")}</ul>`;
}

function renderGallery(lang) {
  const copy = content[lang];
  return `<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">${screenshotFiles
    .map(([file, enTitle, arTitle, isFullPage]) => {
      const title = lang === "ar" ? arTitle : enTitle;
      return `<article class="case-shot-card flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#111827] shadow-lg hover:border-white/20 transition-all duration-300"><button type="button" class="case-shot relative block w-full text-left rtl:text-right outline-none cursor-zoom-in" style="height:420px;overflow:hidden;flex-shrink:0" data-src="/projects/ashhalancarrental/${file}" data-title="${escapeHtml(
        title
      )}"><img src="/projects/ashhalancarrental/${file}" alt="${escapeHtml(
        title
      )}" loading="lazy" style="width:100%;height:auto;display:block;transform:translateY(0);transition:transform 1.5s ease-in-out;will-change:transform"><div aria-hidden="true" style="position:absolute;bottom:0;left:0;right:0;height:90px;background:linear-gradient(to top,rgba(17,24,39,.96),transparent);pointer-events:none"></div>${
        isFullPage
          ? `<span class="absolute top-3 right-3 px-2.5 py-1.5 bg-black/60 border border-white/15 text-white/70 text-xs font-semibold rounded-lg">${escapeHtml(
              copy.fullPage
            )}</span>`
          : ""
      }<span class="absolute bottom-3 left-1/2 px-3 py-1.5 bg-black/70 border border-white/10 rounded-full text-white/70 text-xs font-medium" style="transform:translateX(-50%);white-space:nowrap"><span class="hidden md:inline">${escapeHtml(
        copy.hover
      )}</span><span class="md:hidden">${escapeHtml(
        copy.tap
      )}</span></span></button><div><p class="case-shot-title text-white font-semibold text-base">${escapeHtml(
        title
      )}</p></div></article>`;
    })
    .join("")}</div>`;
}

function extractTag(html, tagName) {
  const start = html.indexOf(`<${tagName}`);
  const end = html.indexOf(`</${tagName}>`, start);
  if (start === -1 || end === -1) {
    throw new Error(`Could not extract <${tagName}>`);
  }
  return html.slice(start, end + tagName.length + 3);
}

function renderStaticPage(lang, existingHtml) {
  const copy = content[lang];
  const header = extractTag(existingHtml, "header");
  const footer = extractTag(existingHtml, "footer");
  const heroImage = lang === "ar" ? "home-ar.jpg" : "home-en.jpg";
  const technicalCards = copy.sections
    .map(
      (section, index) =>
        `<article class="case-tech-card bg-[#111827] border border-white/5 rounded-2xl hover:border-[#38BDF8]/25 transition-colors"><div class="case-card-number w-10 h-10 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center font-extrabold">${String(
          index + 1
        ).padStart(2, "0")}</div><h3 class="case-card-title font-bold text-white">${escapeHtml(
          section.title
        )}</h3><p class="case-card-copy text-[#94A3B8]">${escapeHtml(
          section.text
        )}</p>${renderBulletList(section.bullets, true)}</article>`
    )
    .join("");
  const roles = copy.roles
    .map(
      (role) =>
        `<li class="case-role-item font-semibold text-[#F8FAFC]">${escapeHtml(
          role
        )}</li>`
    )
    .join("");
  const stack = copy.stack
    .map(
      (technology) =>
        `<span class="case-stack-item px-3 py-2 bg-[#1E293B] text-xs font-semibold rounded-md border border-white/5 text-[#94A3B8]">${escapeHtml(
          technology
        )}</span>`
    )
    .join("");

  const main = `<main class="flex-1" style="max-width:100vw;overflow-x:hidden"><div class="case-study-page"><header class="case-hero"><div class="case-kicker inline-block rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-sm font-bold text-[#38BDF8] uppercase tracking-widest text-center">${escapeHtml(
    copy.category
  )}</div><h1 class="case-title font-extrabold">${escapeHtml(
    copy.title
  )}</h1><p class="case-lead text-[#94A3B8]">${escapeHtml(
    copy.hero
  )}</p><div class="case-hero-action flex items-center justify-center"><a href="https://ashhalancarrental.com/" target="_blank" rel="noopener noreferrer" class="case-primary-button inline-flex items-center gap-2 bg-[#22C55E] text-white font-bold text-lg rounded-lg hover:bg-[#22C55E]/90 hover:scale-105 transition-all">${escapeHtml(
    copy.liveLabel
  )}</a></div></header><div class="case-hero-media relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#111827]"><img src="/projects/ashhalancarrental/${heroImage}" alt="${escapeHtml(
    copy.title
  )}" class="w-full h-full object-cover object-top"></div><div class="case-overview-grid"><div class="case-main-content"><section class="case-copy-panel bg-[#111827]/60 border border-white/5 rounded-2xl"><h2 class="case-section-title font-bold">${escapeHtml(
    copy.problemTitle
  )}</h2><p class="case-body-copy text-[#94A3B8]">${escapeHtml(
    copy.problem
  )}</p></section><section class="case-copy-panel bg-[#111827]/60 border border-white/5 rounded-2xl"><h2 class="case-section-title font-bold">${escapeHtml(
    copy.solutionTitle
  )}</h2><p class="case-body-copy text-[#94A3B8]">${escapeHtml(
    copy.solution
  )}</p></section><section class="case-deep-dive"><div><h2 class="case-section-title font-bold">${escapeHtml(
    copy.deepDiveTitle
  )}</h2><p class="case-section-intro text-[#94A3B8]">${escapeHtml(
    copy.deepDiveIntro
  )}</p></div><div class="case-tech-grid">${technicalCards}</div></section><section class="case-features"><h2 class="case-section-title font-bold">${escapeHtml(
    copy.featuresTitle
  )}</h2>${renderBulletList(
    copy.features
  )}</section></div><aside class="case-sidebar bg-[#111827] rounded-2xl border border-white/5 h-fit shadow-lg sticky top-24"><div><h3 class="case-sidebar-heading font-bold uppercase tracking-widest text-[#94A3B8]">${escapeHtml(
    copy.roleTitle
  )}</h3><ul class="case-role-list">${roles}</ul></div><div><h3 class="case-sidebar-heading font-bold uppercase tracking-widest text-[#94A3B8]">${escapeHtml(
    copy.stackTitle
  )}</h3><div class="case-stack flex flex-wrap">${stack}</div></div><div class="case-sidebar-cta border-t border-white/5"><a href="${
    lang === "ar" ? "/ar/contact/" : "/contact/"
  }" class="case-primary-button block w-full text-center bg-[#38BDF8] text-[#0B1020] font-bold text-base rounded-lg">${escapeHtml(
    copy.ctaButton
  )}</a></div></aside></div><section class="case-screenshots"><h2 class="case-section-title font-bold">${escapeHtml(
    copy.screenshotTitle
  )}</h2>${renderGallery(
    lang
  )}</section><section class="case-cta text-center bg-[#111827] border border-[#38BDF8]/20 rounded-2xl"><h2 class="case-cta-title font-bold">${escapeHtml(
    copy.cta
  )}</h2><p class="case-cta-copy text-[#94A3B8]">${escapeHtml(
    copy.ctaText
  )}</p><a href="${
    lang === "ar" ? "/ar/contact/" : "/contact/"
  }" class="case-primary-button inline-flex rounded-xl bg-[#38BDF8] text-[#0B1020] font-bold text-lg">${escapeHtml(
    copy.ctaButton
  )}</a></section></div></main>`;

  const galleryScript = `<div id="case-modal" hidden style="position:fixed;inset:0;z-index:100;background:rgba(2,6,23,.94);padding:24px;overflow:auto"><button id="case-modal-close" type="button" aria-label="Close" style="position:fixed;top:18px;right:18px;z-index:101;width:44px;height:44px;border-radius:999px;background:#111827;color:white;border:1px solid rgba(255,255,255,.2);font-size:25px;cursor:pointer">×</button><img id="case-modal-image" alt="" style="display:block;max-width:1400px;width:100%;height:auto;margin:50px auto 20px;border-radius:16px"></div><script>(function(){document.querySelectorAll('.case-shot').forEach(function(button){var image=button.querySelector('img');button.addEventListener('mouseenter',function(){var distance=Math.max(0,image.getBoundingClientRect().height-button.clientHeight);image.style.transitionDuration=Math.max(1.5,distance/260)+'s';image.style.transform='translateY(-'+distance+'px)'});button.addEventListener('mouseleave',function(){image.style.transitionDuration='1.2s';image.style.transform='translateY(0)'});button.addEventListener('click',function(){var modal=document.getElementById('case-modal');var modalImage=document.getElementById('case-modal-image');modalImage.src=button.dataset.src;modalImage.alt=button.dataset.title;modal.hidden=false;document.body.style.overflow='hidden'})});var close=function(){document.getElementById('case-modal').hidden=true;document.body.style.overflow=''};document.getElementById('case-modal-close').addEventListener('click',close);document.getElementById('case-modal').addEventListener('click',function(event){if(event.target.id==='case-modal')close()});document.addEventListener('keydown',function(event){if(event.key==='Escape')close()});var menuButton=document.querySelector('button[aria-label="Open menu"]');var mobileMenu=document.querySelector('[role="dialog"]');if(menuButton&&mobileMenu){var closeButton=mobileMenu.querySelector('button[aria-label="Close menu"]');var open=function(){mobileMenu.classList.remove('-translate-x-full','translate-x-full');menuButton.setAttribute('aria-expanded','true')};var closeMenu=function(){mobileMenu.classList.add(document.documentElement.dir==='rtl'?'translate-x-full':'-translate-x-full');menuButton.setAttribute('aria-expanded','false')};menuButton.addEventListener('click',open);if(closeButton)closeButton.addEventListener('click',closeMenu)}})();</script>`;

  return `<!DOCTYPE html><html lang="${copy.lang}" dir="${copy.dir}" class="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(
    copy.title
  )}</title><meta name="description" content="${escapeHtml(
    copy.meta
  )}"><link rel="stylesheet" href="/_next/static/chunks/3b8hwydtiy37e.css"><link rel="icon" href="/favicon.png"><style>${caseStudyCss}[hidden]{display:none!important}.case-shot:focus-visible{box-shadow:inset 0 0 0 2px #38BDF8}</style></head><body class="${copy.bodyClass}">${header}${main}${footer}${galleryScript}</body></html>`;
}

function buildWorkCardNode(lang) {
  const card = workCard[lang];
  return element(
    "div",
    {
      className:
        "group flex flex-col bg-[#111827] rounded-2xl overflow-hidden border border-white/5 hover:border-[#38BDF8]/30 transition-all hover:shadow-[0_10px_30px_rgba(56,189,248,0.05)] hover:-translate-y-1 relative"
    },
    [
      element("$L10", {
        href: card.href,
        className: "absolute inset-0 z-0",
        "aria-label": `View ${card.title}`,
        children: "$undefined"
      }),
      element(
        "div",
        {
          className:
            "relative aspect-[4/3] w-full bg-[#0B1020] overflow-hidden pointer-events-none"
        },
        [
          element("$L13", {
            src: "/projects/ashhalancarrental/home-en.jpg",
            alt: card.alt,
            fill: true,
            sizes:
              "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
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
        {
          className:
            "p-8 flex-1 flex flex-col relative z-10 pointer-events-none"
        },
        [
          element(
            "div",
            {
              className:
                "text-xs font-bold text-[#38BDF8] mb-3 uppercase tracking-widest"
            },
            card.category
          ),
          element(
            "h3",
            {
              className:
                "text-2xl font-bold mb-3 leading-snug group-hover:text-[#38BDF8] transition-colors"
            },
            card.title
          ),
          element(
            "p",
            {
              className:
                "text-[#94A3B8] text-sm leading-relaxed line-clamp-2"
            },
            card.description
          ),
          element(
            "div",
            { className: "pointer-events-auto" },
            element("$L14", {
              href: "https://ashhalancarrental.com",
              labelAr: "زيارة الموقع",
              labelEn: "Live Site",
              locale: card.locale,
              archiveHref: card.archiveHref
            })
          ),
          element(
            "div",
            { className: "mt-6 flex flex-wrap gap-2" },
            card.tags.map((tag) =>
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
    "ashhalancarrental"
  );
}

function buildFeaturedCardNode(lang) {
  const card = featuredCard[lang];
  return element(
    "$L10",
    {
      href: card.href,
      className:
        "group flex flex-col bg-[#111827] rounded-2xl overflow-hidden border border-white/5 hover:border-[#38BDF8]/30 transition-all hover:shadow-[0_10px_30px_rgba(56,189,248,0.05)] hover:-translate-y-1"
    },
    [
      element(
        "div",
        {
          className:
            "relative aspect-[4/3] w-full bg-[#0B1020] overflow-hidden flex items-center justify-center"
        },
        [
          element("$L26", {
            src: "/projects/ashhalancarrental/home-en.jpg",
            alt: card.alt,
            fill: true,
            sizes:
              "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
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
        { className: "p-8 flex-1 flex flex-col font-sans" },
        [
          element(
            "div",
            {
              className:
                "text-xs font-bold text-[#38BDF8] mb-3 uppercase tracking-widest"
            },
            card.category
          ),
          element(
            "h3",
            {
              className:
                "text-xl font-bold mb-3 leading-snug group-hover:text-[#38BDF8] transition-colors"
            },
            card.title
          ),
          element(
            "p",
            {
              className:
                "text-[#94A3B8] text-sm leading-relaxed flex-1 line-clamp-3"
            },
            card.description
          ),
          element(
            "div",
            { className: "mt-4 flex flex-wrap gap-1.5" },
            card.tags.map((tag, index) =>
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
            {
              className:
                "mt-6 flex items-center text-sm font-semibold text-white/70 group-hover:text-white transition-colors"
            },
            lang === "ar" ? "قراءة دراسة الحالة" : "Read Case Study"
          )
        ]
      )
    ],
    "ashhalancarrental"
  );
}

function replaceRawCardLine(value, marker, node) {
  const lines = value.split(/\r?\n/);
  const index = lines.findIndex(
    (line) => /^[0-9a-f]+:/.test(line) && line.includes(marker)
  );
  if (index === -1) {
    throw new Error(`Could not find card marker ${marker}`);
  }
  const id = lines[index].slice(0, lines[index].indexOf(":"));
  lines[index] = `${id}:${JSON.stringify(node)}`;
  return `${lines.join("\n").replace(/\n+$/, "")}\n`;
}

function replaceEmbeddedCardLine(html, marker, node) {
  const scriptPattern =
    /<script>self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")\]\)<\/script>/g;
  let replaced = false;
  const result = html.replace(scriptPattern, (full, encoded) => {
    let decoded;
    try {
      decoded = JSON.parse(encoded);
    } catch {
      return full;
    }
    if (!/^[0-9a-f]+:/.test(decoded) || !decoded.includes(marker)) {
      return full;
    }
    const id = decoded.slice(0, decoded.indexOf(":"));
    replaced = true;
    const nextLine = `${id}:${JSON.stringify(node)}\n`;
    return `<script>self.__next_f.push([1,${JSON.stringify(nextLine)}])</script>`;
  });
  if (!replaced) {
    throw new Error(`Could not find embedded card marker ${marker}`);
  }
  return result;
}

function findBalancedElement(html, markerIndex, tagName) {
  const startToken = `<${tagName}`;
  const endToken = `</${tagName}>`;
  const start = html.lastIndexOf(startToken, markerIndex);
  if (start === -1) {
    throw new Error(`Could not find opening ${tagName}`);
  }
  const tokenPattern = new RegExp(`<${tagName}(?:\\s|>)|<\\/${tagName}>`, "g");
  tokenPattern.lastIndex = start;
  let depth = 0;
  let match;
  while ((match = tokenPattern.exec(html))) {
    if (match[0].startsWith(`</`)) {
      depth -= 1;
      if (depth === 0) {
        return [start, tokenPattern.lastIndex];
      }
    } else {
      depth += 1;
    }
  }
  throw new Error(`Could not balance ${tagName}`);
}

function findBalancedElementAt(html, start, tagName) {
  const endToken = `</${tagName}>`;
  const tokenPattern = new RegExp(`<${tagName}(?:\\s|>)|${endToken}`, "g");
  tokenPattern.lastIndex = start;
  let depth = 0;
  let match;
  while ((match = tokenPattern.exec(html))) {
    if (match[0] === endToken) {
      depth -= 1;
      if (depth === 0) {
        return [start, tokenPattern.lastIndex];
      }
    } else {
      depth += 1;
    }
  }
  throw new Error(`Could not balance ${tagName} from the supplied start`);
}

function renderWorkCardHtml(lang) {
  const card = workCard[lang];
  return `<div class="group flex flex-col bg-[#111827] rounded-2xl overflow-hidden border border-white/5 hover:border-[#38BDF8]/30 transition-all hover:shadow-[0_10px_30px_rgba(56,189,248,0.05)] hover:-translate-y-1 relative"><a href="${card.href}/" class="absolute inset-0 z-0" aria-label="View ${escapeHtml(
    card.title
  )}"></a><div class="relative aspect-[4/3] w-full bg-[#0B1020] overflow-hidden pointer-events-none"><img src="/projects/ashhalancarrental/home-en.jpg" alt="${escapeHtml(
    card.alt
  )}" class="object-cover object-top opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" style="position:absolute;height:100%;width:100%;inset:0;color:transparent"><div class="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80"></div></div><div class="p-8 flex-1 flex flex-col relative z-10 pointer-events-none"><div class="text-xs font-bold text-[#38BDF8] mb-3 uppercase tracking-widest">${escapeHtml(
    card.category
  )}</div><h3 class="text-2xl font-bold mb-3 leading-snug group-hover:text-[#38BDF8] transition-colors">${escapeHtml(
    card.title
  )}</h3><p class="text-[#94A3B8] text-sm leading-relaxed line-clamp-2">${escapeHtml(
    card.description
  )}</p><div class="pointer-events-auto"><div class="flex items-center gap-3 mt-4"><a href="https://ashhalancarrental.com" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-sm font-semibold text-[#38BDF8] hover:text-[#38BDF8]/80 transition-colors">${
    lang === "ar" ? "زيارة الموقع" : "Live Site"
  }</a><a href="${card.archiveHref}/" class="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white transition-colors">${
    lang === "ar" ? "تصفح المشروع" : "View Case Study"
  }</a></div></div><div class="mt-6 flex flex-wrap gap-2">${card.tags
    .map(
      (tag) =>
        `<span class="text-xs font-semibold px-3 py-1.5 bg-[#1E293B] border border-white/5 rounded-md text-[#94A3B8]">${escapeHtml(
          tag
        )}</span>`
    )
    .join("")}</div></div></div>`;
}

function renderFeaturedCardHtml(lang) {
  const card = featuredCard[lang];
  return `<a class="group flex flex-col bg-[#111827] rounded-2xl overflow-hidden border border-white/5 hover:border-[#38BDF8]/30 transition-all hover:shadow-[0_10px_30px_rgba(56,189,248,0.05)] hover:-translate-y-1" href="${card.href}"><div class="relative aspect-[4/3] w-full bg-[#0B1020] overflow-hidden flex items-center justify-center"><img src="/projects/ashhalancarrental/home-en.jpg" alt="${escapeHtml(
    card.alt
  )}" class="object-cover object-top opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" style="position:absolute;height:100%;width:100%;inset:0;color:transparent"><div class="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80"></div></div><div class="p-8 flex-1 flex flex-col font-sans"><div class="text-xs font-bold text-[#38BDF8] mb-3 uppercase tracking-widest">${escapeHtml(
    card.category
  )}</div><h3 class="text-xl font-bold mb-3 leading-snug group-hover:text-[#38BDF8] transition-colors">${escapeHtml(
    card.title
  )}</h3><p class="text-[#94A3B8] text-sm leading-relaxed flex-1 line-clamp-3">${escapeHtml(
    card.description
  )}</p><div class="mt-4 flex flex-wrap gap-1.5">${card.tags
    .map(
      (tag) =>
        `<span class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#1F2937]/50 text-[#94A3B8] border border-white/5">${escapeHtml(
          tag
        )}</span>`
    )
    .join(
      ""
    )}</div><div class="mt-6 flex items-center text-sm font-semibold text-white/70 group-hover:text-white transition-colors">${
    lang === "ar" ? "قراءة دراسة الحالة" : "Read Case Study"
  }</div></div></a>`;
}

function updateListingHtml(relativePath, lang) {
  let html = read(relativePath);
  html = replaceEmbeddedCardLine(
    html,
    '"ashhalancarrental"',
    buildWorkCardNode(lang)
  );
  const marker = html.indexOf(`href="${workCard[lang].href}/"`);
  const start = html.lastIndexOf(
    '<div class="group flex flex-col',
    marker
  );
  const [, end] = findBalancedElementAt(html, start, "div");
  html = `${html.slice(0, start)}${renderWorkCardHtml(lang)}${html.slice(end)}`;
  write(relativePath, html);
}

function updateHomepageHtml(relativePath, lang) {
  let html = read(relativePath);
  html = replaceEmbeddedCardLine(
    html,
    '"ozone-clinic"',
    buildFeaturedCardNode(lang)
  );
  const marker = html.indexOf(
    'src="/projects/ozone-clinic/frontend/01-homepage-hero-desktop.png"'
  );
  const [start, end] = findBalancedElement(html, marker, "a");
  html = `${html.slice(0, start)}${renderFeaturedCardHtml(lang)}${html.slice(end)}`;
  write(relativePath, html);
}

function updateRawListingFiles(paths, lang) {
  for (const path of paths) {
    write(
      path,
      replaceRawCardLine(
        read(path),
        '"ashhalancarrental"',
        buildWorkCardNode(lang)
      )
    );
  }
}

function updateRawHomepageFiles(paths, lang) {
  for (const path of paths) {
    write(
      path,
      replaceRawCardLine(
        read(path),
        '"ozone-clinic"',
        buildFeaturedCardNode(lang)
      )
    );
  }
}

if (process.argv.includes("--repair-case-pages")) {
  for (const lang of ["en", "ar"]) {
    const base =
      lang === "ar"
        ? "ar/work/ashhalancarrental"
        : "work/ashhalancarrental";
    const pageFile =
      lang === "ar"
        ? `${base}/__next.ar/work/$d$slug/__PAGE__.txt`
        : `${base}/__next.!KGVuKQ/work/$d$slug/__PAGE__.txt`;
    const existingHtml = read(`${base}/index.html`);
    updateFullPayload(`${base}/index.txt`, lang);
    updateFullPayload(`${base}/__next._full.txt`, lang);
    updatePagePayload(pageFile, lang);
    updateHeadPayload(`${base}/__next._head.txt`, lang);
    write(`${base}/index.html`, renderStaticPage(lang, existingHtml));
  }
  console.log("Ashhalan Car Rental case-study pages repaired.");
} else if (process.argv.includes("--repair-listings")) {
  updateListingHtml("work/index.html", "en");
  updateListingHtml("ar/work/index.html", "ar");
  console.log("Ashhalan Car Rental listing HTML repaired.");
} else {
  for (const lang of ["en", "ar"]) {
    const base =
      lang === "ar"
        ? "ar/work/ashhalancarrental"
        : "work/ashhalancarrental";
    const pageFile =
      lang === "ar"
        ? `${base}/__next.ar/work/$d$slug/__PAGE__.txt`
        : `${base}/__next.!KGVuKQ/work/$d$slug/__PAGE__.txt`;
    const existingHtml = read(`${base}/index.html`);
    updateFullPayload(`${base}/index.txt`, lang);
    updateFullPayload(`${base}/__next._full.txt`, lang);
    updatePagePayload(pageFile, lang);
    updateHeadPayload(`${base}/__next._head.txt`, lang);
    write(`${base}/index.html`, renderStaticPage(lang, existingHtml));
  }

  updateRawListingFiles(
    [
      "work/index.txt",
      "work/__next._full.txt",
      "work/__next.!KGVuKQ/work/__PAGE__.txt"
    ],
    "en"
  );
  updateRawListingFiles(
    [
      "ar/work/index.txt",
      "ar/work/__next._full.txt",
      "ar/work/__next.ar/work/__PAGE__.txt"
    ],
    "ar"
  );
  updateListingHtml("work/index.html", "en");
  updateListingHtml("ar/work/index.html", "ar");

  updateRawHomepageFiles(
    ["index.txt", "__next._full.txt", "__next.!KGVuKQ/__PAGE__.txt"],
    "en"
  );
  updateRawHomepageFiles(
    ["ar/index.txt", "ar/__next._full.txt", "ar/__next.ar/__PAGE__.txt"],
    "ar"
  );
  updateHomepageHtml("index.html", "en");
  updateHomepageHtml("ar/index.html", "ar");

  console.log("Ashhalan Car Rental case study upgrade completed.");
}
