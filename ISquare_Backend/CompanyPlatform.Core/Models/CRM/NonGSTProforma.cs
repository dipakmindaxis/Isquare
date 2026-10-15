using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.Company
{
    [Table("tbl_NonGSTProforma")]
    public class NonGSTProforma
    {
        [Key]
        public int NonGSTProformaId { get; set; }

        [Required]
        public string ProformaNo { get; set; }

        [Required]
        public DateTime ProformaDate { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        public string? AmountInWords { get; set; }

        public string? Remarks { get; set; }

        public string? TermsAndConditions { get; set; }

        public string Status { get; set; } = "Pending";

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        [DefaultValue(false)]
        public bool IsDeleted { get; set; } = false;

        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        // Navigation Property
        [ForeignKey(nameof(CompanyId))]
        public virtual Company? Company { get; set; }
    }
}
