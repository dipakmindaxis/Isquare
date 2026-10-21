using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("SalesTerritories")]
    public class SalesTerritory
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SalesTerritoryId { get; set; }

        [Required]
        [MaxLength(30)]
        public string SalesTerritoryCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string SalesTerritoryName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? SalesTerritoryDescription { get; set; }

        public int? SalesTerritorySortOrder { get; set; }

        [Required]
        public bool SalesTerritoryIsActive { get; set; } = true;

        [Required]
        public bool SalesTerritoryIsDeleted { get; set; } = false;

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime SalesTerritoryCreatedAt { get; set; } = DateTime.UtcNow;


        [Column(TypeName = "datetime2")]
        public DateTime? SalesTerritoryUpdatedAt { get; set; }

    }
}