# توثيق نظام إضافة Workspace

## نظرة عامة
نظام إضافة workspace مُكتمل ويعمل بشكل صحيح. عند فتح البوب أب وملء البيانات، يتم إرسال طلب POST إلى `/api/Workspaces`.

## ⚠️ ملاحظة مهمة عن Token
نظام Musahm يستخدم `CompanyId` في الـ JWT token كـ `tenantId`. تم تحديث الكود لاستخراج `CompanyId` بشكل صحيح.

### استخراج Tenant ID من Token
```typescript
// في tokenUtils.ts
export const getTenantIdFromToken = (): string | null => {
  const token = localStorage.getItem('authToken');
  const decoded = decodeToken(token);
  
  // CompanyId is used as tenantId in Musahm system
  return decoded?.CompanyId || decoded?.companyId || decoded?.company_id || 
         decoded?.tenantId || decoded?.tenant_id || decoded?.TenantId || null;
}
```

### استخراج User ID من Token
```typescript
// في tokenUtils.ts
export const getUserIdFromToken = (): string | null => {
  const token = localStorage.getItem('authToken');
  const decoded = decodeToken(token);
  
  // Id is used in Musahm system
  return decoded?.Id || decoded?.id || decoded?.ID || 
         decoded?.sub || decoded?.userId || decoded?.user_id || null;
}
```

## سير العمل (Workflow)

### 1. فتح البوب أب (Modal)
- المستخدم يضغط على زر "إضافة مساحة عمل" في Sidebar
- يتم عرض modal كبير بجميع الحقول المطلوبة

### 2. الحقول المتاحة
```typescript
{
  id: string (optional - يتم إنشاؤه تلقائياً),
  tenantId: string (يتم استخراجه من token تلقائياً),
  name: string (إجباري),
  slug: string (إجباري - يتم تحويله تلقائياً إلى lowercase),
  description: string (اختياري),
  type: string (إجباري - من enum: Board, Legal, Compliance, HR, Projects),
  retentionPolicyId: string (optional),
  legalHold: boolean (default: false),
  settings: {
    privacy: string (private/internal/public),
    allowInvites: boolean (default: true),
    storageLimitMb: number (default: 1000)
  },
  isActive: boolean (default: true),
  isArchived: boolean (default: false),
  createdBy: string (يتم استخراجه من token تلقائياً)
}
```

### 3. التحقق من البيانات (Validation)
قبل الإرسال، يتم التحقق من:
- ✅ اسم workspace غير فارغ
- ✅ slug غير فارغ
- ✅ وجود tenantId في token

### 4. إرسال الطلب
```typescript
// الكود الموجود في Sidebar.tsx (handleAddWorkspace)
const workspaceData = {
  tenantId: tenantId,
  name: workspaceName,
  slug: workspaceSlug,
  description: workspaceDescription,
  type: workspaceType,
  settings: {
    privacy: workspacePrivacy,
    allowInvites: workspaceAllowInvites,
    storageLimitMb: workspaceStorageLimit
  },
  isActive: true,
  isArchived: false,
  legalHold: false,
  createdBy: userId || undefined
};

const newWorkspace = await workspaceService.create(workspaceData);
```

### 5. استدعاء API
```typescript
// من workspaceService.ts
async create(workspace: Workspace): Promise<Workspace> {
  const response = await apiClient.post<Workspace>('/api/Workspaces', workspace);
  return response.data;
}
```

### 6. الـ Endpoint في Backend
```csharp
// WorkspacesController.cs
[HttpPost]
public async Task<ActionResult> Post([FromBody] Workspace workspace)
{
    await _service.CreateWorkspaceAsync(workspace);
    return CreatedAtAction(nameof(Get), new { id = workspace.Id }, workspace);
}
```

## مثال على البيانات المُرسلة
```json
{
  "tenantId": "507f1f77bcf86cd799439011",
  "name": "مجلس الإدارة",
  "slug": "board-of-directors",
  "description": "مساحة عمل خاصة بمجلس الإدارة",
  "type": "Board",
  "settings": {
    "privacy": "private",
    "allowInvites": true,
    "storageLimitMb": 1000
  },
  "isActive": true,
  "isArchived": false,
  "legalHold": false,
  "createdBy": "507f1f77bcf86cd799439012"
}
```

## الاستجابة المتوقعة
```json
{
  "id": "507f1f77bcf86cd799439013",
  "tenantId": "507f1f77bcf86cd799439011",
  "name": "مجلس الإدارة",
  "slug": "board-of-directors",
  "description": "مساحة عمل خاصة بمجلس الإدارة",
  "type": "Board",
  "retentionPolicyId": null,
  "legalHold": false,
  "settings": {
    "privacy": "private",
    "allowInvites": true,
    "storageLimitMb": 1000
  },
  "stats": null,
  "isActive": true,
  "isArchived": false,
  "createdBy": "507f1f77bcf86cd799439012",
  "createdAt": "2026-01-13T10:30:00Z",
  "updatedBy": null,
  "updatedAt": null
}
```

## معالجة الأخطاء
```typescript
try {
  const newWorkspace = await workspaceService.create(workspaceData);
  // نجح الإنشاء - إضافة workspace للقائمة
  setWorkspaces(prev => [...prev, newWorkspaceItem]);
  handleCloseModal();
} catch (error: any) {
  console.error('Error creating workspace:', error);
  setError(error.response?.data?.message || t('errorCreatingWorkspace'));
}
```

