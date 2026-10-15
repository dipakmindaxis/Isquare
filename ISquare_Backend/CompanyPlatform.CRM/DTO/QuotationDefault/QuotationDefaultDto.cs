using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Quotation
{
    public class QuotationDefaultDto
    {
        public int QuotationDefaultId { get; set; }

        [Required]
        [StringLength(200)]
        public string DefaultDeliveryPeriod { get; set; } = string.Empty;

        public int? PaymentTermId { get; set; }

        [Required]
        [StringLength(500)]
        public string StandardWarranty { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string QuotationValidity { get; set; } = string.Empty;

        public string? StandardTermsAndConditions { get; set; }

        public string? CompanyName { get; set; }

        public string? GSTNumber { get; set; }

        public string? CompanyAddress { get; set; }

        public string? CompanyLogoPath { get; set; }

        public string? BankName { get; set; }

        public string? AccountNumber { get; set; }

        public string? IFSCCode { get; set; }

        public string? AccountHolderName { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}