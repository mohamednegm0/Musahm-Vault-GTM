using System.Collections.Generic;

namespace Core.DTOs.Login;

public class PartnerLoginResponseDto
{
    public List<string> PhoneNumbers { get; set; } = new();
    public bool SentByAbsher { get; set; }
    public int AcceptedResendOtpTime { get; set; }
}
