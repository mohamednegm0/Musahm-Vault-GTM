namespace Core.DTOs.Register;

public class RegisterPayloadDto
{
    // These names correspond to the Company Name in the target API structure
    public string CompanyNameAr { get; set; } = string.Empty;
    public string CompanyNameEn { get; set; } = string.Empty;
    
    // The "employeeModel" property from the target JSON
    public RegisterEmployeeDto EmployeeModel { get; set; } = new();
}
