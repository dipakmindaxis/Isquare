using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("PlaceOfSupplies")]
    public class PlaceOfSupply
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PlaceOfSupplyId { get; set; }

        [Required]
        [MaxLength(30)]
        public string PlaceOfSupplyCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string PlaceOfSupplyName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? PlaceOfSupplyDescription { get; set; }

        public int? PlaceOfSupplySortOrder { get; set; }

        [Required]
        public bool PlaceOfSupplyIsActive { get; set; } = true;

        [Required]
        public bool PlaceOfSupplyIsDeleted { get; set; } = false;

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime PlaceOfSupplyCreatedAt { get; set; } = DateTime.UtcNow;


        [Column(TypeName = "datetime2")]
        public DateTime? PlaceOfSupplyUpdatedAt { get; set; }

    }
}