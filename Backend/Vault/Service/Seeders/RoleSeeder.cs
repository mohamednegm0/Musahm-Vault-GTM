using Core.Constants;
using Core.Entities;
using Core.Repository;

namespace Service.Seeders;

public class RoleSeeder
{
    private readonly IUnitOfWork _unitOfWork;

    public RoleSeeder(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task SeedAsync()
    {
        var existingRoles = await _unitOfWork.Roles.GetAllAsync();
        var existingRoleCodes = new HashSet<string>(existingRoles.Select(r => r.Code));

        var roles = new[]
        {
            CreateRole(ConstRoles.Viewer, ConstRoles.NamesAr.Viewer, ConstRoles.NamesEn.Viewer, 
                ConstRoles.DescriptionsAr.Viewer, ConstRoles.DescriptionsEn.Viewer, ConstRoles.Levels.Viewer),
            CreateRole(ConstRoles.Commenter, ConstRoles.NamesAr.Commenter, ConstRoles.NamesEn.Commenter, 
                ConstRoles.DescriptionsAr.Commenter, ConstRoles.DescriptionsEn.Commenter, ConstRoles.Levels.Commenter),
            CreateRole(ConstRoles.Editor, ConstRoles.NamesAr.Editor, ConstRoles.NamesEn.Editor, 
                ConstRoles.DescriptionsAr.Editor, ConstRoles.DescriptionsEn.Editor, ConstRoles.Levels.Editor),
            CreateRole(ConstRoles.Organizer, ConstRoles.NamesAr.Organizer, ConstRoles.NamesEn.Organizer, 
                ConstRoles.DescriptionsAr.Organizer, ConstRoles.DescriptionsEn.Organizer, ConstRoles.Levels.Organizer),
            CreateRole(ConstRoles.Admin, ConstRoles.NamesAr.Admin, ConstRoles.NamesEn.Admin, 
                ConstRoles.DescriptionsAr.Admin, ConstRoles.DescriptionsEn.Admin, ConstRoles.Levels.Admin),
        };

        int addedCount = 0;
        foreach (var role in roles)
        {
            if (!existingRoleCodes.Contains(role.Code))
            {
                await _unitOfWork.Roles.AddAsync(role);
                addedCount++;
            }
        }

        if (addedCount > 0)
        {
             Console.WriteLine($"Successfully seeded {addedCount} new roles.");
        }
        else
        {
             Console.WriteLine("All roles already seeded.");
        }
    }

    private Role CreateRole(string code, string nameAr, string nameEn, string descriptionAr, string descriptionEn, int level)
    {
        return new Role
        {
            Code = code,
            NameAr = nameAr,
            NameEn = nameEn,
            DescriptionAr = descriptionAr,
            DescriptionEn = descriptionEn,
            Level = level,
            IsSystemRole = true,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
    }
}
