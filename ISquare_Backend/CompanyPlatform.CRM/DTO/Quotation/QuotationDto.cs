using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Quotation
{
    public class QuotationDto
    {
        public int QuotationId { get; set; }

        public string? QuotationNumber { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int CustomerId { get; set; }

        public int? EnquiryId { get; set; }

        public DateTime? QuotationDate { get; set; }

        public int RevisionNumber { get; set; }

        public string? Status { get; set; }

        public string? ApprovalStatus { get; set; }

        public decimal Subtotal { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal TaxableAmount { get; set; }

        public decimal TaxAmount { get; set; }

        public decimal FreightCharges { get; set; }

        public decimal InstallationCharges { get; set; }

        public decimal OtherCharges { get; set; }

        public decimal GrandTotal { get; set; }

        public string? DeliveryPeriod { get; set; }

        public int? PaymentTermId { get; set; }

        public string? Warranty { get; set; }

        public DateTime? ValidUntil { get; set; }

        public string? TermsAndConditions { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}