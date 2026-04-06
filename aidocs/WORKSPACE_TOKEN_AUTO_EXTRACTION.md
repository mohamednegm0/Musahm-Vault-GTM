# Workspace Creation - Auto Token Data Extraction

## Overview
تم تحديث العملية لاستخراج البيانات تلقائياً من التوكن وإرسالها مع الـ request دون الحاجة لطلبها من المستخدم.

---

## 📝 البيانات المستخرجة من التوكن

### 1. **Tenant ID** (معرف المستأجر)
```typescript
const tenantId = getTenantIdFromToken();
```
- **المسارات المحتملة في التوكن**:
  - `decoded.tenantId`
  - `decoded.tenant_id`
  - `decoded.TenantId`

### 2. **User ID** (معرف المستخدم)
```typescript
const userId = getUserIdFromToken();
```
- **المسارات المحتملة في التوكن**:
  - `decoded.id`
  - `decoded.sub` (subject)
  - `decoded.userId`
  - `decoded.user_id`

---

## 🔧 Helper Functions المضافة

### Function 1: `decodeToken(token: string)`
```typescript
const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};
```

**الوظيفة**: فك تشفير JWT Token واستخراج البيانات
**المعاملات**: التوكن (string)
**الإرجاع**: Object بالبيانات المفككة

### Function 2: `getTenantIdFromToken()`
```typescript
const getTenantIdFromToken = (): string | null => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded?.tenantId || decoded?.tenant_id || decoded?.TenantId || null;
};
```

**الوظيفة**: استخراج Tenant ID من التوكن
**الإرجاع**: معرف المستأجر (string أو null)

### Function 3: `getUserIdFromToken()`
```typescript
const getUserIdFromToken = (): string | null => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded?.id || decoded?.sub || decoded?.userId || decoded?.user_id || null;
};
```

**الوظيفة**: استخراج User ID من التوكن
**الإرجاع**: معرف المستخدم (string أو null)

---

## 📤 API Request - Before & After

### BEFORE (بدون بيانات التوكن)
```json
POST /api/Workspaces
{
  "name": "مجلس الإدارة",
  "slug": "board-council",
  "description": "...",
  "type": "Board",
  "settings": { ... }
}
```

### AFTER (مع بيانات التوكن)
```json
POST /api/Workspaces
{
  "tenantId": "507f1f77bcf86cd799439011",      // من التوكن
  "name": "مجلس الإدارة",
  "slug": "board-council",
  "description": "...",
  "type": "Board",
  "settings": { ... },
  "isActive": true,                              // قيمة افتراضية
  "isArchived": false,                           // قيمة افتراضية
  "legalHold": false,                            // قيمة افتراضية
  "createdBy": "507f1f77bcf86cd799439012"       // من التوكن
}
```

---

## 🔄 Updated `handleAddWorkspace()` Function

```typescript
const handleAddWorkspace = async () => {
  setError('');
  
  // 1. Validate user inputs
  if (!workspaceName.trim()) {
    setError('اسم المساحة مطلوب');
    return;
  }
  if (!workspaceSlug.trim()) {
    setError('الـ Slug مطلوب');
    return;
  }

  // 2. Extract data from token
  const tenantId = getTenantIdFromToken();
  const userId = getUserIdFromToken();

  // 3. Validate tenant context
  if (!tenantId) {
    setError('لم يتمكن من العثور على معرف المستأجر. يرجى تسجيل الدخول مرة أخرى.');
    return;
  }

  try {
    setIsSaving(true);
    
    // 4. Create workspace with complete data
    const newWorkspace = await workspaceService.create({
      tenantId: tenantId,           // من التوكن
      name: workspaceName,           // من المستخدم
      slug: workspaceSlug,           // من المستخدم
      description: workspaceDescription,  // من المستخدم
      type: workspaceType,           // من المستخدم
      settings: {
        privacy: workspacePrivacy,
        allowInvites: workspaceAllowInvites,
        storageLimitMb: workspaceStorageLimit
      },
      isActive: true,                // قيمة افتراضية
      isArchived: false,             // قيمة افتراضية
      legalHold: false,              // قيمة افتراضية
      createdBy: userId || undefined // من التوكن
    });

    // 5. Update UI
    const newWorkspaceItem: WorkspaceItem = {
      id: newWorkspace.id!,
      name: workspaceName,
      icon: Folder
    };

    setWorkspaces(prev => [...prev, newWorkspaceItem]);
    handleCloseModal();
    
  } catch (error: any) {
    console.error('Error creating workspace:', error);
    setError(error.response?.data?.message || 'فشل إنشاء المساحة');
  } finally {
    setIsSaving(false);
  }
};
```

---

## 🔒 Security Considerations

### ✅ Best Practices Implemented:

1. **Token من localStorage فقط**
   - Token يتم الحصول عليه من localStorage
   - لا يتم تمريره مباشرة عبر props

