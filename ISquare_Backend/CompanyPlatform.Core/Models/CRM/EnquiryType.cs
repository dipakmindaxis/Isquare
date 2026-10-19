using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("EnquiryTypes")]
    public class EnquiryType
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EnquiryTypeId { get; set; }

        [Required]
        [MaxLength(30)]
        public string EnquiryTypeCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string EnquiryTypeName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? EnquiryTypeDescription { get; set; }

        public int? EnquiryTypeSortOrder { get; set; }

        [Required]
        public bool EnquiryTypeIsActive { get; set; } = true;

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime EnquiryTypeCreatedAt { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "datetime2")]
        public DateTime? EnquiryTypeUpdatedAt { get; set; }

    }
}