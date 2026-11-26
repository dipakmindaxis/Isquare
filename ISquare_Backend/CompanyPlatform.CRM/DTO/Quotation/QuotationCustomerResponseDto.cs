using System;

namespace CompanyPlatform.CRM.DTO.Quotation
{
    public class QuotationCustomerResponseDto
    {
        public int QuotationCustomerResponseId { get; set; }
        public int QuotationId { get; set; }
        public string CustomerEmail { get; set; } = string.Empty;
        public Guid PublicResponseId { get; set; }
        public int RevisionNumber { get; set; }
        public string ResponseStatus { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; }
        public DateTime? EmailSentAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime? RespondedAt { get; set; }
        public string? CustomerRemarks { get; set; }
        public bool IsRevoked { get; set; }
        public string? PublicUrl { get; set; }
    }
}
