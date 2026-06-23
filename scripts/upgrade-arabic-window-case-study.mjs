import {
  cpSync,
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
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
  writeFileSync(pathInRoot(relativePath), value, "utf8");
  console.log(`Updated ${relativePath}`);
}

function cloneRoute(source, destination) {
  const target = pathInRoot(destination);
  if (existsSync(target)) rmSync(target, { recursive: true, force: true });
  cpSync(pathInRoot(source), target, { recursive: true });

  function rewrite(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = join(directory, entry.name);
      if (entry.isDirectory()) rewrite(file);
      else if (entry.isFile() && /\.(?:html|txt)$/.test(entry.name)) {
        const value = readFileSync(file, "utf8")
          .replaceAll("oryxbag", "arabic-window")
          .replaceAll("OryxBag E-Commerce Store", "Arabic Window Online Academy")
          .replaceAll("متجر OryxBag الإلكتروني", "أكاديمية Arabic Window التعليمية");
        writeFileSync(file, value, "utf8");
      }
    }
  }
  rewrite(target);
}

const sharedSource = read("scripts/upgrade-ashhalan-car-rental.mjs");
const cssMatch = sharedSource.match(/const caseStudyCss = `([\s\S]*?)`;/);
if (!cssMatch) throw new Error("Could not load case-study CSS");
const caseStudyCss = cssMatch[1];

const screenshotFiles = [
  ["01-home.jpg", "Academy Home Page", "الصفحة الرئيسية للأكاديمية"],
  ["02-courses.jpg", "Courses & Learning Programs", "صفحة الدورات والبرامج التعليمية"],
  ["05-about-us.jpg", "About the Academy", "صفحة التعريف بالأكاديمية"],
  ["06-why-us.jpg", "Why Arabic Window", "صفحة لماذا Arabic Window"],
  ["07-pricing.jpg", "Plans & Pricing", "صفحة الخطط والأسعار"],
  ["08-contact-us.jpg", "Contact & Enquiry Form", "صفحة التواصل والاستفسار"],
  ["09-register.jpg", "Student Registration", "صفحة تسجيل الطلاب"],
  ["10-checkout.jpg", "WooCommerce Checkout", "صفحة إتمام الدفع"]
];

