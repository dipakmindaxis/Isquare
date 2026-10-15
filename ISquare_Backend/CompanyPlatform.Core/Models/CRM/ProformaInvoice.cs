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
    [Table("tbl_ProformaInvoice")]
    public class ProformaInvoice
    {
        [Key]
        public int ProformaId { get; set; }

        [Required]
        public string ProformaNo { get; set; } = string.Empty;

        [Required]
        public DateTime ProformaDate { get; set; }

        [Required]
        public int CompanyId { get; set; }

        public bool ReverseCharge { get; set; } = false;

        [Column(TypeName = "decimal(18, 2)")]
        public decimal TotalAmountBeforeTax { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal TotalCGSTAmount { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal TotalSGSTAmount { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal TotalTaxAmount { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal TotalAmountAfterTax { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal GSTOnReverseCharge { get; set; }

        public string? AmountInWords { get; set; }

        public string? Remarks { get; set; }

        public string? TermsAndConditions { get; set; }

        public string Status { get; set; } = "Pending";

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        [DefaultValue(false)]
        public bool IsDeleted { get; set; } = false;

        [Required]
        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(CompanyId))]
        public virtual Company? Company { get; set; }

        public virtual ICollection<ProformaInvoiceItem>? ProformaInvoiceItems { get; set; }
    }
}