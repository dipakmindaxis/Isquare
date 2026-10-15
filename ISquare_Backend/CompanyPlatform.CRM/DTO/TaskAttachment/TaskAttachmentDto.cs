using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.TaskAttachment
{
    public class TaskAttachmentDto
    {
        public int AttachmentId { get; set; }

        [Required(ErrorMessage = "Task Id is required.")]
        public int TaskId { get; set; }

        [Required(ErrorMessage = "Document Name is required.")]
        public string? DocumentName { get; set; }

        public IFormFile? File { get; set; }

        public int UploadedBy { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;

        // ── File info fields returned in GET responses ──
        public string? FilePath { get; set; }

        public string? FileName { get; set; }

        public string? FileExtension { get; set; }

        public long FileSize { get; set; }

        public DateTime UploadedDate { get; set; }
    }
}