const content = {
  en: {
    lang: "en",
    dir: "ltr",
    bodyClass:
      "inter_5901b7c6-module__ec5Qua__variable font-inter bg-[#05070D] text-[#F8FAFC] antialiased min-h-screen flex flex-col",
    title: "Arabic Window Online Academy",
    meta:
      "A WordPress and WooCommerce education platform for learning Arabic, Quran, and Islamic studies online, with course discovery, plans, registration, resources, and checkout.",
    category: "WordPress Education Platform / Online Learning & Enrollment",
    hero:
      "Arabic Window is an online academy for Arabic language, Quran, and Islamic studies. The website combines program discovery, educational landing pages, tiered learning plans, student registration, books and blog resources, contact journeys, and a WooCommerce checkout experience for learners in different countries.",
    liveLabel: "View Live Academy",
    problemTitle: "The Problem",
    problem:
      "The academy needed a clear digital platform capable of explaining several learning tracks to an international audience. Visitors had to understand the differences between Arabic, Quran, Islamic studies, and conversational-learning programs, compare plan options, build trust in the academy, submit detailed enrollment information, and complete an online purchase. The platform also needed to manage a large educational content library without making the learning journey feel fragmented.",
    solutionTitle: "The Solution",
    solution:
      "A structured WordPress and WooCommerce platform was implemented around the student journey. The homepage establishes the academy’s positioning, dedicated pages explain each learning area, course and pricing sections help visitors compare options, registration and contact forms collect the information needed for follow-up, and WooCommerce supports package selection and checkout. Books and blog listings extend the platform into a searchable educational resource hub.",
    deepDiveTitle: "Education Platform & Enrollment Experience",
    deepDiveIntro:
      "The website connects marketing content, educational resources, student qualification, and payment in one consistent experience.",
    sections: [
      {
        title: "Academy Home & Trust Building",
        text:
          "The homepage introduces the academy, its mission, learning categories, reach, instructors, and the main routes into the platform.",
        bullets: [
          "Clear academy positioning for international learners",
          "Arabic, Quran, Islamic studies, and conversational learning paths",
          "Academy goals, vision, mission, statistics, and instructor content",
          "Calls to action leading into programs, pricing, and registration"
        ]
      },
      {
        title: "Course & Program Discovery",
        text:
          "Programs are separated into focused journeys so visitors can understand what they will learn before registering.",
        bullets: [
          "Central courses overview with four major learning tracks",
          "Dedicated Arabic, Quran, Islamic studies, and conversational pages",
          "Program benefits, learning approach, supporting media, and enquiry actions",
          "Consistent navigation between learning options"
        ]
      },
      {
        title: "Plans, Pricing & Package Selection",
        text:
          "Tiered monthly plans present different study-hour packages and give learners a direct route toward enrollment.",
        bullets: [
          "Starter, standard, advanced, professional, and masterclass options",
          "Monthly study hours and plan pricing",
          "Feature comparison and clear add-to-cart actions",
          "WooCommerce products representing learning-hour packages"
        ]
      },
      {
        title: "Student Registration & Qualification",
        text:
          "A detailed registration form captures the context required to match each student with the right course and schedule.",
        bullets: [
          "Contact details, country, WhatsApp number, and residence",
          "Course interest, current level, and learning goals",
          "Adult or child selection and preferred weekly schedule",
          "Trial-lesson and follow-up information"
        ]
      },
      {
        title: "WooCommerce Checkout",
        text:
          "Learning packages can move from pricing into a familiar e-commerce checkout with order details and payment choices.",
        bullets: [
          "Selected learning package and order summary",
          "Billing information and learner contact fields",
          "Debit and credit card payment option",
          "PayPal option, totals, privacy notice, and order confirmation path"
        ]
      },
      {
        title: "Books & Educational Content",
        text:
          "The books and blog sections give the academy a long-term content layer beyond its paid programs.",
        bullets: [
          "Islamic books and Arabic learning resource listings",
          "Educational articles across Arabic, Quran, Islam, and learning topics",
          "Category labels, featured imagery, dates, and reading paths",
          "Content designed to support discovery and organic search"
        ]
      },
      {
        title: "Responsive Global Experience",
        text:
          "The interface keeps navigation, course comparison, forms, and checkout usable across desktop and mobile screens.",
        bullets: [
          "Responsive page sections and program cards",
          "Readable long-form educational content",
          "Mobile-friendly forms and commerce journey",
          "Persistent contact routes and social media access"
        ]
      }
    ],
    featuresTitle: "Key Features",
    features: [
      "Custom WordPress education website",
      "WooCommerce learning-package products",
      "Arabic, Quran, Islamic studies, and conversational-learning programs",
      "Dedicated educational landing pages",
      "Tiered monthly pricing plans",
      "Detailed student registration form",
      "Contact and course enquiry journeys",
      "Books and educational blog archives",
      "WooCommerce cart and checkout",
      "Card and PayPal payment choices",
      "Responsive desktop and mobile layouts",
      "International contact and country fields",
      "Instructor and academy trust content",
      "Social media and WhatsApp integration",
      "SEO-friendly content structure"
    ],
    rolesTitle: "My Role",
    roles: [
      "WordPress Developer",
      "WooCommerce Developer",
      "Frontend Developer",
      "Education UX Implementation",
      "Content Architecture",
      "Responsive UI Development"
    ],
    stackTitle: "Tech Stack",
    stack: [
      "WordPress",
      "WooCommerce",
      "PHP",
      "HTML5",
      "CSS3",
      "JavaScript",
      "Responsive UI",
      "WooCommerce Products",
      "Cart / Checkout",
      "Payment Integration",
      "Registration Forms",
      "Content Management",
      "SEO-friendly Structure"
    ],
    screenshotTitle: "Project Screenshots",
    fullPage: "Full page",
    hover: "Hover to scroll preview",
    tap: "Tap to view",
    ctaTitle: "Need an education platform with enrollment and payments?",
    ctaText:
      "I can help structure programs, content, registration, pricing, and checkout into one clear WordPress learning experience.",
    ctaButton: "Start a Similar Project"
  },
  ar: {
    lang: "ar",
    dir: "rtl",
    bodyClass:
      "cairo_eb32b749-module__msiTQW__variable font-cairo bg-[#05070D] text-[#F8FAFC] antialiased min-h-screen flex flex-col",
    title: "أكاديمية Arabic Window التعليمية",
    meta:
      "منصة تعليمية مبنية على WordPress وWooCommerce لتعليم العربية والقرآن والدراسات الإسلامية، مع البرامج والخطط والتسجيل والمحتوى والدفع.",
    category: "منصة تعليمية WordPress / تعلم وتسجيل ودفع أونلاين",
    hero:
      "Arabic Window أكاديمية تعليمية أونلاين للغة العربية والقرآن الكريم والدراسات الإسلامية. يجمع الموقع بين اكتشاف البرامج، وصفحات التعلم المتخصصة، والخطط والأسعار، وتسجيل الطلاب، ومكتبة الكتب والمدونة، والتواصل، وتجربة WooCommerce لإتمام شراء الباقات للطلاب من دول مختلفة.",
    liveLabel: "زيارة الأكاديمية",
    problemTitle: "المشكلة",
    problem:
      "احتاجت الأكاديمية إلى منصة رقمية واضحة تشرح عدة مسارات تعليمية لجمهور دولي. كان على الزائر فهم الفرق بين برامج العربية والقرآن والدراسات الإسلامية والمحادثة، ومقارنة الخطط، والتعرف على الأكاديمية، وإرسال بيانات التسجيل التفصيلية، ثم إتمام شراء الباقة أونلاين. كما احتاجت المنصة إلى إدارة مكتبة كبيرة من المحتوى التعليمي دون تشتيت رحلة الطالب.",
    solutionTitle: "الحل",
    solution:
      "تم تنفيذ منصة WordPress وWooCommerce منظمة حول رحلة الطالب. تقدم الصفحة الرئيسية الأكاديمية ومساراتها، وتشرح الصفحات المتخصصة كل مجال تعليمي، وتساعد أقسام الدورات والأسعار في مقارنة الخيارات، وتجمع نماذج التسجيل والتواصل البيانات اللازمة للمتابعة، بينما يدعم WooCommerce اختيار الباقات وإتمام الدفع. وتضيف صفحات الكتب والمدونة مركزًا للمصادر التعليمية داخل المنصة.",
    deepDiveTitle: "بنية المنصة التعليمية وتجربة التسجيل",
    deepDiveIntro:
      "يربط الموقع المحتوى التسويقي والمصادر التعليمية وتأهيل الطالب واختيار الباقة والدفع ضمن تجربة واحدة متسقة.",
    sections: [
      {
        title: "الصفحة الرئيسية وبناء الثقة",
        text:
          "تعرّف الصفحة الرئيسية بالأكاديمية ورسالتها ومساراتها التعليمية وانتشارها والمدرسين وطرق الدخول إلى المنصة.",
        bullets: [
          "تقديم واضح للأكاديمية للطلاب من دول مختلفة",
          "مسارات العربية والقرآن والدراسات الإسلامية والمحادثة",
          "الأهداف والرؤية والرسالة والإحصائيات ومحتوى المدرسين",
          "دعوات واضحة للدورات والأسعار والتسجيل"
        ]
      },
      {
        title: "اكتشاف الدورات والبرامج",
        text:
          "تم فصل البرامج إلى رحلات واضحة تساعد الزائر على فهم ما سيتعلمه قبل التسجيل.",
        bullets: [
          "صفحة مركزية لأربعة مسارات تعليمية رئيسية",
          "صفحات مستقلة للعربية والقرآن والدراسات الإسلامية والمحادثة",
          "المميزات وطريقة التعلم والمحتوى المرئي وإجراءات الاستفسار",
          "تنقل متسق بين خيارات التعلم"
        ]
      },
      {
        title: "الخطط والأسعار واختيار الباقة",
        text:
          "تعرض الخطط الشهرية مستويات مختلفة لساعات الدراسة وتوجه الطالب مباشرة إلى شراء الباقة.",
        bullets: [
          "باقات Starter وStandard وAdvanced وProfessional وMasterclass",
          "ساعات الدراسة الشهرية وسعر كل خطة",
          "مقارنة الخصائص وأزرار الإضافة للسلة",
          "منتجات WooCommerce تمثل باقات الساعات التعليمية"
        ]
      },
      {
        title: "تسجيل الطلاب وتأهيل الطلب",
        text:
          "يجمع نموذج التسجيل المعلومات اللازمة لاختيار الدورة والجدول المناسبين لكل طالب.",
        bullets: [
          "بيانات التواصل والدولة وواتساب ومكان الإقامة",
          "مجال الاهتمام والمستوى الحالي والهدف التعليمي",
          "تحديد بالغ أو طفل والجدول الأسبوعي المفضل",
          "بيانات الدرس التجريبي والمتابعة"
        ]
      },
      {
        title: "إتمام الدفع عبر WooCommerce",
        text:
          "تنتقل الباقة التعليمية من صفحة الأسعار إلى Checkout واضح يعرض الطلب وبيانات الدفع.",
        bullets: [
          "الباقة المختارة وملخص الطلب",
          "بيانات الفوترة والتواصل مع الطالب",
          "الدفع ببطاقات الخصم والائتمان",
          "PayPal والإجمالي وسياسة الخصوصية ومسار تأكيد الطلب"
        ]
      },
      {
        title: "الكتب والمحتوى التعليمي",
        text:
          "تضيف صفحات الكتب والمدونة طبقة محتوى مستمرة إلى جانب البرامج المدفوعة.",
        bullets: [
          "قوائم كتب إسلامية ومصادر لتعلم العربية",
          "مقالات حول العربية والقرآن والإسلام والتعلم",
          "تصنيفات وصور وتواريخ ومسارات قراءة واضحة",
          "بنية محتوى تدعم الاكتشاف والبحث العضوي"
        ]
      },
      {
        title: "تجربة عالمية متجاوبة",
        text:
          "تحافظ الواجهة على سهولة التنقل ومقارنة الدورات وملء النماذج والدفع في الديسكتوب والموبايل.",
        bullets: [
          "أقسام وبطاقات برامج متجاوبة",
          "قراءة مريحة للمحتوى التعليمي الطويل",
          "نماذج وتجربة شراء مناسبة للموبايل",
          "وسائل تواصل وروابط اجتماعية سهلة الوصول"
        ]
      }
    ],
    featuresTitle: "أهم المميزات",
    features: [
      "موقع تعليمي مخصص مبني على WordPress",
      "منتجات باقات تعليمية عبر WooCommerce",
      "برامج العربية والقرآن والدراسات الإسلامية والمحادثة",
      "صفحات هبوط تعليمية مستقلة",
      "خطط أسعار شهرية متعددة",
      "نموذج تسجيل طلاب تفصيلي",
      "مسارات تواصل واستفسار عن الدورات",
      "مكتبة كتب ومدونة تعليمية",
      "سلة وCheckout عبر WooCommerce",
      "خيارات دفع بالبطاقات وPayPal",
      "تصميم متجاوب للديسكتوب والموبايل",
      "حقول دولية للتواصل والدول",
      "محتوى لبناء الثقة في الأكاديمية والمدرسين",
      "دمج واتساب ومنصات التواصل",
      "بنية محتوى مناسبة لمحركات البحث"
    ],
    rolesTitle: "دوري في المشروع",
    roles: [
      "مطوّر WordPress",
      "مطوّر WooCommerce",
      "مطوّر Frontend",
      "تنفيذ تجربة المنصة التعليمية",
      "هندسة وتنظيم المحتوى",
      "تطوير الواجهات المتجاوبة"
    ],
    stackTitle: "التقنيات المستخدمة",
    stack: [
      "WordPress",
      "WooCommerce",
      "PHP",
      "HTML5",
      "CSS3",
      "JavaScript",
      "Responsive UI",
      "WooCommerce Products",
      "Cart / Checkout",
      "Payment Integration",
      "Registration Forms",
      "Content Management",
      "SEO-friendly Structure"
    ],
    screenshotTitle: "صور المشروع",
    fullPage: "صفحة كاملة",
    hover: "مرر المؤشر لمشاهدة الصفحة",
    tap: "اضغط للعرض",
    ctaTitle: "تحتاج منصة تعليمية للتسجيل والدفع؟",
    ctaText:
      "أساعدك في تنظيم البرامج والمحتوى والتسجيل والأسعار والدفع داخل تجربة WordPress تعليمية واضحة.",
    ctaButton: "ابدأ مشروعًا مشابهًا"
  }
};

