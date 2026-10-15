using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Quotation
{
    public class CreateQuotationApprovalDto
    {
        [Required]
        [Range(1, int.MaxValue)]
        public int QuotationId { get; set; }

        [MaxLength(500)]
        public string? ApprovalReason { get; set; }
    }
}