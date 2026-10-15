using Microsoft.AspNetCore.Http;

namespace CompanyPlatform.Core.DTO.MeetingAttachment
{
    public class MeetingAttachmentsDto
    {
        public int AttachmentId { get; set; }

        public int MeetingId { get; set; }

        public string FileName { get; set; } = string.Empty;

        public string FilePath { get; set; } = string.Empty;

        public int UploadedBy { get; set; }

        public IFormFile? File { get; set; }
    }
}