using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.Login;

public class AdminLoginRequestDto
{
    [Required]
    public int CompanyId { get; set; }

    [Required]
    [EmailAddress]
    public string AdminEmail { get; set; } = null!;

    [Required]
    public string AdminPassword { get; set; } = null!;
}