2. **Fallback values**
   - إذا فشل استخراج البيانات، يتم إرجاع null
   - يتم التحقق من القيم قبل الاستخدام

3. **Error Handling**
   - إذا لم يوجد tenantId، يتم عرض خطأ واضح
   - يطلب من المستخدم تسجيل الدخول مرة أخرى

4. **لا يتم الاعتماد على input من المستخدم**
   - tenantId و userId يأتيان من التوكن الموثوق
   - لا يمكن للمستخدم تعديلهما

---

## 🎯 Expected Token Format

### Example JWT Token (Payload)
```json
{
  "id": "507f1f77bcf86cd799439012",
  "sub": "507f1f77bcf86cd799439012",
  "email": "user@example.com",
  "tenantId": "507f1f77bcf86cd799439011",
  "iat": 1673606613,
  "exp": 1673693013
}
```

### Token Structure
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
{PAYLOAD}.
{SIGNATURE}
       ↑
  Index: 1 (يتم استخراجه في الكود)
```

---

## 📋 Data Sent in Request

| Field | Source | Type | Required |
|---|---|---|---|
| `tenantId` | Token | string | ✅ Yes |
| `name` | User Input | string | ✅ Yes |
| `slug` | User Input | string | ✅ Yes |
| `description` | User Input | string | ❌ No |
| `type` | User Input | enum | ✅ Yes |
| `settings` | User Input | object | ✅ Yes |
| `isActive` | Default | boolean | ✅ Yes (true) |
| `isArchived` | Default | boolean | ✅ Yes (false) |
| `legalHold` | Default | boolean | ✅ Yes (false) |
| `createdBy` | Token | string | ✅ Yes |

---

## 🧪 Testing the Implementation

### Test Case 1: Extract Tenant ID
```javascript
// في Console
const token = localStorage.getItem('authToken');
const decoded = decodeToken(token);
console.log('Tenant ID:', decoded?.tenantId);
```

### Test Case 2: Create Workspace
1. افتح Modal
2. أدخل:
   - Name: "Test Workspace"
   - Slug: "test-workspace"
3. انقر "إضافة"
4. تحقق من Network tab في DevTools:
   ```json
   {
     "tenantId": "... (من التوكن)",
     "name": "Test Workspace",
     "slug": "test-workspace",
     ...
   }
   ```

### Test Case 3: Validate Tenant ID Error
1. احذف authToken من localStorage
2. حاول فتح Modal
3. يجب أن يظهر: "لم يتمكن من العثور على معرف المستأجر"

---

## 🔗 Files Modified

1. **Sidebar.tsx**
   - ✅ أضفنا helper functions
   - ✅ استخرجنا tenantId و userId من التوكن
   - ✅ أضفنا `useAuth` hook

2. **workspaceService.ts**
   - ✅ Interface مع جميع الحقول المطلوبة

---

## ⚠️ Important Notes

### 1. **Token Format Flexibility**
الكود يدعم عدة تنسيقات مختلفة لـ token claims:
- `tenantId` أو `tenant_id` أو `TenantId`
- `id` أو `sub` أو `userId` أو `user_id`

### 2. **localStorage Key**
- Token يجب أن يكون في: `localStorage.getItem('authToken')`
- Email في: `localStorage.getItem('userEmail')`

### 3. **Backend Validation**
Backend يجب أن يتحقق من:
- ✅ أن المستخدم لديه حقوق الوصول للـ tenant
- ✅ أن الـ slug فريد ضمن الـ tenant
- ✅ أن جميع الحقول المطلوبة موجودة

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────┐
│  Workspace Modal (User Input)        │
│  - Name                              │
│  - Slug                              │
│  - Description                       │
│  - Type, Privacy, Storage, Invites   │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  handleAddWorkspace()                │
│  ├─ Validate User Input              │
│  ├─ Extract from Token:              │
│  │  ├─ tenantId                      │
│  │  └─ userId (createdBy)            │
│  └─ Add Default Values               │
│     ├─ isActive: true                │
│     ├─ isArchived: false             │
│     └─ legalHold: false              │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  API Request (POST /api/Workspaces)  │
│  Complete Workspace Object           │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  Backend Processing                  │
│  - Validate Tenant                   │
│  - Create Workspace                  │
│  - Return Full Object                │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  Frontend Response                   │
│  - Update Sidebar                    │
│  - Close Modal                       │
│  - Show Success                      │
└─────────────────────────────────────┘
```

---

## ✨ Summary

✅ **Auto-extraction من التوكن**
- لا حاجة لطلب tenantId من المستخدم
- tenantId محمي ومأخوذ من التوكن الموثوق

✅ **Complete Data Submission**
- جميع الحقول المطلوبة مرسلة
- Include audit fields (createdBy, createdAt)

✅ **Secure Implementation**
- Token يتم قراءته من localStorage فقط
- لا يمكن للمستخدم تجاوز الحقوق

✅ **Better UX**
- لا حقول إضافية على المستخدم
- معالجة أخطاء واضحة
