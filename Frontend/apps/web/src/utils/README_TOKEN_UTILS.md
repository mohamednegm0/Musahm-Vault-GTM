# Token Utilities

مجموعة من الدوال المساعدة للتعامل مع JWT tokens في تطبيق Vault.

## المشكلة الأساسية

نظام Musahm يستخدم claim names مختلفة في JWT token:
- **Tenant ID**: يُخزن في `CompanyId` وليس `tenantId`
- **User ID**: يُخزن في `Id` وليس `id` أو `sub`

## الحل

هذه الـ utilities تبحث عن جميع الأسماء الممكنة للـ claims وتُرجع القيمة الصحيحة.

## الاستخدام

### 1. استخراج Tenant ID

```typescript
import { getTenantIdFromToken } from '../utils/tokenUtils';

const tenantId = getTenantIdFromToken();
if (!tenantId) {
  console.error('No tenant ID found');
  return;
}

// استخدم tenantId...
```

### 2. استخراج User ID

```typescript
import { getUserIdFromToken } from '../utils/tokenUtils';

const userId = getUserIdFromToken();
```

### 3. فك تشفير Token

```typescript
import { decodeToken } from '../utils/tokenUtils';

const token = localStorage.getItem('authToken');
const claims = decodeToken(token);

console.log('All claims:', claims);
```

### 4. التحقق من انتهاء صلاحية Token

```typescript
import { isTokenExpired } from '../utils/tokenUtils';

if (isTokenExpired()) {
  console.log('Token expired, redirecting to login...');
  window.location.href = '/login';
}
```

### 5. عرض معلومات Token (للتطوير)

```typescript
import TokenDebug from '../components/TokenDebug';

// في صفحة settings أو debug
function DebugPage() {
  return (
    <div>
      <h1>Debug Information</h1>
      <TokenDebug />
    </div>
  );
}
```

## API Reference

### `decodeToken(token: string): any | null`
فك تشفير JWT token وإرجاع payload.

**Parameters:**
- `token` - JWT token string

**Returns:**
- Decoded payload object أو `null` إذا فشل

### `getTenantIdFromToken(): string | null`
استخراج tenant ID من token المخزن في localStorage.

**Returns:**
- Tenant ID string أو `null` إذا لم يُعثر عليه

**Claim names checked:**
- `CompanyId` ⭐ (Primary في نظام Musahm)
- `companyId`
- `company_id`
- `tenantId`
- `tenant_id`
- `TenantId`

### `getUserIdFromToken(): string | null`
استخراج user ID من token.

**Returns:**
- User ID string أو `null` إذا لم يُعثر عليه

**Claim names checked:**
- `Id` ⭐ (Primary في نظام Musahm)
- `id`
- `ID`
- `sub`
- `userId`
- `user_id`

### `getUserEmailFromToken(): string | null`
استخراج email من token.

**Returns:**
- Email string أو `null` إذا لم يُعثر عليه

### `isTokenExpired(): boolean`
التحقق من انتهاء صلاحية token.

**Returns:**
- `true` إذا كان منتهي الصلاحية أو غير صالح
- `false` إذا كان صالح

### `getAllTokenClaims(): any | null`
الحصول على جميع claims من token (للتطوير).

**Returns:**
- Object يحتوي على جميع claims أو `null`

## Debugging

### في Console
```javascript
// عرض جميع claims
console.log(JSON.stringify(getAllTokenClaims(), null, 2));

// عرض tenant ID
console.log('Tenant ID:', getTenantIdFromToken());

// عرض user ID
console.log('User ID:', getUserIdFromToken());
```

### استخدام TokenDebug Component
```typescript
import TokenDebug from './components/TokenDebug';

// في أي صفحة
<TokenDebug />
```

## مثال كامل

```typescript
import { 
  getTenantIdFromToken, 
  getUserIdFromToken,
  isTokenExpired 
} from '../utils/tokenUtils';

async function createWorkspace(workspaceData: any) {
  // التحقق من Token
  if (isTokenExpired()) {
    throw new Error('Token expired. Please login again.');
  }

  // استخراج IDs
  const tenantId = getTenantIdFromToken();
  const userId = getUserIdFromToken();

  if (!tenantId) {
    throw new Error('Tenant ID not found in token');
  }

  // إضافة IDs للبيانات
  const payload = {
    ...workspaceData,
    tenantId,
    createdBy: userId
  };

  // إرسال الطلب
  return await api.post('/api/Workspaces', payload);
}
```

## ملاحظات

1. **Security**: لا تُسجل token كامل في production logs
2. **Cache**: يمكن cache القيم المستخرجة إذا كان Token ثابت
3. **Validation**: دائماً تحقق من `null` قبل استخدام القيم المُرجعة
4. **Development Only**: استخدم `TokenDebug` component في development فقط

## التوافق

يعمل مع:
- ✅ Musahm Authentication API
- ✅ JWT tokens من `https://api-s2.musahm.com`
- ✅ جميع المتصفحات الحديثة (ES6+)
