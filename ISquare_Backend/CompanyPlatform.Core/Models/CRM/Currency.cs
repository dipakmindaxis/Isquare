using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Currencies")]
    public class Currency
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CurrencyId { get; set; }

        [Required]
        [MaxLength(30)]
        public string CurrencyCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string CurrencyName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? CurrencyDescription { get; set; }

        public int? CurrencySortOrder { get; set; }

        [Required]
        public bool CurrencyIsActive { get; set; } = true;

        [Required]
        public bool CurrencyIsDeleted { get; set; } = false;

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime CurrencyCreatedAt { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "datetime2")]
        public DateTime? CurrencyUpdatedAt { get; set; }
    }
}