function element(type, props = {}, children, key = null) {
  const nextProps = { ...props };
  if (children !== undefined) nextProps.children = children;
  return ["$", type, key, nextProps];
}

function bulletList(items, feature = false) {
  return element(
    "ul",
    { className: feature ? "case-feature-list text-[#94A3B8]" : "case-bullet-list text-[#94A3B8]" },
    items.map((item, index) =>
      element("li", { className: "case-bullet-item" }, [
        element("span", { className: "case-bullet-dot rounded-full bg-[#38BDF8]" }),
        element("span", { className: "case-bullet-text" }, item)
      ], String(index))
    )
  );
}

function screenshots() {
  return screenshotFiles.map(([file, enTitle, arTitle]) => ({
    src: `/projects/arabic-window/full-page/${file}`,
    alt: {
      en: `Arabic Window Online Academy — ${enTitle}`,
      ar: `أكاديمية Arabic Window التعليمية — ${arTitle}`
    },
    title: { en: enTitle, ar: arTitle },
    isFullPage: true
  }));
}

function buildPageTree(lang, galleryRef) {
  const copy = content[lang];
  const technicalCards = copy.sections.map((section, index) =>
    element("article", {
      className:
        "case-tech-card bg-[#111827] border border-white/5 rounded-2xl hover:border-[#38BDF8]/25 transition-colors"
    }, [
      element("div", {
        className:
          "case-card-number w-10 h-10 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center font-extrabold"
      }, String(index + 1).padStart(2, "0")),
      element("h3", { className: "case-card-title font-bold text-white" }, section.title),
      element("p", { className: "case-card-copy text-[#94A3B8]" }, section.text),
      bulletList(section.bullets)
    ], String(index))
  );

  const aside = element("aside", {
    className: "case-sidebar bg-[#111827] rounded-2xl border border-white/5 h-fit shadow-lg sticky top-24"
  }, [
    element("div", {}, [
      element("h3", {
        className: "case-sidebar-heading font-bold uppercase tracking-widest text-[#94A3B8]"
      }, copy.rolesTitle),
      element("ul", { className: "case-role-list" },
        copy.roles.map((role, index) =>
          element("li", { className: "case-role-item font-semibold text-[#F8FAFC]" }, role, String(index))
        )
      )
    ]),
    element("div", {}, [
      element("h3", {
        className: "case-sidebar-heading font-bold uppercase tracking-widest text-[#94A3B8]"
      }, copy.stackTitle),
      element("div", { className: "case-stack flex flex-wrap" },
        copy.stack.map((item, index) =>
          element("span", {
            className:
              "case-stack-item px-3 py-2 bg-[#1E293B] text-xs font-semibold rounded-md border border-white/5 text-[#94A3B8]"
          }, item, String(index))
        )
      )
    ]),
    element("div", { className: "case-sidebar-cta border-t border-white/5" },
      element("a", {
        href: lang === "ar" ? "/ar/contact/" : "/contact/",
        className:
          "case-primary-button block w-full text-center bg-[#38BDF8] text-[#0B1020] font-bold text-base rounded-lg"
      }, copy.ctaButton)
    )
  ]);

  return element("div", { className: "case-study-page" }, [
    element("style", { dangerouslySetInnerHTML: { __html: caseStudyCss } }),
    element("header", { className: "case-hero" }, [
      element("div", {
        className:
          "case-kicker inline-block rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-sm font-bold text-[#38BDF8] uppercase tracking-widest text-center"
      }, copy.category),
      element("h1", { className: "case-title font-extrabold" }, copy.title),
      element("p", { className: "case-lead text-[#94A3B8]" }, copy.hero),
      element("div", { className: "case-hero-action flex items-center justify-center" },
        element("a", {
          href: "https://arabicwindow.com/",
          target: "_blank",
          rel: "noopener noreferrer",
          className:
            "case-primary-button inline-flex bg-[#22C55E] text-white font-bold text-lg rounded-lg"
        }, copy.liveLabel)
      )
    ]),
    element("div", {
      className:
        "case-hero-media relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#111827]"
    }, element("img", {
      src: "/projects/arabic-window/full-page/01-home.jpg",
      alt: copy.title,
      className: "w-full h-full object-cover object-top",
      loading: "eager"
    })),
    element("div", { className: "case-overview-grid" }, [
      element("div", { className: "case-main-content" }, [
        element("section", {
          className: "case-copy-panel bg-[#111827]/60 border border-white/5 rounded-2xl"
        }, [
          element("h2", { className: "case-section-title font-bold" }, copy.problemTitle),
          element("p", { className: "case-body-copy text-[#94A3B8]" }, copy.problem)
        ]),
        element("section", {
          className: "case-copy-panel bg-[#111827]/60 border border-white/5 rounded-2xl"
        }, [
          element("h2", { className: "case-section-title font-bold" }, copy.solutionTitle),
          element("p", { className: "case-body-copy text-[#94A3B8]" }, copy.solution)
        ]),
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
    element("section", {
      className: "case-cta text-center bg-[#111827] border border-[#38BDF8]/20 rounded-2xl"
    }, [
      element("h2", { className: "case-cta-title font-bold" }, copy.ctaTitle),
      element("p", { className: "case-cta-copy text-[#94A3B8]" }, copy.ctaText),
      element("a", {
        href: lang === "ar" ? "/ar/contact/" : "/contact/",
        className:
          "case-primary-button inline-flex rounded-xl bg-[#38BDF8] text-[#0B1020] font-bold text-lg"
      }, copy.ctaButton)
    ])
  ]);
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
  value = updateLine(value, "d", [
    ["$", "title", "0", { children: copy.title }],
    ["$", "meta", "1", { name: "description", content: copy.meta }],
    ["$", "link", "2", { rel: "shortcut icon", href: "/favicon.png" }],
    ["$", "link", "3", {
      rel: "icon",
      href: "/favicon.ico?favicon.2vob68tjqpejf.ico",
      sizes: "256x256",
      type: "image/x-icon"
    }],
    ["$", "link", "4", { rel: "icon", href: "/favicon.png" }],
    ["$", "link", "5", { rel: "apple-touch-icon", href: "/favicon.png" }],
    ["$", "$L19", "6", {}]
  ]);
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
    .map((item) =>
      `<li class="case-bullet-item"><span class="case-bullet-dot rounded-full bg-[#38BDF8]"></span><span class="case-bullet-text">${escapeHtml(item)}</span></li>`
    )
    .join("")}</ul>`;
}

function renderGallery(lang) {
  const copy = content[lang];
  return `<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">${screenshotFiles.map(([file, enTitle, arTitle]) => {
    const title = lang === "ar" ? arTitle : enTitle;
    return `<article class="case-shot-card flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#111827] shadow-lg"><button type="button" class="case-shot relative block w-full text-left rtl:text-right outline-none cursor-zoom-in" style="height:420px;overflow:hidden;flex-shrink:0" data-src="/projects/arabic-window/full-page/${file}" data-title="${escapeHtml(title)}"><img src="/projects/arabic-window/full-page/${file}" alt="${escapeHtml(title)}" loading="lazy" style="width:100%;height:auto;display:block;transform:translateY(0);transition:transform 1.5s ease-in-out;will-change:transform"><div aria-hidden="true" style="position:absolute;bottom:0;left:0;right:0;height:90px;background:linear-gradient(to top,rgba(17,24,39,.96),transparent);pointer-events:none"></div><span class="absolute top-3 right-3 px-2.5 py-1.5 bg-black/60 border border-white/15 text-white/70 text-xs font-semibold rounded-lg">${copy.fullPage}</span><span class="absolute bottom-3 left-1/2 px-3 py-1.5 bg-black/70 border border-white/10 rounded-full text-white/70 text-xs font-medium" style="transform:translateX(-50%);white-space:nowrap"><span class="hidden md:inline">${copy.hover}</span><span class="md:hidden">${copy.tap}</span></span></button><div><p class="case-shot-title text-white font-semibold text-base">${escapeHtml(title)}</p></div></article>`;
  }).join("")}</div>`;
}

function extractTag(html, tagName) {
  const start = html.indexOf(`<${tagName}`);
  const end = html.indexOf(`</${tagName}>`, start);
  return html.slice(start, end + tagName.length + 3);
}

function renderStaticPage(lang, sourceHtml) {
  const copy = content[lang];
  const header = extractTag(sourceHtml, "header");
  const footer = extractTag(sourceHtml, "footer");
  const cards = copy.sections.map((section, index) =>
    `<article class="case-tech-card bg-[#111827] border border-white/5 rounded-2xl"><div class="case-card-number w-10 h-10 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center font-extrabold">${String(index + 1).padStart(2, "0")}</div><h3 class="case-card-title font-bold text-white">${escapeHtml(section.title)}</h3><p class="case-card-copy text-[#94A3B8]">${escapeHtml(section.text)}</p>${renderBullets(section.bullets)}</article>`
  ).join("");
  const roles = copy.roles.map((role) =>
    `<li class="case-role-item font-semibold text-[#F8FAFC]">${escapeHtml(role)}</li>`
  ).join("");
  const stack = copy.stack.map((item) =>
    `<span class="case-stack-item px-3 py-2 bg-[#1E293B] text-xs font-semibold rounded-md border border-white/5 text-[#94A3B8]">${escapeHtml(item)}</span>`
  ).join("");

  const main = `<main class="flex-1" style="max-width:100vw;overflow-x:hidden"><div class="case-study-page"><header class="case-hero"><div class="case-kicker inline-block rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-sm font-bold text-[#38BDF8] uppercase tracking-widest text-center">${escapeHtml(copy.category)}</div><h1 class="case-title font-extrabold">${escapeHtml(copy.title)}</h1><p class="case-lead text-[#94A3B8]">${escapeHtml(copy.hero)}</p><div class="case-hero-action"><a href="https://arabicwindow.com/" target="_blank" rel="noopener noreferrer" class="case-primary-button inline-flex bg-[#22C55E] text-white font-bold text-lg rounded-lg">${escapeHtml(copy.liveLabel)}</a></div></header><div class="case-hero-media relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#111827]"><img src="/projects/arabic-window/full-page/01-home.jpg" alt="${escapeHtml(copy.title)}" class="w-full h-full object-cover object-top"></div><div class="case-overview-grid"><div class="case-main-content"><section class="case-copy-panel bg-[#111827]/60 border border-white/5 rounded-2xl"><h2 class="case-section-title font-bold">${escapeHtml(copy.problemTitle)}</h2><p class="case-body-copy text-[#94A3B8]">${escapeHtml(copy.problem)}</p></section><section class="case-copy-panel bg-[#111827]/60 border border-white/5 rounded-2xl"><h2 class="case-section-title font-bold">${escapeHtml(copy.solutionTitle)}</h2><p class="case-body-copy text-[#94A3B8]">${escapeHtml(copy.solution)}</p></section><section class="case-deep-dive"><div><h2 class="case-section-title font-bold">${escapeHtml(copy.deepDiveTitle)}</h2><p class="case-section-intro text-[#94A3B8]">${escapeHtml(copy.deepDiveIntro)}</p></div><div class="case-tech-grid">${cards}</div></section><section class="case-features"><h2 class="case-section-title font-bold">${escapeHtml(copy.featuresTitle)}</h2>${renderBullets(copy.features, true)}</section></div><aside class="case-sidebar bg-[#111827] rounded-2xl border border-white/5 h-fit shadow-lg sticky top-24"><div><h3 class="case-sidebar-heading font-bold uppercase tracking-widest text-[#94A3B8]">${escapeHtml(copy.rolesTitle)}</h3><ul class="case-role-list">${roles}</ul></div><div><h3 class="case-sidebar-heading font-bold uppercase tracking-widest text-[#94A3B8]">${escapeHtml(copy.stackTitle)}</h3><div class="case-stack flex flex-wrap">${stack}</div></div><div class="case-sidebar-cta border-t border-white/5"><a href="${lang === "ar" ? "/ar/contact/" : "/contact/"}" class="case-primary-button block w-full text-center bg-[#38BDF8] text-[#0B1020] font-bold rounded-lg">${escapeHtml(copy.ctaButton)}</a></div></aside></div><section class="case-screenshots"><h2 class="case-section-title font-bold">${escapeHtml(copy.screenshotTitle)}</h2>${renderGallery(lang)}</section><section class="case-cta text-center bg-[#111827] border border-[#38BDF8]/20 rounded-2xl"><h2 class="case-cta-title font-bold">${escapeHtml(copy.ctaTitle)}</h2><p class="case-cta-copy text-[#94A3B8]">${escapeHtml(copy.ctaText)}</p><a href="${lang === "ar" ? "/ar/contact/" : "/contact/"}" class="case-primary-button inline-flex rounded-xl bg-[#38BDF8] text-[#0B1020] font-bold text-lg">${escapeHtml(copy.ctaButton)}</a></section></div></main>`;

  const closeLabel = lang === "ar" ? "إغلاق" : "Close";
  const modal = `<div id="case-modal" hidden style="position:fixed;inset:0;z-index:100;background:rgba(2,6,23,.94);padding:24px;overflow:auto"><button id="case-modal-close" type="button" aria-label="${closeLabel}" style="position:fixed;top:18px;right:18px;z-index:101;width:44px;height:44px;border-radius:999px;background:#111827;color:white;border:1px solid rgba(255,255,255,.2);font-size:25px;cursor:pointer">×</button><img id="case-modal-image" alt="" style="display:block;max-width:1400px;width:100%;height:auto;margin:50px auto 20px;border-radius:16px"></div><script>(function(){document.querySelectorAll('.case-shot').forEach(function(button){var image=button.querySelector('img');button.addEventListener('mouseenter',function(){var d=Math.max(0,image.getBoundingClientRect().height-button.clientHeight);image.style.transitionDuration=Math.max(1.8,Math.min(18,d/420))+'s';image.style.transform='translateY(-'+d+'px)'});button.addEventListener('mouseleave',function(){image.style.transitionDuration='1.1s';image.style.transform='translateY(0)'});button.addEventListener('click',function(){var modal=document.getElementById('case-modal'),target=document.getElementById('case-modal-image');target.src=button.dataset.src;target.alt=button.dataset.title;modal.hidden=false;document.body.style.overflow='hidden'})});function close(){document.getElementById('case-modal').hidden=true;document.body.style.overflow=''}document.getElementById('case-modal-close').addEventListener('click',close);document.getElementById('case-modal').addEventListener('click',function(e){if(e.target.id==='case-modal')close()});document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});var menuButton=document.querySelector('button[aria-label="Open menu"],button[aria-label="افتح القائمة"]'),menu=document.querySelector('[role="dialog"]');if(menuButton&&menu){var closeButton=menu.querySelector('button[aria-label="Close menu"],button[aria-label="أغلق القائمة"]');menuButton.addEventListener('click',function(){menu.classList.remove('-translate-x-full','translate-x-full');menuButton.setAttribute('aria-expanded','true')});if(closeButton)closeButton.addEventListener('click',function(){menu.classList.add(document.documentElement.dir==='rtl'?'translate-x-full':'-translate-x-full');menuButton.setAttribute('aria-expanded','false')})}})();</script>`;

  return `<!DOCTYPE html><html lang="${copy.lang}" dir="${copy.dir}" class="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(copy.title)}</title><meta name="description" content="${escapeHtml(copy.meta)}"><link rel="stylesheet" href="/_next/static/chunks/3b8hwydtiy37e.css"><link rel="stylesheet" href="/scripts/portfolio-effects.css" data-portfolio-effects="style"><link rel="icon" href="/favicon.png"><style>${caseStudyCss}[hidden]{display:none!important}</style></head><body class="${copy.bodyClass}">${header}${main}${footer}${modal}<script src="/scripts/portfolio-effects.js" defer data-portfolio-effects="script"></script></body></html>`;
}

