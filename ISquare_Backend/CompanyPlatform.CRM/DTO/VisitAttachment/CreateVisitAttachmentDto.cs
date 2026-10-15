using Microsoft.AspNetCore.Http;
using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Meeting
{
    public class CreateVisitAttachmentDto
    {
        [Required(ErrorMessage = "Visit Id is required.")]
        public int VisitId { get; set; }

        [Required(ErrorMessage = "Document Name is required.")]
        public string? DocumentName { get; set; }

        [Required(ErrorMessage = "Please select a file.")]
        public IFormFile? File { get; set; }

        public bool IsActive { get; set; } = true;
    }
}