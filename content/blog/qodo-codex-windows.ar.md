تثبيت أداة تساعد في مراجعة الكود خطوة، وإثبات قدرتها على مراجعة مستودع فعلي خطوة أخرى.

ظهر هذا الفرق بوضوح أثناء إعداد Qodo مع Codex على Windows. أصبح Qodo CLI بالإصدار 2.1.0 متاحًا، ونجح التحقق من الحساب واكتشاف الأدوات. لكن محاولة المراجعة المحلية اللاحقة فشلت لأن Qodo لم يتمكن من الحصول على بيانات اعتماد المستودع. لذلك تحققت بعض مراحل الإعداد، ولم تتوفر نتيجة مراجعة مكتملة يمكن تقييمها.

يجمع هذا الدليل بين النتيجة الفعلية وإجراءات الإعداد الموثقة رسميًا، ويوضح ما يثبته كل فحص، وكيفية تشخيص مشكلة اكتشاف الأمر في Windows، ومتى يجب التوقف عند تعذر الوصول إلى المستودع.

## 1. افصل بين مكونات التكامل

تضيف **إضافة Qodo** مسارات عمل للإعداد وفهم المشروع والمراجعة. وتشغّل **واجهة Qodo CLI** التكامل المحلي. أما **المصادقة** فتحدد حساب Qodo، في حين تحدد صلاحيات المستودع إمكانية وصول الخدمة إلى المشروع المطلوب. تثبيت أحد المكونات لا يثبت جاهزية المكونات الأخرى. [توثيق تكامل Qodo مع Codex](https://docs.qodo.ai/agentic-toolbox/codex-plugin)

يمكن متابعة الجاهزية عبر خمس مراحل مستقلة:

**تثبيت الإضافة ← تشغيل CLI ← التحقق من الحساب ← اكتشاف الأدوات المطلوبة ← اكتمال المراجعة**

يركز هذا المقال على مسار CLI في Windows. تدعم Qodo أيضًا الاتصال عبر MCP، وله مسار منفصل للمصادقة والتحقق. [مهارة الإعداد الرسمية](https://github.com/qodo-ai/qodo-skills/blob/main/codex-packages/qodo/skills/qodo-setup/SKILL.md)

## 2. ثبّت الإضافة وافحص المتطلبات

من تطبيق سطح المكتب، افتح Codex ثم **Plugins**، وابحث عن **Qodo** وثبّتها. وفي Codex CLI، يفتح الأمر `/plugins` متصفح الإضافات. ابدأ محادثة أو جلسة CLI جديدة بعد التثبيت لتحميل المهارات المرفقة. [توثيق إضافات OpenAI](https://learn.chatgpt.com/docs/plugins)

ستحتاج كذلك إلى PowerShell وحساب Qodo ومستودع Git لمرحلة المراجعة. افحص إصدار Node.js:

```powershell
node --version
```

تذكر صفحة تثبيت CLI إصدار Node.js 20 أو أحدث، بينما يحدد مرجع الإعداد المتخصص **20.6.0 أو أحدث**؛ لذا اتبع المتطلب الأدق. وتشترط مهارة الإعداد حاليًا Qodo CLI 2.0.0 أو أحدث قبل المصادقة. هذه متطلبات توافق، وليست ادعاءً بأنها أحدث الإصدارات المتاحة. [تثبيت CLI](https://docs.qodo.ai/agentic-toolbox/cli)، [مرجع بيئة التشغيل](https://github.com/qodo-ai/qodo-skills/blob/main/codex-packages/qodo/skills/qodo-setup/references/runtime.md)

## 3. ثبّت نسخة جرى التحقق من مصدرها

إذا كنت تفضل إعدادًا موجهًا، فاطلب من Codex استخدام `$qodo-setup` واتباع الفحوص الحالية في المهارة المثبتة. ويوضح المسار اليدوي التالي كيفية التحقق من برنامج التثبيت.

تعرض صفحة CLI العامة أمرًا لتنزيل برنامج التثبيت وتشغيله مباشرة عبر PowerShell. أما مهارة الإعداد الحالية فتحدد برنامج تثبيت برابط ثابت، مع التحقق من البصمة وفحص الملف قبل التنفيذ. يتبع المثال التالي هذا المسار في **Qodo Cloud**. وللنشر الخاص بالمؤسسات، استخدم رابط التثبيت والبصمة وعنوان تسجيل الدخول التي توفرها المؤسسة. [إجراء التثبيت الرسمي](https://github.com/qodo-ai/qodo-skills/blob/main/codex-packages/qodo/skills/qodo-setup/references/runtime.md)

نُشرت البصمة التالية في مرجع الإعداد الرسمي الذي راجعته بتاريخ 3 نوفمبر 2026:

```powershell
$qodoHash = 'b0386d363d07e62384d099ddf41347f48cc1e80ed842c2916fb181c9356ed96e'
$qodoUrl = "https://get.qodo.ai/installers/$qodoHash/install.ps1"
$qodoTemp = Join-Path $env:TEMP ("qodo-setup-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $qodoTemp -ErrorAction Stop | Out-Null
$qodoInstaller = Join-Path $qodoTemp 'install.ps1'

Invoke-WebRequest -Uri $qodoUrl -OutFile $qodoInstaller -ErrorAction Stop
$qodoActualHash = (Get-FileHash -LiteralPath $qodoInstaller -Algorithm SHA256).Hash
if ($qodoActualHash -ne $qodoHash) {
    throw 'Installer checksum mismatch. Stop without running it.'
}

notepad.exe $qodoInstaller
```

بعد مراجعة محتوى الملف، شغّل الملف المحفوظ نفسه وفق سياسة التنفيذ المعتمدة على جهازك:

```powershell
powershell.exe -NoProfile -File $qodoInstaller
```

إذا منعت السياسة التنفيذ، عالج ذلك عبر الإجراء المعتمد في مؤسستك. لا تستبدل الملف بتنزيل مختلف ولا تتجاوز فشل التحقق من البصمة. هذه خطوات مستندة إلى التوثيق؛ ولا يعني عرضها أنني أعدت تنفيذ هذا المسار المعدّل أثناء تحديث المقال.

## 4. شخّص خطأ «qodo is not recognized»

خلال الإعداد الأصلي، لم يتمكن PowerShell من التعرف على الأمر `qodo` بعد التثبيت. ترث العملية متغيرات البيئة من العملية التي شغّلتها؛ لذلك قد تحتفظ نافذة الطرفية أو تطبيق سطح المكتب المفتوح بقيمة قديمة لمتغير `PATH`. يمكن أن تساعد إعادة فتح الطرفية، والتطبيق الذي شغّلها عند الحاجة، في تحميل البيئة المحدّثة. [Microsoft: متغيرات البيئة](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables?view=powershell-7.5)

للتثبيت الافتراضي الذي يتضمن ملفًا تنفيذيًا أصليًا، افحص المسار ثم جرّب التشغيل المباشر:

```powershell
$qodoExe = Join-Path $env:USERPROFILE '.qodo\bin\qodo.exe'
Test-Path -LiteralPath $qodoExe
& $qodoExe --version
```

استخدم هذا المثال بعد التأكد من أن الملف يتبع التثبيت المتوقع. وإذا ضُبط `QODO_HOME` صراحة، فافحص ذلك المسار بدلًا منه. وعند غياب الملف التنفيذي الأصلي، ارجع إلى مرجع الإعداد لمعرفة نقطة التشغيل المدعومة عبر Node.

نجاح الاستدعاء المباشر مع فشل `qodo --version` يشير إلى مشكلة اكتشاف الأمر. لكنه لا يثبت نجاح المصادقة أو صلاحية المراجعة. يمكنك متابعة الفحوص بالملف التنفيذي الذي تحققت منه دون الحاجة إلى تعديل دائم لمتغير `PATH`.

## 5. تحقّق من الحساب ثم اكتشاف الأدوات

بعد التحقق من الملف التنفيذي في المثال السابق، نفّذ الفحوص بالترتيب:

```powershell
& $qodoExe --version
& $qodoExe read whoami --json
& $qodoExe tools --refresh --json
```

نفّذ أمر جلب قائمة الأدوات بعد نجاح فحص الهوية فقط، ثم تأكد من وجود الإمكانية المطلوبة للمهمة. قد تضيف المهارة المثبتة معاملات تتعلق بإصدارها وتوزيعها والتطبيق المضيف؛ ويجب أخذ هذه القيم منها. إذا نجحت المصادقة وفشل تحديث القائمة، فسجّل خطأ الوصول إلى الأدوات؛ لا تفترض تلقائيًا ضرورة تسجيل الدخول من جديد. [فحوص الإعداد الرسمية](https://github.com/qodo-ai/qodo-skills/blob/main/codex-packages/qodo/skills/qodo-setup/SKILL.md)

إذا أفاد فحص الهوية صراحة بأنك غير مسجل الدخول إلى Qodo Cloud، استخدم `& $qodoExe login`، وأكمل الإجراء في المتصفح، ثم أعد فحص الهوية. حافظ على عنوان تسجيل الدخول المعتمد في بيئات المؤسسات الأخرى.

يمكن توجيه Codex بهذا الطلب:

```text
Use $qodo-setup to check the Qodo runtime, account identity,
and relevant tool availability.
Do not change project files.
Report each verified stage and preserve any exact error.
Do not describe tool discovery as a completed review.
```

## 6. جهّز مراجعة فعلية

ترسل أداة Reviewer فروق شجرة العمل والملفات الجديدة غير المتتبعة والسياق الذي تقدمه إلى خدمة المراجعة. يمكن أن تظل تعديلاتك المحلية دون commit أو push، لكن يجب أن يكون commit المرجعي متاحًا عبر مزود Git، مع صلاحية الوصول إلى المستودع. تحقق من السماح بمشاركة الكود والسياق قبل إرسال أعمال تخص عميلًا أو مؤسسة. [توثيق Reviewer](https://docs.qodo.ai/agentic-toolbox/agentic-toolbox-codebase-review-skill)

حدّد الفرع المستهدف، واستخدم نقطة الأصل المشتركة بينه وبين `HEAD`، أي merge-base، أساسًا للمقارنة. أرفق غرض التغيير وقيوده المعروفة، وافحص المعاملات المتاحة في نسختك عبر `qodo review --help`. [مسار المراجعة الرسمي](https://github.com/qodo-ai/qodo-skills/blob/main/codex-packages/qodo/skills/qodo-review/SKILL.md)

عندما تكون المراجعة مأذونًا بها، يمكن استخدام الطلب التالي:

```text
Use $qodo-review to review the current local changes.
Resolve the correct remote comparison base and include the
change's purpose, decisions, and completed checks as context.
Focus on correctness, security, regressions, and edge cases.
Do not edit files, commit, push, or deploy.
If access fails, report the exact error and stop.
```

## 7. سجّل النتيجة الفعلية بوضوح

لم تكتمل محاولة المراجعة المحلية في هذه التجربة. وأعادت الرسالة التالية:

```text
Qodo could not obtain repository credentials for the current workspace. Check the active workspace and repository connection; if those are correct, contact support before starting another review. Do not automatically start another attempt.
```

تحدد الرسالة المرحلة التي فشلت، لكنها لا تثبت السبب الجذري. الخطوة التالية هي فحص مساحة عمل Qodo المختارة واتصال المستودع، ثم التواصل مع الدعم إذا كانا صحيحين. هذه النتيجة لا تبرر تكرار تسجيل الدخول أو إعادة المراجعة تلقائيًا.

| الفحص | النتيجة المرصودة | ما تثبته |
|---|---|---|
| إصدار CLI | 2.1.0 | إمكانية تشغيل النسخة المثبتة |
| مصادقة الحساب | نجحت | الحساب مصادق عليه |
| اكتشاف الأدوات | نجح | الأدوات قابلة للاكتشاف في ذلك السياق |
| المراجعة المحلية | فشلت بسبب بيانات اعتماد المستودع | لا توجد نتيجة مراجعة مكتملة |

بناءً على ذلك، لا يوجد هنا دليل على خلو التغييرات من المشكلات، أو عدد الملاحظات التي قد تكتشفها Qodo، أو جودة نتائجها مقارنة بمراجعة Codex.

## 8. اجعل مرحلة الفشل أساس التشخيص

| العَرَض | الفحص التالي المفيد |
|---|---|
| عدم التعرف على الأمر | التحقق من مسار التثبيت وتجربة الملف التنفيذي مباشرة |
| الإضافة مثبتة والمهارات لا تظهر | بدء محادثة أو جلسة Codex جديدة والتحقق من تفعيل الإضافة |
| نجاح الهوية وفشل قائمة الأدوات | الاحتفاظ برسالة الخطأ وفحص الإمكانات والصلاحيات |
| تعذر الحصول على بيانات اعتماد المستودع | فحص مساحة العمل واتصال المستودع والالتزام بطلب التوقف الوارد في الرسالة |
| ظهور `closed_preview` أو قيد وصول صريح | اتباع شرط الوصول المذكور؛ تكرار الطلب لن يغيّر صلاحية غير متاحة |

الصف الأخير يصف خطأ محتملًا تتعامل معه مهارة المراجعة؛ وهو **ليس** الخطأ الذي ظهر في هذه التجربة. [معالجة أخطاء المراجعة](https://github.com/qodo-ai/qodo-skills/blob/main/codex-packages/qodo/skills/qodo-review/SKILL.md)

الدرس العملي بالنسبة لي هو ربط كل مرحلة بدليلها. نجاح تسجيل الدخول خطوة مفيدة، لكنه لا يحل محل نتيجة مراجعة مكتملة للمستودع. وقد تضيف مراجعة الذكاء الاصطناعي منظورًا آخر إلى العمل، مع بقاء الاختبارات وفحص التكامل والحكم الهندسي مسؤوليات مستقلة.

*هذا دليل تقني مستقل يستند إلى المصادر الرسمية وأدلة الإعداد الموضحة، ولا يمثل توثيقًا صادرًا عن Qodo.*

## المصادر الرسمية

- [Qodo: التثبيت مع Codex](https://docs.qodo.ai/agentic-toolbox/codex-plugin)
- [Qodo: تثبيت Agentic Toolbox CLI](https://docs.qodo.ai/agentic-toolbox/cli)
- [Qodo: مصدر مهارة الإعداد](https://github.com/qodo-ai/qodo-skills/blob/main/codex-packages/qodo/skills/qodo-setup/SKILL.md)
- [Qodo: بيئة التشغيل والتحقق من برنامج التثبيت](https://github.com/qodo-ai/qodo-skills/blob/main/codex-packages/qodo/skills/qodo-setup/references/runtime.md)
- [Qodo: توثيق Reviewer](https://docs.qodo.ai/agentic-toolbox/agentic-toolbox-codebase-review-skill)
- [Qodo: مصدر مهارة المراجعة](https://github.com/qodo-ai/qodo-skills/blob/main/codex-packages/qodo/skills/qodo-review/SKILL.md)
- [OpenAI: الإضافات في ChatGPT وCodex](https://learn.chatgpt.com/docs/plugins)
- [Microsoft: متغيرات البيئة في PowerShell](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables?view=powershell-7.5)
