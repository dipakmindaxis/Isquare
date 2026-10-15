using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.CallAttachment
{
    public class CallAttachmentDto
    {
        public int AttachmentId { get; set; }

        [Required(ErrorMessage = "Call Id is required.")]
        public int CallId { get; set; }

        [Required(ErrorMessage = "Document Name is required.")]
        public string? DocumentName { get; set; }

        public IFormFile? File { get; set; }

        public int UploadedBy { get; set; }

        public bool IsActive { get; set; }

        public string? FileName { get; set; }
        public string? FilePath { get; set; }
        public string? FileExtension { get; set; }
        public long FileSize { get; set; }
        public DateTime UploadedDate { get; set; }

    }
}