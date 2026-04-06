# Musahm Vault - Frontend Implementation Guide

## 📋 Overview
جميع endpoints من Backend قد تم ربطها بالـ Frontend مع صفحات عمل كاملة وفعالة.

---

## 🚀 كيفية الوصول للصفحات الجديدة

### من خلال الـ Sidebar:
1. **Search Vault** (`/search`)
   - ابحث عن المستندات باستخدام كلمات مفتاحية
   - ابحث بشكل دلالي عن معاني المستندات
   - اسأل Vault أسئلة (Ask Vault - RAG)

2. **Tasks** (`/tasks`)
   - أنشئ ومدير المهام
   - عيّن الأولويات (منخفضة، متوسطة، عالية)
   - تتبع حالة المهام

3. **Activities** (`/activities`)
   - سجّل الأنشطة والعمليات
   - اتبع تاريخ الأنشطة
   - قم بتحديث أو حذف الأنشطة

4. **Obligations** (`/obligations`)
   - تتبع الالتزامات والمواعيد النهائية
   - عرض الالتزامات القادمة (7 أيام)
   - تنبيهات للعناصر المتأخرة

5. **Workflows** (`/workflows`)
   - عرّف خطوات العمل
   - أدر حالات العمل
   - تابع تقدم العمليات

6. **Extraction Review** (`/extractions`)
   - راجع البيانات المستخرجة بواسطة الذكاء الاصطناعي
   - وافق أو رفض الاستخراجات
   - عرض درجات الثقة

7. **Invitations** (`/invitations`)
   - اقبل أو ارفض دعوات المساحات
   - تابع حالة الدعوات

8. **Agent Actions** (`/agent-actions`)
   - راجع الإجراءات المقترحة من الوكيل
   - وافق أو رفض الإجراءات
   - عرض المصادر والتفاصيل

9. **Audit Logs** (`/audit-logs`)
   - اعرض سجلات التدقيق الكاملة
   - صفّي حسب الإجراء والتاريخ
   - تتبع جميع العمليات على النظام

---

## 📊 قائمة الـ API Endpoints

### Document Management
```
GET    /api/documents              - الحصول على جميع المستندات
GET    /api/documents/{id}         - الحصول على مستند معين
POST   /api/documents              - إنشاء مستند
PUT    /api/documents/{id}         - تحديث مستند
DELETE /api/documents/{id}         - حذف مستند
POST   /api/documents/upload       - رفع ملف
GET    /api/documents/{id}/download - تحميل مستند
GET    /api/documents/{id}/preview - معاينة المستند
```

### Document Versions
```
GET    /api/documentversions              - جميع النسخ
POST   /api/documentversions/upload       - رفع نسخة جديدة
GET    /api/documentversions/{id}/download - تحميل نسخة
```

### Document Access Control
```
GET    /api/documentacls        - قوائم التحكم بالوصول
POST   /api/documentacls        - منح الوصول
PUT    /api/documentacls/{id}   - تحديث الصلاحيات
DELETE /api/documentacls/{id}   - إلغاء الوصول
```

### AI Extraction
```
GET    /api/documentextractions/pending  - الاستخراجات المعلقة
PUT    /api/documentextractions/{id}/approve  - الموافقة على الاستخراج
PUT    /api/documentextractions/{id}/reject   - رفض الاستخراج
```

### Workspace Management
```
GET    /api/workspaces              - جميع المساحات
POST   /api/workspaces             - إنشاء مساحة جديدة
PUT    /api/workspaces/{id}        - تحديث المساحة
DELETE /api/workspaces/{id}        - حذف المساحة
```

### Workspace Members
```
GET    /api/workspacemembers           - أعضاء المساحة
POST   /api/workspacemembers/invite   - دعوة عضو
PUT    /api/workspacemembers/{id}/role - تغيير الدور
DELETE /api/workspacemembers/{id}     - إزالة العضو
```

### Invitations
```
GET    /api/invitations/pending        - الدعوات المعلقة
POST   /api/invitations/{id}/accept    - قبول الدعوة
POST   /api/invitations/{id}/decline   - رفض الدعوة
```

