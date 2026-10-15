using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.CompanyDocument
{
    public class CompanyDocumentDto
    {
        [BindNever]
        public int DocumentId { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        public int DocumentTypeId { get; set; }

        [Required]
        public string DocumentName { get; set; }

        // File selected during Create/Update
        public IFormFile? File { get; set; }

        [Required]
        public int UploadedBy { get; set; }

        [BindNever]
        public DateTime UploadedDate { get; set; }

        public bool? IsActive { get; set; } = true;

        [BindNever]
        public string? FileName { get; set; }

        [BindNever]
        public string? FilePath { get; set; }

        [BindNever]
        public string? FileExtension { get; set; }

        [BindNever]
        public long FileSize { get; set; }
    }
}