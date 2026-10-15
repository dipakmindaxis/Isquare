using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Quotation
{
    public class DecideQuotationApprovalDto
    {
        [Required]
        [RegularExpression(
            "^(Approved|Rejected)$",
            ErrorMessage = "Decision must be Approved or Rejected.")]
        public string Decision { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? ApproverComments { get; set; }
    }
}