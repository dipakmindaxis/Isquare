using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("ProductServices")]
    public class ProductServiceItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProductServiceId { get; set; }

        [Required]
        [MaxLength(30)]
        public string ProductServiceCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string ProductServiceName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? ProductServiceDescription { get; set; }

        public int? ProductServiceSortOrder { get; set; }

        [Required]
        public bool ProductServiceIsActive { get; set; } = true;

        [Required]
        public bool ProductServiceIsDeleted { get; set; } = false;

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime ProductServiceCreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public int ProductServiceCreatedBy { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? ProductServiceUpdatedAt { get; set; }

        public int? ProductServiceUpdatedBy { get; set; }
    }
}