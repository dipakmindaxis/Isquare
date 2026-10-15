using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Quotation
{
    public class QuotationItemDto
    {
        public int QuotationItemId { get; set; }

        [Range(1, int.MaxValue)]
        public int QuotationId { get; set; }

        public int? ProductId { get; set; }

        public int? ParentQuotationItemId { get; set; }

        public bool IsAccessory { get; set; }

        public string? ItemCode { get; set; }

        [Required]
        [StringLength(200)]
        public string ItemName { get; set; } = string.Empty;

        public string? Brand { get; set; }

        public string? Specification { get; set; }

        [Range(typeof(decimal), "0.001", "999999999")]
        public decimal Quantity { get; set; }

        public int? UnitOfMeasurementId { get; set; }

        [Range(typeof(decimal), "0", "9999999999999999")]
        public decimal Rate { get; set; }

        [Range(typeof(decimal), "0", "100")]
        public decimal DiscountPercentage { get; set; }

        public decimal DiscountAmount { get; set; }

        [Range(typeof(decimal), "0", "100")]
        public decimal GSTRate { get; set; }

        public decimal TaxableAmount { get; set; }

        public decimal TaxAmount { get; set; }

        public decimal LineTotal { get; set; }

        public int DisplayOrder { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}