### Tasks
```
GET    /api/tasks            - جميع المهام
POST   /api/tasks           - إنشاء مهمة
PUT    /api/tasks/{id}      - تحديث المهمة
DELETE /api/tasks/{id}      - حذف المهمة
GET    /api/tasks/my-tasks  - مهامي
PUT    /api/tasks/{id}/complete - تحديد المهمة كمكتملة
```

### Activities
```
GET    /api/activities        - جميع الأنشطة
POST   /api/activities       - تسجيل نشاط
PUT    /api/activities/{id}  - تحديث النشاط
DELETE /api/activities/{id}  - حذف النشاط
```

### Obligations
```
GET    /api/obligations              - جميع الالتزامات
POST   /api/obligations             - إنشاء التزام
PUT    /api/obligations/{id}        - تحديث الالتزام
DELETE /api/obligations/{id}        - حذف الالتزام
GET    /api/obligations/upcoming    - الالتزامات القادمة
```

### Workflows
```
GET    /api/workflows        - جميع العمليات
POST   /api/workflows       - إنشاء عملية
PUT    /api/workflows/{id}  - تحديث العملية
DELETE /api/workflows/{id}  - حذف العملية
```

### Workflow Instances
```
GET    /api/workflowinstances        - حالات العمليات
POST   /api/workflowinstances       - إنشاء حالة
PUT    /api/workflowinstances/{id}  - تحديث الحالة
DELETE /api/workflowinstances/{id}  - حذف الحالة
```

### Search
```
POST /api/search/keyword  - بحث حسب الكلمات المفتاحية
POST /api/search/semantic - بحث دلالي
POST /api/search/ask      - اسأل Vault (RAG)
```

### Agent Actions
```
GET    /api/agentactionlogs/pending    - الإجراءات المعلقة
POST   /api/agentactionlogs/{id}/approve - الموافقة
POST   /api/agentactionlogs/{id}/reject  - الرفض
```

### Audit Logs
```
GET /api/auditlogs - سجلات التدقيق
```

### Profiles
```
GET         /api/profiles          - بيانات الملف الشخصي
POST        /api/profiles/update   - تحديث الملف الشخصي
POST        /api/profiles/change-password - تغيير كلمة المرور
```

### Authentication
```
POST /api/auth/login          - تسجيل الدخول
POST /api/auth/register       - إنشاء حساب جديد
POST /api/auth/forget-password - استرجاع كلمة المرور
POST /api/auth/reset-password - إعادة تعيين كلمة المرور
```

---

## 🎨 صفحات العرض

### 1️⃣ Search Vault (`/search`)
**الميزات:**
- ثلاث أنماط بحث: Keyword، Semantic، Ask
- عرض النتائج مع درجات المطابقة
- عرض المصادر والاستشهادات للإجابات
- واجهة تفاعلية سريعة

**الاستخدام:**
```
- اكتب الاستعلام
- اختر نوع البحث
- اضغط البحث أو Enter
- اعرض النتائج والمصادر
```

### 2️⃣ Tasks (`/tasks`)
**الميزات:**
- إنشاء/تحرير/حذف المهام
- تحديد الأولوية والحالة
- بحث سريع عن المهام
- عرض شبكة من المهام

**الحقول:**
- العنوان
- الوصف
- الأولوية (منخفضة/متوسطة/عالية)
- الحالة (معلقة/قيد التنفيذ/مكتملة)
- تاريخ الاستحقاق

### 3️⃣ Activities (`/activities`)
**الميزات:**
- تسجيل الأنشطة
- تحديث وحذف الأنشطة
- تصفية حسب الكلمات المفتاحية
- تتبع تاريخ النشاط

### 4️⃣ Obligations (`/obligations`)
**الميزات:**
- إدارة الالتزامات والمواعيد
- تصفية: الكل / القادمة (7 أيام)
- تحذيرات للعناصر المتأخرة
- عرض الأيام المتبقية

**المؤشرات الحية:**
- 🔴 متأخرة (أحمر)
- 🟠 عاجلة (برتقالي) - 3 أيام أو أقل
- 🟡 قريبة (أصفر) - أكثر من 3 أيام

### 5️⃣ Workflows (`/workflows`)
**الميزات:**
- تعريف العمليات
- إدارة الحالات (مسودة/نشطة/مؤرشفة)
- عرض عدد الخطوات
- تحديث وحذف العمليات

