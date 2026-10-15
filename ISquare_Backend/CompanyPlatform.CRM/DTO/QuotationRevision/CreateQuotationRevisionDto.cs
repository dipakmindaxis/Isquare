using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Quotation
{
    public class CreateQuotationRevisionDto
    {
        [Required]
        [Range(1, int.MaxValue)]
        public int QuotationId { get; set; }

        [Required]
        [MaxLength(1000)]
        public string RevisionReason { get; set; } = string.Empty;
    }
}