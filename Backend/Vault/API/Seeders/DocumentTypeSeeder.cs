using Core.Entities;
using Core.Repository;

namespace API.Seeders;

public static class DocumentTypeSeeder
{
    public static async Task SeedDocumentTypesAsync(IUnitOfWork unitOfWork)
    {
        var existingTypes = await unitOfWork.DocumentTypes.GetAllAsync();
        
        if (existingTypes.Any())
        {
            Console.WriteLine("Document types already seeded.");
            return;
        }

        var documentTypes = new List<DocumentType>
        {
            new DocumentType
            {
                Code = "contract",
                NameAr = "عقد",
                NameEn = "Contract",
                Description = "Legal contracts and agreements",
                Icon = "📄",
                IsActive = true
            },
            new DocumentType
            {
                Code = "invoice",
                NameAr = "فاتورة",
                NameEn = "Invoice",
                Description = "Financial invoices and bills",
                Icon = "🧾",
                IsActive = true
            },
            new DocumentType
            {
                Code = "meeting_minutes",
                NameAr = "محضر اجتماع",
                NameEn = "Meeting Minutes",
                Description = "Meeting notes and minutes",
                Icon = "📝",
                IsActive = true
            },
            new DocumentType
            {
                Code = "report",
                NameAr = "تقرير",
                NameEn = "Report",
                Description = "Business reports and analysis",
                Icon = "📊",
                IsActive = true
            },
            new DocumentType
            {
                Code = "policy",
                NameAr = "سياسة",
                NameEn = "Policy",
                Description = "Company policies and procedures",
                Icon = "📋",
                IsActive = true
            },
            new DocumentType
            {
                Code = "memo",
                NameAr = "مذكرة",
                NameEn = "Memo",
                Description = "Internal memos and communications",
                Icon = "📌",
                IsActive = true
            },
            new DocumentType
            {
                Code = "proposal",
                NameAr = "مقترح",
                NameEn = "Proposal",
                Description = "Business proposals and offers",
                Icon = "💼",
                IsActive = true
            },
            new DocumentType
            {
                Code = "other",
                NameAr = "أخرى",
                NameEn = "Other",
                Description = "Other document types",
                Icon = "📁",
                IsActive = true
            }
        };

        foreach (var docType in documentTypes)
        {
            await unitOfWork.DocumentTypes.AddAsync(docType);
        }

        Console.WriteLine($"Seeded {documentTypes.Count} document types successfully.");
    }
}
