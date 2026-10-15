using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO
{
    public class CompanyPhoneDto
    {
        public int PhoneId { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        [StringLength(30)]
        public string PhoneType { get; set; }

        [Required]
        [StringLength(20)]
        public string PhoneNumber { get; set; }

        public bool IsPrimary { get; set; }

        public bool IsActive { get; set; }

        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }
    }
}