using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("ProductCategories")]
    public class ProductCategory
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProductCategoryId { get; set; }

        [Required]
        [MaxLength(30)]
        public string ProductCategoryCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string ProductCategoryName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? ProductCategoryDescription { get; set; }

        public int? ProductCategorySortOrder { get; set; }

        [Required]
        public bool ProductCategoryIsActive { get; set; } = true;

        [Required]
        public bool ProductCategoryIsDeleted { get; set; } = false;

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime ProductCategoryCreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public int ProductCategoryCreatedBy { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? ProductCategoryUpdatedAt { get; set; }

        public int? ProductCategoryUpdatedBy { get; set; }
    }
}