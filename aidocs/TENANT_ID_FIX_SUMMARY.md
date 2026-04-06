# إصلاح مشكلة Tenant ID - ملخص التحديثات

## المشكلة
```
Could not find tenant ID. Please log in again.
```

المستخدم كان يحصل على هذا الخطأ عند محاولة إنشاء workspace جديد رغم أنه مسجل دخول.

## السبب الجذري
نظام Musahm Authentication API يستخدم **`CompanyId`** في JWT token كـ tenant identifier، وليس `tenantId`.

الكود القديم كان يبحث عن:
```typescript
decoded?.tenantId || decoded?.tenant_id || decoded?.TenantId
```

لكن Token الفعلي يحتوي على:
```json
{
  "Id": "123",
  "CompanyId": "456",
  "exp": 1234567890,
  ...
}
```

## الحل

### 1. إنشاء Token Utilities (✨ جديد)
ملف: `Frontend/apps/web/src/utils/tokenUtils.ts`

دوال مساعدة شاملة للتعامل مع JWT tokens:
- ✅ `getTenantIdFromToken()` - يبحث عن `CompanyId` أولاً
- ✅ `getUserIdFromToken()` - يبحث عن `Id` أولاً
- ✅ `getUserEmailFromToken()`
- ✅ `isTokenExpired()`
- ✅ `getAllTokenClaims()`
- ✅ Logging تلقائي للـ debugging

### 2. تحديث Sidebar Component
ملف: `Frontend/apps/web/src/components/Sidebar.tsx`

**التغييرات:**
- ✅ استبدال الدوال المحلية بـ `tokenUtils`
- ✅ إضافة logging لمساعدة في debugging
- ✅ تحسين error messages

**قبل:**
```typescript
const getTenantIdFromToken = (): string | null => {
  const decoded = decodeToken(token);
  return decoded?.tenantId || decoded?.tenant_id || decoded?.TenantId || null;
};
```

**بعد:**
```typescript
import { getTenantIdFromToken, getUserIdFromToken } from '../utils/tokenUtils';

// الدالة الآن في tokenUtils.ts وتبحث عن CompanyId
const tenantId = getTenantIdFromToken(); // ✅ تعمل الآن
```

### 3. إنشاء TokenDebug Component (✨ جديد)
ملف: `Frontend/apps/web/src/components/TokenDebug.tsx`

Component للتطوير يعرض:
- ✅ حالة Token (Active/Expired)
- ✅ Tenant ID المستخرج
- ✅ User ID المستخرج
- ✅ Email المستخرج
- ✅ جميع Token claims
- ✅ قائمة بـ claim keys المتاحة

### 4. إضافة Tests (✨ جديد)
ملف: `Frontend/apps/web/src/utils/tokenUtils.test.ts`

اختبارات يمكن تشغيلها في browser console:
```javascript
// في browser console
tokenTests.runAll() // تشغيل جميع الاختبارات
tokenTests.getTenantId() // اختبار tenant ID فقط
```

### 5. التوثيق (✨ جديد)
- `Frontend/apps/web/src/utils/README_TOKEN_UTILS.md` - دليل استخدام كامل
- `WORKSPACE_ADD_DOCUMENTATION.md` - محدث بمعلومات الإصلاح

## الملفات المحدثة

### جديدة (4 ملفات)
1. ✨ `Frontend/apps/web/src/utils/tokenUtils.ts`
2. ✨ `Frontend/apps/web/src/components/TokenDebug.tsx`
3. ✨ `Frontend/apps/web/src/utils/tokenUtils.test.ts`
4. ✨ `Frontend/apps/web/src/utils/README_TOKEN_UTILS.md`

### معدلة (2 ملفات)
1. 🔧 `Frontend/apps/web/src/components/Sidebar.tsx`
2. 🔧 `WORKSPACE_ADD_DOCUMENTATION.md`

## كيفية الاختبار

### 1. اختبار أساسي
```typescript
// في browser console
import { getTenantIdFromToken } from './utils/tokenUtils';

const tenantId = getTenantIdFromToken();
console.log('Tenant ID:', tenantId); // يجب أن يعرض ID وليس null
```

### 2. اختبار شامل
```typescript
// افتح أي صفحة وشغل في console
window.tokenTests.runAll()
```

### 3. اختبار UI
```tsx
// أضف TokenDebug في أي صفحة
import TokenDebug from './components/TokenDebug';

<TokenDebug />
```

### 4. اختبار إنشاء Workspace
1. سجل دخول
2. افتح Sidebar
3. اضغط "إضافة مساحة عمل"
4. املأ البيانات
5. اضغط "إضافة"
6. ✅ يجب أن يعمل بدون خطأ "Could not find tenant ID"

## Token Claims المتوقعة

### من Musahm API
```json
{
  "Id": "user_id_here",          // ← User ID
  "CompanyId": "company_id_here", // ← Tenant ID ⭐
  "exp": 1234567890,
  "iat": 1234567890,
  // ... claims أخرى
}
```

### ترتيب البحث في tokenUtils

**للـ Tenant ID:**
1. `CompanyId` ⭐ (Primary)
2. `companyId`
3. `company_id`
4. `tenantId`
5. `tenant_id`
6. `TenantId`

**للـ User ID:**
1. `Id` ⭐ (Primary)
2. `id`
3. `ID`
4. `sub`
5. `userId`
6. `user_id`

## الفوائد

### 1. مركزية
- ✅ دوال token في مكان واحد
- ✅ سهولة الصيانة
- ✅ إعادة استخدام في components مختلفة

### 2. Debugging
- ✅ Logging تلقائي
- ✅ TokenDebug component
- ✅ Test functions في console

### 3. المرونة
- ✅ يبحث عن claim names متعددة
- ✅ يعمل مع أنظمة authentication مختلفة
- ✅ Error handling محسّن

### 4. التوثيق
- ✅ README شامل
- ✅ أمثلة واضحة
- ✅ JSDoc comments

## الاستخدام في المستقبل

يمكن استخدام `tokenUtils` في أي component يحتاج token data:

```typescript
import { getTenantIdFromToken, getUserIdFromToken } from '@/utils/tokenUtils';

// في أي component
const tenantId = getTenantIdFromToken();
const userId = getUserIdFromToken();

// استخدمها في API calls
await api.post('/api/documents', {
  tenantId,
  createdBy: userId,
  ...data
});
```

## ملاحظات مهمة

1. ⚠️ **Production**: لا تُسجل token كامل في production logs
2. 🔒 **Security**: Token في localStorage فقط (مُستخدم بالفعل في النظام)
3. 🧪 **Testing**: استخدم TokenDebug فقط في development
4. 📝 **Logging**: الـ console logs يمكن إزالتها في production build

## الخلاصة

✅ **تم حل المشكلة** - الكود الآن يستخرج `CompanyId` بشكل صحيح من token

✅ **تم تحسين الكود** - utilities مركزية وقابلة لإعادة الاستخدام

✅ **تم إضافة debugging tools** - لتسهيل اكتشاف المشاكل المستقبلية

✅ **تم التوثيق** - دليل شامل للاستخدام والصيانة

## التاريخ
- **13 يناير 2026** - تم إصلاح المشكلة وإضافة utilities
