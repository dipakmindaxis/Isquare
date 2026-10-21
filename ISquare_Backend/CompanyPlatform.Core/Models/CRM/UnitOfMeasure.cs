using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("UnitOfMeasures")]
    public class UnitOfMeasure
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UnitOfMeasureId { get; set; }

        [Required]
        [MaxLength(30)]
        public string UnitOfMeasureCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string UnitOfMeasureName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? UnitOfMeasureDescription { get; set; }

        public int? UnitOfMeasureSortOrder { get; set; }

        [Required]
        public bool UnitOfMeasureIsActive { get; set; } = true;

        [Required]
        public bool UnitOfMeasureIsDeleted { get; set; } = false;

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime UnitOfMeasureCreatedAt { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "datetime2")]
        public DateTime? UnitOfMeasureUpdatedAt { get; set; }

    }
}