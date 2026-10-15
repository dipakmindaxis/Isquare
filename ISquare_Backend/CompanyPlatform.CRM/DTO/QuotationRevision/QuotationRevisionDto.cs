using System;

namespace CompanyPlatform.CRM.DTO.Quotation
{
    public class QuotationRevisionDto
    {
        public int QuotationRevisionId { get; set; }

        public int QuotationId { get; set; }

        public string RevisionNumber { get; set; } = "R0";

        public string? RevisionReason { get; set; }

        public string? RevisedBy { get; set; }

        public DateTime RevisionDate { get; set; }

        public string? QuotationNumber { get; set; }

        public int? CustomerId { get; set; }

        public int? EnquiryId { get; set; }

        public DateTime? QuotationDate { get; set; }

        public string? QuotationStatus { get; set; }

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
    }
}