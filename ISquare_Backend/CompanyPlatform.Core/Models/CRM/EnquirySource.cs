using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("EnquirySources")]
    public class EnquirySource
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EnquirySourceId { get; set; }

        [Required]
        [MaxLength(30)]
        public string EnquirySourceCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string EnquirySourceName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? EnquirySourceDescription { get; set; }

        public int? EnquirySourceSortOrder { get; set; }

        [Required]
        public bool EnquirySourceIsActive { get; set; } = true;

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime EnquirySourceCreatedAt { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "datetime2")]
        public DateTime? EnquirySourceUpdatedAt { get; set; }
            
    }
}