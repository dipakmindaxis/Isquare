using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.Company
{
    [Table("tbl_Quotation")]
    public class Quotation
    {
        [Key]
        public int QuotationId { get; set; }

        [Required]
        [StringLength(50)]
        public string QuotationNumber { get; set; } = string.Empty;

        public int CustomerId { get; set; }

        public int? EnquiryId { get; set; }

        public DateTime QuotationDate { get; set; } = DateTime.UtcNow;

        public int RevisionNumber { get; set; } = 0;

        [Required]
        [StringLength(30)]
        public string Status { get; set; } = "Draft";

        [Required]
        [StringLength(30)]
        public string ApprovalStatus { get; set; } = "NotRequired";

        [Column(TypeName = "decimal(18,2)")]
        public decimal Subtotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxableAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal FreightCharges { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal InstallationCharges { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal OtherCharges { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal GrandTotal { get; set; }

        [StringLength(200)]
        public string? DeliveryPeriod { get; set; }

        public int? PaymentTermId { get; set; }

        [StringLength(500)]
        public string? Warranty { get; set; }

        public DateTime? ValidUntil { get; set; }

        public string? TermsAndConditions { get; set; }

        public string? CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}