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

        public string? HtmlBody { get; set; }

        public string? PdfBase64 { get; set; }

        [StringLength(255)]
        public string? PdfFileName { get; set; }
    }
}
