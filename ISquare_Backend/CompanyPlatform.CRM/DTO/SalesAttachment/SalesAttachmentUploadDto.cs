using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.SalesAttachment
{
    public class SalesAttachmentUploadDto
    {
        [Required]
        public IFormFile? File { get; set; }

        public int? CustomerId { get; set; }

        public int? EnquiryId { get; set; }

        public int? SalesActivityId { get; set; }

        [MaxLength(100)]
        public string? DocumentType { get; set; }
    }
}