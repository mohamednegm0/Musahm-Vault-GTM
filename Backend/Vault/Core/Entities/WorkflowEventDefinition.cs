using Core.Interfaces;
using System.ComponentModel.DataAnnotations;

namespace Core.Entities;

public class WorkflowEventDefinition : IEntity
{
    [Key]
    public string? Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string Code { get; set; } = null!;

    [Required]
    public string Name { get; set; } = null!; // Internal name

    public string? DisplayNameEn { get; set; }
    public string? DisplayNameAr { get; set; }

    public string? Description { get; set; }
}
