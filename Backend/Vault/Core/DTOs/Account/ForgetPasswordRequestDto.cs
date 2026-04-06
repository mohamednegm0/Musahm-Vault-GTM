using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.Account;

public class ForgetPasswordRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
