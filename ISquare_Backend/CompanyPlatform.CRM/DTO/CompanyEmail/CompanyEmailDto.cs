using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.CompanyEmail
{
    public class CompanyEmailDto
    {
        public int EmailId { get; set; }

        [Required(ErrorMessage = "Company Id is required.")]
        public int CompanyId { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        public bool IsPrimary { get; set; }

        public DateTime CreatedDate { get; set; }

        public bool IsDeleted { get; set; }
    }
}