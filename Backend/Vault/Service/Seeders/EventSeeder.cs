using Core.Entities;
using Core.Repository;

namespace Service.Seeders;

public class EventSeeder
{
    private readonly IUnitOfWork _unitOfWork;

    public EventSeeder(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task SeedAsync()
    {
        Console.WriteLine("Starting SeedEventsAsync...");
        var events = new List<WorkflowEventDefinition>
        {
            new() { Code = "share", Name = "Share", Description = "Document shared.", DisplayNameEn = "Share", DisplayNameAr = "مشاركة" }
        };

        var existingEvents = await _unitOfWork.WorkflowEvents.GetAllAsync();
        var eventsToKeep = new HashSet<string>(events.Select(e => e.Code), StringComparer.OrdinalIgnoreCase);

        // 1. Add or Update allowed events
        foreach (var evt in events)
        {
            var existing = existingEvents.FirstOrDefault(e => e.Code == evt.Code);
            if (existing == null)
            {
                await _unitOfWork.WorkflowEvents.AddAsync(evt);
                Console.WriteLine($"Seeded event: {evt.Name}");
            }
            else
            {
                // updates if needed
                if (existing.Name != evt.Name || existing.Description != evt.Description || existing.DisplayNameAr != evt.DisplayNameAr || existing.DisplayNameEn != evt.DisplayNameEn)
                {
                   existing.Name = evt.Name;
                   existing.Description = evt.Description;
                   existing.DisplayNameAr = evt.DisplayNameAr;
                   existing.DisplayNameEn = evt.DisplayNameEn;
                   await _unitOfWork.WorkflowEvents.UpdateAsync(existing.Id!, existing);
                   Console.WriteLine($"Updated seeded event: {evt.Name}");
                }
            }
        }

        // 2. Remove unwanted events
        foreach (var existing in existingEvents)
        {
            if (!eventsToKeep.Contains(existing.Code))
            {
                await _unitOfWork.WorkflowEvents.DeleteAsync(existing.Id!);
                Console.WriteLine($"Removed unwanted event: {existing.Name} ({existing.Code})");
            }
        }
    }
}
