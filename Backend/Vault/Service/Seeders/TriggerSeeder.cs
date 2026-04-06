using Core.Entities;
using Core.Repository;

namespace Service.Seeders;

public class TriggerSeeder
{
    private readonly IUnitOfWork _unitOfWork;

    public TriggerSeeder(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task SeedAsync()
    {
        Console.WriteLine("Starting SeedTriggersAsync...");
        var triggers = new List<WorkflowTriggerDefinition>
        {
            new() { Code = "upload", Name = "Upload", Description = "Triggered when a document is uploaded.", DisplayNameEn = "Upload", DisplayNameAr = "رفع ملف" },
            new() { Code = "delete", Name = "Delete", Description = "Triggered when a document is deleted.", DisplayNameEn = "Delete", DisplayNameAr = "حذف ملف" },
            new() { Code = "update", Name = "Update", Description = "Triggered when a document is updated (new version).", DisplayNameEn = "Update", DisplayNameAr = "تحديث ملف" },
            new() { Code = "move", Name = "Move", Description = "Triggered when a document is moved to another folder.", DisplayNameEn = "Move", DisplayNameAr = "نقل ملف" },
            new() { Code = "share", Name = "Share", Description = "Triggered when a document is shared with a user.", DisplayNameEn = "Share", DisplayNameAr = "مشاركة ملف" }
        };

        var existingTriggers = await _unitOfWork.Triggers.GetAllAsync();
        var triggersToKeep = new HashSet<string>(triggers.Select(t => t.Code), StringComparer.OrdinalIgnoreCase);

        // 1. Add or Update allowed triggers
        foreach (var trigger in triggers)
        {
            var existing = existingTriggers.FirstOrDefault(t => t.Code == trigger.Code);
            if (existing == null)
            {
                await _unitOfWork.Triggers.AddAsync(trigger);
                Console.WriteLine($"Seeded trigger: {trigger.Name}");
            }
            else
            {
                // updates if needed
                if (existing.Name != trigger.Name || existing.Description != trigger.Description || existing.DisplayNameAr != trigger.DisplayNameAr || existing.DisplayNameEn != trigger.DisplayNameEn)
                {
                   existing.Name = trigger.Name;
                   existing.Description = trigger.Description;
                   existing.DisplayNameAr = trigger.DisplayNameAr;
                   existing.DisplayNameEn = trigger.DisplayNameEn;
                   await _unitOfWork.Triggers.UpdateAsync(existing.Id!, existing);
                   Console.WriteLine($"Updated seeded trigger: {trigger.Name}");
                }
            }
        }

        // 2. Remove unwanted triggers
        foreach (var existing in existingTriggers)
        {
            if (!triggersToKeep.Contains(existing.Code))
            {
                await _unitOfWork.Triggers.DeleteAsync(existing.Id!);
                Console.WriteLine($"Removed unwanted trigger: {existing.Name} ({existing.Code})");
            }
        }
    }
}
