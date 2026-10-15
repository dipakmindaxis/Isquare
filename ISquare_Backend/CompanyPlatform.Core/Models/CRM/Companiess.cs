using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.Company
{
    [Table("tbl_Companiess")]
    public class Companiess
    {
        [Key]
        public int CompanyId { get; set; }

        [Required]
        [StringLength(250)]
        public string CompanyName { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Status { get; set; }

        // Audit Fields
        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}