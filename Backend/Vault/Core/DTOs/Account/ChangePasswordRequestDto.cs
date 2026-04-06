using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.Account;

public class ChangePasswordRequestDto
{
    [Required]
    public string OldPassword { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$", 
        ErrorMessage = "يجب أن يكون عدد الحروف 8 ويجب أن يوجد احرف كبيرة وصغيرة ويجب إضافة رموز")]
    public string NewPassword { get; set; } = string.Empty;

    [Required]
    [Compare(nameof(NewPassword))]
    public string ConfirmPassword { get; set; } = string.Empty;
}
