using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("EnquiryStatuses")]
    public class EnquiryStatus
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EnquiryStatusId { get; set; }

        [Required]
        [MaxLength(30)]
        public string EnquiryStatusCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string EnquiryStatusName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? EnquiryStatusDescription { get; set; }

        public int? EnquiryStatusSortOrder { get; set; }

        [Required]
        public bool EnquiryStatusIsActive { get; set; } = true;

        [Required]
        public bool EnquiryStatusIsDeleted { get; set; } = false;

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime EnquiryStatusCreatedAt { get; set; } = DateTime.UtcNow;


        [Column(TypeName = "datetime2")]
        public DateTime? EnquiryStatusUpdatedAt { get; set; }

    }
}