function updateListingNode(relativePath, lineId, lang) {
  const lines = read(relativePath).split(/\r?\n/);
  const index = lines.findIndex((line) => line.startsWith(`${lineId}:`));
  if (index === -1) throw new Error(`Missing ${lineId} in ${relativePath}`);
  const node = JSON.parse(lines[index].slice(lineId.length + 1));
  const description = lang === "ar"
    ? "منصة تعليم أونلاين مبنية على WordPress وWooCommerce لتعليم العربية والقرآن والدراسات الإسلامية، مع الدورات والخطط والتسجيل والمحتوى والدفع."
    : "A WordPress and WooCommerce online academy for Arabic, Quran, and Islamic studies, with course discovery, plans, registration, educational resources, and checkout.";
  function walk(value) {
    if (Array.isArray(value)) {
      if (value[0] === "$" && value[3]?.src === "/projects/arabic-window/cover.png") {
        value[3].src = "/projects/arabic-window/full-page/01-home.jpg";
      }
      if (
        value[0] === "$" &&
        value[1] === "p" &&
        typeof value[3]?.className === "string" &&
        value[3].className.includes("line-clamp-2")
      ) {
        value[3].children = description;
      }
      if (typeof value[3]?.href === "string" && value[3].href.includes("arabic-window.com")) {
        value[3].href = value[3].href.replace("arabic-window.com", "arabicwindow.com");
      }
      value.forEach(walk);
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(walk);
    }
  }
  walk(node);
  lines[index] = `${lineId}:${JSON.stringify(node)}`;
  write(relativePath, `${lines.join("\n").replace(/\n+$/, "")}\n`);
}

