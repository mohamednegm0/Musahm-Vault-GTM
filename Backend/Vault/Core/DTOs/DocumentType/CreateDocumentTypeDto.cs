using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.DocumentType
{
    public class CreateDocumentTypeDto
    {
        [Required]
        public string NameAr { get; set; } = null!;
        [Required]
        public string NameEn { get; set; } = null!;
        public string? Code { get; set; }
        public string? Description { get; set; }
        public string? Icon { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
