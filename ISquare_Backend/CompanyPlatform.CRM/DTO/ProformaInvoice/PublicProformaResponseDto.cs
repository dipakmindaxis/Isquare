using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.ProformaInvoice
{
    public class PublicProformaResponseDto
    {
        [Required]
        public string ProformaNo { get; set; } = string.Empty;

        [Required]
        public string Status { get; set; } = string.Empty;
    }
}
