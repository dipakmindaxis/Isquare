using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.SalesAttachment
{
    public class SalesAttachmentDto
    {
        public int SalesAttachmentId { get; set; }

        [Required]
        public string FileName { get; set; } = string.Empty;

        public long FileSize { get; set; }

        public string? ContentType { get; set; }

        public int? CustomerId { get; set; }

        public int? EnquiryId { get; set; }

        public int? SalesActivityId { get; set; }

        public string? DocumentType { get; set; }

        public int? UploadedBy { get; set; }

        public DateTime UploadedDate { get; set; }

        public bool IsActive { get; set; }
    }
}