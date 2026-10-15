using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.CallAttachment
{
    public class CreateCallAttachmentDto
    {
        [Required(ErrorMessage = "Call Id is required.")]
        public int CallId { get; set; }

        [Required(ErrorMessage = "Document Name is required.")]
        public string? DocumentName { get; set; }

        [Required(ErrorMessage = "Please select a file.")]
        public IFormFile? File { get; set; }

        public bool IsActive { get; set; } = true;
    }
}