using Core.Entities;
using Core.Enums;
using Core.Repository;
using MongoDB.Driver;
using API.Seeders;

namespace API.Seeding;

public class DataSeeder
{
    private readonly IUnitOfWork _unitOfWork;

    public DataSeeder(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task SeedAsync()
    {
        await DocumentTypeSeeder.SeedDocumentTypesAsync(_unitOfWork);
        
        // Force drop 'user_roles' to ensure clean state for new schema
        try 
        {
            await _unitOfWork.Database.DropCollectionAsync("user_roles");
            Console.WriteLine("Force dropped 'user_roles' collection (Schema Update).");
        }
        catch (Exception ex)
        {
             Console.WriteLine($"Error dropping user_roles collection: {ex.Message}");
        }
        
        // Cleanup capitalized collection if exists
        try 
        {
            await _unitOfWork.Database.DropCollectionAsync("Workflows");
            Console.WriteLine("Dropped 'Workflows' collection.");
        }
        catch (Exception ex)
        {
             Console.WriteLine($"Error dropping Workflows collection: {ex.Message}");
        }

        await SeedActionsAsync();
        await SeedTriggersAsync();
        
        await new Service.Seeders.EventSeeder(_unitOfWork).SeedAsync();
    }

    private async Task SeedTriggersAsync()
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

    private async Task SeedActionsAsync()
    {
        Console.WriteLine("Starting SeedActionsAsync...");
        var actions = new List<ActionDefinition>
        {
            new() { Code = "approve", Name = "Approve", Description = "Approve the current step/document.", IsSystem = true, DisplayNameEn = "Approve", DisplayNameAr = "موافقة" },
            new() { Code = "reject", Name = "Reject", Description = "Reject the current step/document and return to previous step.", IsSystem = true, DisplayNameEn = "Reject", DisplayNameAr = "رفض" },
            new() { Code = "review", Name = "Review", Description = "Review the document/data and provide comments.", IsSystem = true, DisplayNameEn = "Review", DisplayNameAr = "مراجعة" }
        };

        var existingActions = await _unitOfWork.Actions.GetAllAsync();
        var actionsToKeep = new HashSet<string>(actions.Select(a => a.Code), StringComparer.OrdinalIgnoreCase);

        // 1. Add or Update allowed actions
        foreach (var action in actions)
        {
            var existing = existingActions.FirstOrDefault(a => a.Code == action.Code);
            if (existing == null)
            {
                await _unitOfWork.Actions.AddAsync(action);
                Console.WriteLine($"Seeded action: {action.Name}");
            }
            else
            {
                // updates if needed
                if (existing.Name != action.Name || existing.Description != action.Description || existing.DisplayNameAr != action.DisplayNameAr || existing.DisplayNameEn != action.DisplayNameEn)
                {
                   existing.Name = action.Name;
                   existing.Description = action.Description;
                   existing.DisplayNameAr = action.DisplayNameAr;
                   existing.DisplayNameEn = action.DisplayNameEn;
                   existing.IsSystem = action.IsSystem;
                   await _unitOfWork.Actions.UpdateAsync(existing.Id!, existing);
                   Console.WriteLine($"Updated seeded action: {action.Name}");
                }
            }
        }

        // 2. Remove unwanted actions
        foreach (var existing in existingActions)
        {
            if (!actionsToKeep.Contains(existing.Code))
            {
                await _unitOfWork.Actions.DeleteAsync(existing.Id!);
                Console.WriteLine($"Removed unwanted action: {existing.Name} ({existing.Code})");
            }
        }
    }

}
