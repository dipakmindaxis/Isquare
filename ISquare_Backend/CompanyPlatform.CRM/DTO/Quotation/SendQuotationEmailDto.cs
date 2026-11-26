using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Quotation
{
    public class SendQuotationEmailDto
    {
        [EmailAddress]
        public string? CustomerEmail { get; set; }

        [StringLength(200)]
        public string? Subject { get; set; }

        [StringLength(2000)]
        public string? Message { get; set; }

        public int? ExpiryDays { get; set; }
    }
}
