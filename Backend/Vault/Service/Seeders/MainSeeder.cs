namespace Service.Seeders;

public class MainSeeder
{
    private readonly PermissionSeeder _permissionSeeder;
    private readonly RoleSeeder _roleSeeder;
    private readonly RolePermissionSeeder _rolePermissionSeeder;
    private readonly DocumentTypeSeeder _documentTypeSeeder;
    private readonly TriggerSeeder _triggerSeeder;
    private readonly EventSeeder _eventSeeder;
    private readonly ActionSeeder _actionSeeder;
    public MainSeeder(
        PermissionSeeder permissionSeeder,
        RoleSeeder roleSeeder,
        RolePermissionSeeder rolePermissionSeeder,
        DocumentTypeSeeder documentTypeSeeder,
        TriggerSeeder triggerSeeder,
        EventSeeder eventSeeder,
        ActionSeeder actionSeeder)
    {
        _permissionSeeder = permissionSeeder;
        _roleSeeder = roleSeeder;
        _rolePermissionSeeder = rolePermissionSeeder;
        _documentTypeSeeder = documentTypeSeeder;
        _triggerSeeder = triggerSeeder;
        _eventSeeder = eventSeeder;
        _actionSeeder = actionSeeder;
    }

    public async Task SeedAsync()
    {
        Console.WriteLine("Starting Main Seeding Process...");

        try
        {
            await _permissionSeeder.SeedAsync();
            await _roleSeeder.SeedAsync();
            await _rolePermissionSeeder.SeedAsync();
            await _documentTypeSeeder.SeedAsync();
            await _triggerSeeder.SeedAsync();
            await _eventSeeder.SeedAsync();
            await _actionSeeder.SeedAsync();
            
            Console.WriteLine("Main Seeding Process Completed Successfully.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Main Seeding Process Failed: {ex.Message}");
            throw; // Re-throw to ensure the app knows startup failed if critical
        }
    }
}