### 6️⃣ Extraction Review (`/extractions`)
**الميزات:**
- قائمة الاستخراجات المعلقة
- عرض درجات الثقة الملونة
  - 🟢 عالية (90%+)
  - 🟡 متوسطة (70-90%)
  - 🔴 منخفضة (<70%)
- عرض الحقول المستخرجة
- موافقة/رفض الاستخراجات

### 7️⃣ Invitations (`/invitations`)
**الميزات:**
- عرض الدعوات المعلقة
- قبول/رفض الدعوات
- عرض تاريخ انتهاء الصلاحية
- تصفية حسب الحالة

### 8️⃣ Agent Actions (`/agent-actions`)
**الميزات:**
- قائمة الإجراءات المعلقة
- عرض المصادر والتفاصيل
- موافقة/رفض الإجراءات
- تتبع من أطلق الإجراء

### 9️⃣ Audit Logs (`/audit-logs`)
**الميزات:**
- جدول شامل للعمليات
- تصفية حسب:
  - نوع الإجراء
  - نطاق التاريخ
  - المستخدم
  - نوع الكيان
- عرض عنوان IP وفي الأصل

---

## 🔐 الأمان والمصادقة

### ✅ كل الصفحات محمية
- تتطلب تسجيل دخول
- استخدام Auth Context
- الرموز المميزة تُحفظ في localStorage

### ✅ التفويض
- دور قائم على الوصول
- قوائم تحكم بالوصول (ACLs)
- تتبع جميع الإجراءات

---

## 🛠️ المتطلبات التقنية

### Dependencies المطلوبة:
- `react-router-dom` - للتوجيه
- `lucide-react` - للرموز
- `axios` - لـ HTTP requests
- Context API - للحالة العامة

---

## 📚 هيكل الملفات

```
src/
├── api/
│   ├── activities.ts
│   ├── tasks.ts
│   ├── obligations.ts
│   ├── workflows.ts
│   ├── search.ts
│   ├── documentExtractions.ts
│   ├── invitations.ts
│   ├── agentActionLogs.ts
│   ├── auditLogs.ts
│   └── ... (APIs أخرى)
├── pages/
│   ├── Activities.tsx
│   ├── Tasks.tsx
│   ├── Obligations.tsx
│   ├── Workflows.tsx
│   ├── SearchVault.tsx
│   ├── ExtractionReview.tsx
│   ├── Invitations.tsx
│   ├── AgentActions.tsx
│   ├── AuditLogs.tsx
│   └── ... (صفحات أخرى)
├── styles/
│   ├── CommonList.css
│   └── Search.css
├── components/
│   └── Sidebar.tsx (محدثة)
└── App.tsx (محدثة)
```

---

## 🚀 خطوات البدء

1. **تأكد من تشغيل Backend:**
   ```
   Base URL: https://api-s2.vault.musahm.com
   ```

2. **ابدأ التطبيق:**
   ```bash
   npm run dev
   ```

3. **قم بتسجيل الدخول:**
   - اذهب إلى `/login`
   - أدخل بيانات الاعتماد

4. **وصول الصفحات الجديدة:**
   - من الـ Sidebar انقر على الروابط الجديدة
   - أو ادخل المسارات مباشرة

---

## 🐛 استكشاف الأخطاء

### الخطأ: "Network Error"
- تأكد من تشغيل Backend
- تحقق من CORS headers

### الخطأ: "Unauthorized"
- قم بتسجيل الدخول مجددًا
- تحقق من انتهاء الرمز المميز

### الخطأ: "Page Not Found"
- تحقق من الـ URL
- تأكد من إضافة المسار في App.tsx

---

## 📝 ملاحظات التطوير

- جميع الـ APIs مع TypeScript Interfaces
- معالجة الأخطاء مضمنة
- رسائل تحميل وحالات فارغة
- Responsive design لجميع الأجهزة
- Dark mode support (في المستقبل)

---

## 📞 الدعم

للمساعدة أو الأسئلة، تابع التوثيق في:
- Backend: `/Backend/Vault/API/Controllers/`
- Frontend: `/Frontend/apps/web/src/api/`

---

**آخر تحديث:** 12 يناير 2026
**الإصدار:** 1.0