function updateListingHtml(relativePath, lang) {
  let html = read(relativePath);
  const description = lang === "ar"
    ? "منصة تعليم أونلاين مبنية على WordPress وWooCommerce لتعليم العربية والقرآن والدراسات الإسلامية، مع الدورات والخطط والتسجيل والمحتوى والدفع."
    : "A WordPress and WooCommerce online academy for Arabic, Quran, and Islamic studies, with course discovery, plans, registration, educational resources, and checkout.";
  html = html
    .replaceAll("/projects/arabic-window/cover.png", "/projects/arabic-window/full-page/01-home.jpg")
    .replaceAll("https://arabic-window.com", "https://arabicwindow.com")
    .replace(
      lang === "ar"
        ? "أكاديمية تعليمية متخصصة لتعليم اللغة العربية والقرآن الكريم لغير الناطقين بها، تتميز بتصنيف المناهج وسهولة حجز الدروس التعليمية."
        : "A professional Islamic online academy for Arabic, Quran, and Islamic studies, featuring structured course discovery and high-authority education services.",
      description
    );
  write(relativePath, html);
}

function replaceEmbeddedLine(html, id, rawLine) {
  const pattern = /<script>self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")\]\)<\/script>/g;
  return html.replace(pattern, (full, encoded) => {
    let decoded;
    try { decoded = JSON.parse(encoded); } catch { return full; }
    if (!decoded.startsWith(`${id}:`)) return full;
    return `<script>self.__next_f.push([1,${JSON.stringify(`${rawLine}\n`)}])</script>`;
  });
}

