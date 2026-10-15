using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.Company
{
    [Table("tbl_QuotationRevision")]
    public class QuotationRevision
    {
        [Key]
        public int QuotationRevisionId { get; set; }

        [Required]
        public int QuotationId { get; set; }

        [Required]
        [MaxLength(20)]
        public string RevisionNumber { get; set; } = "R0";

        [MaxLength(1000)]
        public string? RevisionReason { get; set; }

        [MaxLength(100)]
        public string? RevisedBy { get; set; }

        public DateTime RevisionDate { get; set; } = DateTime.UtcNow;

        // Snapshot of quotation header details
        [MaxLength(100)]
        public string? QuotationNumber { get; set; }

        public int? CustomerId { get; set; }

        public int? EnquiryId { get; set; }

        public DateTime? QuotationDate { get; set; }

        [MaxLength(50)]
        public string? QuotationStatus { get; set; }

        public decimal Subtotal { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal TaxableAmount { get; set; }

        public decimal TaxAmount { get; set; }

        public decimal FreightCharges { get; set; }

        public decimal InstallationCharges { get; set; }

        public decimal OtherCharges { get; set; }

        public decimal GrandTotal { get; set; }

        [MaxLength(200)]
        public string? DeliveryPeriod { get; set; }

        public int? PaymentTermId { get; set; }

        [MaxLength(500)]
        public string? Warranty { get; set; }

        public DateTime? ValidUntil { get; set; }

        public string? TermsAndConditions { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}