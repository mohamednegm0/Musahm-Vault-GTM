namespace Core.DTOs.Country;

public class CountryDto
{
    public int Id { get; set; }
    public string CountryNameEn { get; set; } = string.Empty;
    public string CountryNameAr { get; set; } = string.Empty;
    public int CountryCode { get; set; }
    public string TimeZone { get; set; } = string.Empty;
}
