# إصلاح BsonRepresentation لـ IDs

## المشكلة
نظام Musahm يستخدم **numeric IDs** (مثل "25", "26") وليس MongoDB ObjectIds.

عندما كان لدينا:
```csharp
[BsonElement("tenant_id")]
[BsonRepresentation(BsonType.ObjectId)]
public string? TenantId { get; set; }
```

MongoDB كان يحاول تحويل "25" إلى ObjectId وهذا فشل!

## الحل
إزالة `[BsonRepresentation(BsonType.ObjectId)]` من جميع **user/tenant/company IDs**.

### الفرق:

**❌ قبل:**
```csharp
[BsonElement("tenant_id")]
[BsonRepresentation(BsonType.ObjectId)]  // ❌ يفرض تحويل إلى ObjectId
public string? TenantId { get; set; }

[BsonElement("created_by")]
[BsonRepresentation(BsonType.ObjectId)]  // ❌ يفرض تحويل إلى ObjectId
public string? CreatedBy { get; set; }
```

**✅ بعد:**
```csharp
[BsonElement("tenant_id")]
public string? TenantId { get; set; }  // ✅ يقبل أي string

[BsonElement("created_by")]
public string? CreatedBy { get; set; }  // ✅ يقبل أي string
```

## الملفات المحدثة

### Workspace.cs ✅
- ❌ `[BsonRepresentation(BsonType.ObjectId)]` من `TenantId`
- ❌ `[BsonRepresentation(BsonType.ObjectId)]` من `RetentionPolicyId`
- ❌ `[BsonRepresentation(BsonType.ObjectId)]` من `CreatedBy`
- ❌ `[BsonRepresentation(BsonType.ObjectId)]` من `UpdatedBy`

### محدثة مقترحة:
يجب تطبيق نفس الإصلاح على Entities الأخرى:
- TaskEntity.cs
- Workflow.cs
- WorkflowInstance.cs
- Obligation.cs
- إلخ

## الفائدة

الآن يمكن:
- ✅ إرسال numeric IDs: "25", "26"
- ✅ إرسال string IDs: "abc123def456"
- ✅ إرسال UUIDs: "550e8400-e29b-41d4-a716-446655440000"
- ✅ أي format ID من أنظمة خارجية

## مثال استخدام

```typescript
// Frontend
const workspaceData = {
  tenantId: "25",          // ✅ numeric ID
  createdBy: "26",         // ✅ numeric ID
  name: "cbn",
  slug: "ghgdhd",
  type: "Board",
  // ...
};

// POST /api/Workspaces
// ✅ الآن يعمل بدون مشاكل
```

## الخطوات التالية

1. ✅ تحديث Workspace.cs - تم
2. 🔄 تحديث باقي الـ Entities بنفس الطريقة
3. 🔄 إعادة بناء Backend
4. 🔄 اختبار جميع الـ APIs

## الملاحظات

- `Id` (primary key) لا يزال محتفظاً بـ `[BsonRepresentation(BsonType.ObjectId)]` لأن MongoDB يتوقع ObjectId للـ document ID
- جميع الـ foreign keys (tenant_id, created_by, etc) الآن تقبل أي string
- هذا يوفر المرونة للربط مع أنظمة خارجية مثل Musahm

## التحقق

بعد التحديثات، ستستقبل Workspace مع جميع الـ IDs الـ numeric بنجاح:

```json
{
  "id": "507f1f77bcf86cd799439013",
  "tenantId": "25",
  "createdBy": "26",
  "name": "cbn",
  "slug": "ghgdhd",
  "type": "Board",
  "settings": {
    "privacy": "private",
    "allowInvites": true,
    "storageLimitMb": 1000
  },
  "isActive": true,
  "isArchived": false,
  "legalHold": false,
  "createdAt": "2026-01-13T10:30:00Z"
}
```
