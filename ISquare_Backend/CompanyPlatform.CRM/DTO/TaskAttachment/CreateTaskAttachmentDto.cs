using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.TaskAttachment
{
    public class CreateTaskAttachmentDto
    {
        [Required(ErrorMessage = "Task Id is required.")]
        public int TaskId { get; set; }

        [Required(ErrorMessage = "Document Name is required.")]
        public string? DocumentName { get; set; }

        [Required(ErrorMessage = "Please select a file.")]
        public IFormFile? File { get; set; }

        public int UploadedBy { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
