using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.Login;

public class PartnerLoginRequestDto
{
    [Required]
    public string IdentityNumber { get; set; } = null!;

    public bool IsResend { get; set; }
}
