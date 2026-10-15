using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO.MeetingAttachment
{
    public class MeetingAttachmentsUploadDto
    {
        [Required]
        public int MeetingId { get; set; }

        [Required]
        public int UploadedBy { get; set; }

        [Required]
        public List<IFormFile> Files { get; set; } = new();
    }
}