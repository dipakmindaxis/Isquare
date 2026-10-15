using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.Company
{
    [Table("tbl_QuotationDefault")]
    public class QuotationDefault
    {
        [Key]
        public int QuotationDefaultId { get; set; }

        [Required]
        [StringLength(200)]
        public string DefaultDeliveryPeriod { get; set; }
            = "2-3 Weeks from PO confirmation";

        // Reference to the existing PaymentTerm master.
        public int? PaymentTermId { get; set; }

        [Required]
        [StringLength(500)]
        public string StandardWarranty { get; set; }
            = "12 Months from installation or 18 months from supply";

        [Required]
        [StringLength(100)]
        public string QuotationValidity { get; set; }
            = "30 Calendar Days";

        public string? StandardTermsAndConditions { get; set; }

        // Company details printed on quotations.
        [StringLength(200)]
        public string? CompanyName { get; set; }

        [StringLength(30)]
        public string? GSTNumber { get; set; }

        [StringLength(500)]
        public string? CompanyAddress { get; set; }

        [StringLength(500)]
        public string? CompanyLogoPath { get; set; }

        // Bank details printed on quotations.
        [StringLength(150)]
        public string? BankName { get; set; }

        [StringLength(50)]
        public string? AccountNumber { get; set; }

        [StringLength(20)]
        public string? IFSCCode { get; set; }

        [StringLength(150)]
        public string? AccountHolderName { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}