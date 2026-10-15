using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.NonGSTProforma
{
    public class PublicNonGSTProformaResponseDto
    {
        [Required]
        public string ProformaNo { get; set; } = string.Empty;

        [Required]
        public string Status { get; set; } = string.Empty;
    }
}
