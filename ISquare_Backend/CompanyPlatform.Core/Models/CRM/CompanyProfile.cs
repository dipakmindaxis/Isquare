using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.Company
{
    [Table("tbl_CompanyProfile")]
    public class CompanyProfile
    {
        [Key]
        public int CompanyProfileId { get; set; }

        [Required]
        [StringLength(200)]
        public string CompanyName { get; set; } = string.Empty;

        [StringLength(100)]
        public string? LegalName { get; set; }

        [StringLength(30)]
        public string? GSTIN { get; set; }

        [StringLength(20)]
        public string? PAN { get; set; }

        [StringLength(500)]
        public string? Address { get; set; }

        [StringLength(100)]
        public string? City { get; set; }

        [StringLength(100)]
        public string? State { get; set; }

        [StringLength(10)]
        public string? PINCode { get; set; }

        [StringLength(100)]
        public string? Country { get; set; }

        [StringLength(150)]
        public string? Email { get; set; }

        [StringLength(20)]
        public string? Phone { get; set; }

        [StringLength(500)]
        public string? Website { get; set; }

        [StringLength(500)]
        public string? LogoPath { get; set; }

        [StringLength(150)]
        public string? BankName { get; set; }

        [StringLength(150)]
        public string? AccountHolderName { get; set; }

        [StringLength(50)]
        public string? AccountNumber { get; set; }

        [StringLength(20)]
        public string? IFSCCode { get; set; }

        [StringLength(150)]
        public string? BranchName { get; set; }

        [StringLength(30)]
        public string? AccountType { get; set; }

        public bool IsDefault { get; set; } = true;

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}