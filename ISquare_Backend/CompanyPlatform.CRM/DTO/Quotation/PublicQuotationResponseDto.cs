using System;
using System.Collections.Generic;

namespace CompanyPlatform.CRM.DTO.Quotation
{
    public class PublicQuotationResponseDto
    {
        public Guid PublicResponseId { get; set; }
        public int QuotationId { get; set; }
        public string QuotationNumber { get; set; } = string.Empty;
        public DateTime QuotationDate { get; set; }
        public DateTime? ValidUntil { get; set; }
        public int RevisionNumber { get; set; }
        public string QuotationStatus { get; set; } = string.Empty;

        public string ResponseStatus { get; set; } = "Pending";
        public string CustomerEmail { get; set; } = string.Empty;
        public DateTime? EmailSentAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime? RespondedAt { get; set; }
        public string? CustomerRemarks { get; set; }
        public bool IsExpired { get; set; }
        public bool IsRevoked { get; set; }

        // Customer Details
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string? CustomerPhone { get; set; }
        public string? CustomerGstin { get; set; }
        public string? CustomerAddress { get; set; }

        // Sender Company Details
        public string CompanyName { get; set; } = string.Empty;
        public string? CompanyLegalName { get; set; }
        public string? CompanyAddress { get; set; }
        public string? CompanyEmail { get; set; }
        public string? CompanyPhone { get; set; }
        public string? CompanyGstin { get; set; }
        public string? CompanyLogoPath { get; set; }

        // Amounts & Commercial Terms
        public decimal Subtotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TaxableAmount { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal FreightCharges { get; set; }
        public decimal InstallationCharges { get; set; }
        public decimal OtherCharges { get; set; }
        public decimal GrandTotal { get; set; }

        public string? DeliveryPeriod { get; set; }
        public string? PaymentTermsName { get; set; }
        public string? Warranty { get; set; }
        public string? TermsAndConditions { get; set; }

        public List<QuotationItemDto> Items { get; set; } = new();
        public List<QuotationChargeDto> Charges { get; set; } = new();
    }
}
