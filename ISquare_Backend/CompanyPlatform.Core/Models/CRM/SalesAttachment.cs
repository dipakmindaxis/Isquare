using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("tbl_SalesAttachment")]
    public class SalesAttachment
    {
        [Key]
        public int SalesAttachmentId { get; set; }

        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string StoredFileName { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string FilePath { get; set; } = string.Empty;

        [MaxLength(150)]
        public string? ContentType { get; set; }

        public long FileSize { get; set; }

        public int? CustomerId { get; set; }

        public int? EnquiryId { get; set; }

        public int? SalesActivityId { get; set; }

        [MaxLength(100)]
        public string? DocumentType { get; set; }

        public int? UploadedBy { get; set; }

        public DateTime UploadedDate { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}