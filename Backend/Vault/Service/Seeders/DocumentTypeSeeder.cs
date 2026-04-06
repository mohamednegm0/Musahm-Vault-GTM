using Core.Entities;
using Core.Repository;

namespace Service.Seeders;

public class DocumentTypeSeeder
{
    private readonly IUnitOfWork _unitOfWork;

    public DocumentTypeSeeder(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task SeedAsync()
    {
        var existingTypes = await _unitOfWork.DocumentTypes.GetAllAsync();
        var existingTypeCodes = new HashSet<string>(existingTypes.Select(t => t.Code));

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

        int addedCount = 0;
        foreach (var docType in documentTypes)
        {
            if (!existingTypeCodes.Contains(docType.Code))
            {
                await _unitOfWork.DocumentTypes.AddAsync(docType);
                addedCount++;
            }
        }

        if (addedCount > 0)
        {
            Console.WriteLine($"Seeded {addedCount} new document types.");
        }
        else
        {
            Console.WriteLine("All document types already seeded.");
        }
    }
}
