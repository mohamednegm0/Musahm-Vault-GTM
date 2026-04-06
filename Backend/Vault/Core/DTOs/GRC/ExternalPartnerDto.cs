namespace Core.DTOs.GRC
{
    public class ExternalPartnerDto
    {
        public int CompanyId { get; set; }
        public int PartnerId { get; set; }
        public int PartnerTitleId { get; set; }
        public int GroupId { get; set; }
        public string? ParnterTitleName { get; set; }
        public decimal SharesCount { get; set; }
        public string? Email { get; set; }
        public string? MobileNumber { get; set; }
        public int? MobileCountryCode { get; set; }
        public bool IsActive { get; set; }
        public string? NameAr { get; set; }
        public string? NameEn { get; set; }
        public string? IdentityNumber { get; set; }
        public string? ShareCertificateNumber { get; set; }
        public int MemberShipTypeId { get; set; }
        public string? ShareCreationDate { get; set; }
        public string? ShareUpdateDate { get; set; }
        public DateTime? GregorianShareCreationDate { get; set; }
        public DateTime? GregorianShareUpdateDate { get; set; }
        public int ResidenceId { get; set; }
        public string? ResidenceName { get; set; }
        public int CountryId { get; set; }
        public string? CountryName { get; set; }
        public bool CanSeePrivateFiles { get; set; }
        public bool IsNaturalPartner { get; set; }
        public bool IsUnderage { get; set; }
        public int GuardianId { get; set; }
        public bool IsAbsherDefaultOtp { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? HigryBirthDate { get; set; }
        public bool BirthDateIsHigry { get; set; }
        public string? Image { get; set; }
        public int BoardId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? EndReason { get; set; }
    }
}
