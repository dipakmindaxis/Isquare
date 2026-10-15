using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Product
{
    public class ProductDto
    {
        public int ProductId { get; set; }

        public string ItemCode { get; set; } = string.Empty;

        [Required]
        public string ProductName { get; set; } = string.Empty;

        public string? Brand { get; set; }

        public string? Specification { get; set; }

        public int? UnitOfMeasurementId { get; set; }

        [Range(typeof(decimal), "0", "9999999999999999")]
        public decimal StandardRate { get; set; }

        [Range(typeof(decimal), "0", "100")]
        public decimal GSTRate { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}