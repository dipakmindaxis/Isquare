using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.Director
{
    [Table("tbl_Director")]
    public class Director
    {
        [Key]
        public int DirectorId { get; set; }

        [Required]
        public string DirectorName { get; set; } = string.Empty;

        [Required]
        public string DirectorCode { get; set; } = string.Empty;

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}