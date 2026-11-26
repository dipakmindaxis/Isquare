using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Quotation
{
    public class QuotationCustomerDecisionDto
    {
        [Required]
        public string Decision { get; set; } = string.Empty;

        [StringLength(2000)]
        public string? CustomerRemarks { get; set; }
    }
}
