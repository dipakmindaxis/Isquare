using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO
{
    public class CompanyContactDto
    {
        public int ContactId { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        public string ContactPerson { get; set; } = string.Empty;

        [Required]
        public int DesignationId { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Mobile { get; set; } = string.Empty;

        public string? AlternateMobile { get; set; }

        public bool IsPrimary { get; set; }

        public bool IsActive { get; set; }

        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }
    }
}