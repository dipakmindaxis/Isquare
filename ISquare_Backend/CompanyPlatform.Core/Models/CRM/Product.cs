using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.Company
{
    [Table("tbl_Product")]
    public class Product
    {
        [Key]
        public int ProductId { get; set; }

        [Required]
        [StringLength(50)]
        public string ItemCode { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string ProductName { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Brand { get; set; }

        [StringLength(1000)]
        public string? Specification { get; set; }

        public int? UnitOfMeasurementId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal StandardRate { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal GSTRate { get; set; }

        [StringLength(50)]
        public string? HsnCode { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? PurchaseRate { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? ProfitPercentage { get; set; }

        public int? Stock { get; set; }

        [StringLength(500)]
        public string? ProductImage { get; set; }

        [NotMapped]
        public string? ProductImagePath
        {
            get => ProductImage;
            set => ProductImage = value;
        }

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}
