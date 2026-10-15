using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Quotation
{
    public class CreateSalesOrderItemDto
    {
        [Required]
        [Range(1, int.MaxValue)]
        public int SalesOrderId { get; set; }

        public int? ProductId { get; set; }

        public int? ParentSalesOrderItemId { get; set; }

        public bool IsAccessory { get; set; }

        [MaxLength(100)]
        public string? ItemCode { get; set; }

        [Required]
        [MaxLength(200)]
        public string ItemName { get; set; } = string.Empty;

        [MaxLength(150)]
        public string? Brand { get; set; }

        [MaxLength(500)]
        public string? Specification { get; set; }

        [Range(typeof(decimal), "0.001", "999999999999")]
        public decimal Quantity { get; set; }

        [MaxLength(30)]
        public string? UnitOfMeasurement { get; set; }

        [Range(typeof(decimal), "0", "999999999999")]
        public decimal Rate { get; set; }

        [Range(typeof(decimal), "0", "100")]
        public decimal DiscountPercentage { get; set; }

        [Range(typeof(decimal), "0", "100")]
        public decimal GSTRate { get; set; }

        public int DisplayOrder { get; set; }
    }
}