function syncEmbedded(relativeHtml, relativeRaw, lineId) {
  const rawLine = read(relativeRaw).split(/\r?\n/).find((line) => line.startsWith(`${lineId}:`));
  write(relativeHtml, replaceEmbeddedLine(read(relativeHtml), lineId, rawLine));
}

cloneRoute("work/oryxbag", "work/arabic-window");
cloneRoute("ar/work/oryxbag", "ar/work/arabic-window");

for (const lang of ["en", "ar"]) {
  const base = lang === "ar" ? "ar/work/arabic-window" : "work/arabic-window";
  const pagePayload = lang === "ar"
    ? `${base}/__next.ar/work/$d$slug/__PAGE__.txt`
    : `${base}/__next.!KGVuKQ/work/$d$slug/__PAGE__.txt`;
  updateFullPayload(`${base}/index.txt`, lang);
  updateFullPayload(`${base}/__next._full.txt`, lang);
  updatePagePayload(pagePayload, lang);
  updateHeadPayload(`${base}/__next._head.txt`, lang);
  write(`${base}/index.html`, renderStaticPage(lang, read(`${base}/index.html`)));
}

for (const [lang, prefix] of [["en", ""], ["ar", "ar/"]]) {
  updateListingNode(`${prefix}work/index.txt`, "2b", lang);
  updateListingNode(`${prefix}work/__next._full.txt`, "2b", lang);
  updateListingNode(
    lang === "ar"
      ? "ar/work/__next.ar/work/__PAGE__.txt"
      : "work/__next.!KGVuKQ/work/__PAGE__.txt",
    "1b",
    lang
  );
  updateListingHtml(`${prefix}work/index.html`, lang);
  syncEmbedded(`${prefix}work/index.html`, `${prefix}work/index.txt`, "2b");
}

await import("./add-portfolio-effects.mjs");
console.log("Arabic Window case study upgraded.");
