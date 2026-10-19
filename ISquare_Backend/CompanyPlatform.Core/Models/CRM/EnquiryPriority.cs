using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("EnquiryPriorities")]
    public class EnquiryPriority
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EnquiryPriorityId { get; set; }

        [Required]
        [MaxLength(30)]
        public string EnquiryPriorityCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string EnquiryPriorityName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? EnquiryPriorityDescription { get; set; }

        public int? EnquiryPrioritySortOrder { get; set; }

        [Required]
        public bool EnquiryPriorityIsActive { get; set; } = true;

        [Required]
        public bool EnquiryPriorityIsDeleted { get; set; } = false;

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime EnquiryPriorityCreatedAt { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "datetime2")]
        public DateTime? EnquiryPriorityUpdatedAt { get; set; }
    }
}