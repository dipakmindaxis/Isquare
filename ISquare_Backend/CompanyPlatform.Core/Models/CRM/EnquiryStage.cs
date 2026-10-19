using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("EnquiryStages")]
    public class EnquiryStage
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EnquiryStageId { get; set; }

        [Required]
        [MaxLength(30)]
        public string EnquiryStageCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string EnquiryStageName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? EnquiryStageDescription { get; set; }

        public int? EnquiryStageSortOrder { get; set; }

        [Required]
        public bool EnquiryStageIsActive { get; set; } = true;

        [Required]
        public bool EnquiryStageIsDeleted { get; set; } = false;

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime EnquiryStageCreatedAt { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "datetime2")]
        public DateTime? EnquiryStageUpdatedAt { get; set; }

    }
}