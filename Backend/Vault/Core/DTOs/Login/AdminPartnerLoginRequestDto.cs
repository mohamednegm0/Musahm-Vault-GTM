using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.Login;

public class AdminPartnerLoginRequestDto
{
    [Required]
    public string IdentityNumber { get; set; } = null!;

    [Required]
    [EmailAddress]
    public string AdminEmail { get; set; } = null!;

    [Required]
    public string AdminPassword { get; set; } = null!;
}
