using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO.Contact
{
    public class ContactDto
    {
        public int ContactId { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        [StringLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Department { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Designation { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^[0-9]{10}$")]
        public string MobileNo { get; set; } = string.Empty;

        [RegularExpression(@"^[0-9]{10}$")]
        public string? AltMobileNo { get; set; }

        [Required]
        [EmailAddress]
        public string EmailAddress { get; set; } = string.Empty;

        [EmailAddress]
        public string? AltEmailAddress { get; set; }

        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}