## الميزات الإضافية

### 1. استخراج تلقائي للـ Token Data
- يتم استخراج `tenantId` و `userId` تلقائياً من JWT token
- لا يحتاج المستخدم لإدخال هذه البيانات

### 2. تحويل Slug تلقائياً
- عند كتابة slug، يتم تحويله تلقائياً إلى lowercase
- يتم استبدال المسافات بـ `-`
```typescript
const slug = e.target.value.toLowerCase().replaceAll(/\s+/g, '-');
```

### 3. حالة Loading
- يتم عرض "جاري الحفظ..." أثناء الإرسال
- يتم تعطيل جميع الحقول أثناء الحفظ

### 4. إغلاق Modal تلقائياً
- يتم إغلاق Modal تلقائياً بعد نجاح الإنشاء
- يتم إعادة تعيين جميع الحقول

## الملفات الرئيسية
1. **Frontend**:
   - [Sidebar.tsx](Frontend/apps/web/src/components/Sidebar.tsx) - Component رئيسي
   - [workspaceService.ts](Frontend/apps/web/src/services/workspaceService.ts) - Service layer
   - [apiClient.ts](Frontend/apps/web/src/api/apiClient.ts) - HTTP client
   - [tokenUtils.ts](Frontend/apps/web/src/utils/tokenUtils.ts) - Token utility functions ✨ جديد
   - [TokenDebug.tsx](Frontend/apps/web/src/components/TokenDebug.tsx) - Debug component ✨ جديد

2. **Backend**:
   - [WorkspacesController.cs](Backend/Vault/API/Controllers/WorkspacesController.cs) - API Controller
   - [Workspace.cs](Backend/Vault/Core/Entities/Workspace.cs) - Entity Model
   - [AuthService.cs](Backend/Vault/Service/Services/AuthService.cs) - Authentication Service

## استكشاف الأخطاء (Troubleshooting)

### مشكلة: "Could not find tenant ID"
**السبب**: Token لا يحتوي على `tenantId` بل يحتوي على `CompanyId`

**الحل**: تم تحديث `tokenUtils.ts` لاستخراج `CompanyId` كـ tenant ID

**التحقق**:
1. افتح console في المتصفح
2. نفذ: `localStorage.getItem('authToken')`
3. استخدم [jwt.io](https://jwt.io) لفك تشفير الـ token
4. تحقق من وجود `CompanyId` و `Id` في claims

### استخدام TokenDebug Component
يمكن استخدام `TokenDebug` component لعرض معلومات الـ token:

```typescript
import TokenDebug from './components/TokenDebug';

// في أي صفحة للتطوير
<TokenDebug />
```

### Console Logging
تم إضافة logging تلقائي لمساعدة في debugging:
- يعرض Token claims المتاحة
- يعرض Tenant ID و User ID المستخرجين
- يعرض رسائل خطأ واضحة

## اختبار النظام
1. افتح التطبيق وسجل دخول
2. اضغط على زر "إضافة مساحة عمل" في Sidebar
3. املأ البيانات المطلوبة
4. اضغط "إضافة"
5. تأكد من:
   - ✅ إرسال الطلب لـ `/api/Workspaces`
   - ✅ إضافة workspace للقائمة
   - ✅ إغلاق modal تلقائياً
   - ✅ عرض رسائل الخطأ إذا فشل الإنشاء

## ملاحظات مهمة
- ✅ النظام مُكتمل ويعمل بشكل صحيح
- ✅ جميع الحقول المطلوبة موجودة في Modal
- ✅ التحقق من البيانات يعمل بشكل صحيح
- ✅ معالجة الأخطاء متوفرة
- ✅ Authentication token يُرسل تلقائياً مع كل طلب
- ✅ **تم إصلاح**: استخراج `CompanyId` من token كـ `tenantId` ✨
- ✅ **جديد**: Utility functions مشتركة في `tokenUtils.ts` ✨
- ✅ **جديد**: TokenDebug component للتطوير والاختبار ✨

## التحديثات الأخيرة (13 يناير 2026)

### 1. إصلاح مشكلة Tenant ID
- **المشكلة**: "Could not find tenant ID. Please log in again."
- **السبب**: نظام Musahm يستخدم `CompanyId` وليس `tenantId` في JWT token
- **الحل**: تحديث استخراج tenant ID ليبحث عن `CompanyId` أولاً

### 2. إنشاء Token Utilities
تم إنشاء ملف [tokenUtils.ts](Frontend/apps/web/src/utils/tokenUtils.ts) يحتوي على:
- `decodeToken()` - فك تشفير JWT token
- `getTenantIdFromToken()` - استخراج tenant ID (CompanyId)
- `getUserIdFromToken()` - استخراج user ID (Id)
- `getUserEmailFromToken()` - استخراج email
- `isTokenExpired()` - التحقق من انتهاء صلاحية token
- `getAllTokenClaims()` - الحصول على جميع claims للتطوير

### 3. إنشاء TokenDebug Component
component للتطوير يعرض:
- حالة Token (Active/Expired)
- Tenant ID, User ID, Email المستخرجين
- جميع token claims
- مفاتيح claims المتاحة

### 4. تحسين Logging
- إضافة console logs تلقائية
- عرض claims المتاحة في token
- رسائل خطأ واضحة عند فشل الاستخراج
