#  نظام تحليل شحنات Speedaf & Speedo

نظام Back-End وواجهة مستخدم بلغة Node.js و Express و EJS لمعالجة ملفات Excel وتحليل بيانات الشحن الخاصة بشركتي **Speedaf** و **Speedo**، مع حفظ النتائج واستعراضها بطريقة منظمة وجذابة.

---

##  الفكرة الأساسية

- رفع ملفي Excel من Speedaf وSpeedo.
- دمج وتحليل البيانات بناءً على رقم البوليصة (Waybill No).
- حساب العمولة، الشحن، الربح، التوريد، والتحصيل تلقائيًا.
- دعم أنواع الشحن المختلفة مثل: `Collected`, `Returned`, `Abnormal signed`.
- استخراج ملف Excel جديد يحتوي على النتائج.
- عرض النتائج مباشرة في واجهة HTML مع دعم التصفية حسب اسم المرسل.
- حفظ العمليات في قاعدة بيانات MongoDB.
- عرض السجل الكامل في صفحة `/history`.

---

##  التقنيات المستخدمة

- **Node.js** + **Express.js**
- **EJS** لعرض البيانات في HTML
- **Multer** لمعالجة رفع الملفات
- **xlsx** لتحليل ملفات Excel
- **MongoDB** + **Mongoose** لحفظ البيانات
- **Bootstrap 5** لتنسيق الواجهة

---

 التوثيق - Documentation 
 المسارات (Routes)
المسار	الطريقة	الوظيفة
/	GET	عرض صفحة رفع الملفات
/upload	POST	رفع الملفين ومعالجتهما وتوليد ملف Excel جديد
/history	GET	عرض جميع العمليات السابقة المحفوظة في MongoDB

 بنية البيانات (Report Schema)
js
Copy code
{
  waybill: String,
  sender: String,
  receiver: String,
  type: String,         // Collected | Returned | Abnormal signed
  weight: Number,
  shipping: Number,
  commission: Number,
  total: Number,
  collection: Number,
  supply: Number,
  profit: Number,
  fuel: Number,
  typeColor: String,    
  createdAt: Date
}
 واجهة الاستخدام (Frontend UI)
 رفع ملفين Excel من خلال <form>.

عرض النتائج مباشرة في جدول.

 تصفية النتائج حسب اسم العميل.

 عرض محصلة:

التوريد (supply)

الربح (profit)

التحصيل (collection)

زر "عرض الكل".

 زر "عرض السجل" لعرض صفحة /history.

 عمليات المعالجة (Backend Logic)
يتم دمج الصفوف بناءً على رقم البوليصة.

بناءً على type:

Collected:

COD → total

Freight → commission

Chargeable weight > 3 → إضافة 10 لكل كيلو زائد إلى الشحن

تلوين الصف بالأخضر

Returned:

Claim Amount → total

حساب الشحن بناءً على اسم المرسل (قواعد مخصصة)

تلوين الصف بالبرتقالي

Abnormal signed:

total = Claim Amount

shipping = 0

تلوين الصف بالأحمر

يتم حساب:

supply = total - commission

profit = shipping - commission

collection = total - shipping

 التنزيل التلقائي (Excel Export)
بعد المعالجة، يتم توليد ملف processed.xlsx يحتوي على نفس الأعمدة.

يتم تحميله تلقائيًا للمستخدم عبر fetch و blob.


المطور
 أحمد مختار

https://www.linkedin.com/in/ahmd-mukhtar/

 الترخيص
speddo courier services

https://www.facebook.com/Speedo.2016