using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("LostReasons")]
    public class LostReason
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LostReasonId { get; set; }

        [Required]
        [MaxLength(30)]
        public string LostReasonCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string LostReasonName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? LostReasonDescription { get; set; }

        public int? LostReasonSortOrder { get; set; }

        [Required]
        public bool LostReasonIsActive { get; set; } = true;

        [Required]
        public bool LostReasonIsDeleted { get; set; } = false;

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime LostReasonCreatedAt { get; set; } = DateTime.UtcNow;


        [Column(TypeName = "datetime2")]
        public DateTime? LostReasonUpdatedAt { get; set; }

    }
}