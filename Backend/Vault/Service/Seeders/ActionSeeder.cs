using Core.Entities;
using Core.Repository;

namespace Service.Seeders;

public class ActionSeeder
{
    private readonly IUnitOfWork _unitOfWork;

    public ActionSeeder(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task SeedAsync()
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
