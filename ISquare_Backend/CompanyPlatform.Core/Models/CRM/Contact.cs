using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.Company
{
    [Table("tbl_Contact")]
    public class Contact
    {
        [Key]
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
        [StringLength(10)]
        [RegularExpression(@"^[0-9]{10}$")]
        public string MobileNo { get; set; } = string.Empty;

        [StringLength(10)]
        [RegularExpression(@"^[0-9]{10}$")]
        public string? AltMobileNo { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(254)]
        public string EmailAddress { get; set; } = string.Empty;

        [EmailAddress]
        [StringLength(254)]
        public string? AltEmailAddress { get; set; }

        // Audit fields
        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;

        // Navigation property
        [ForeignKey(nameof(CompanyId))]
        public virtual Company? Company { get; set; }
    }
}