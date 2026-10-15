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
    [Table("tbl_ProformaInvoiceItem")]
    public class ProformaInvoiceItem
    {
        [Key]
        public int ProformaItemId { get; set; }

        [Required]
        public int ProformaId { get; set; }

        [Required]
        public int SrNo { get; set; }

        public string? Services { get; set; }

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Rate { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Amount { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal TaxableValue { get; set; }

        [Required]
        [Column(TypeName = "decimal(5, 2)")]
        public decimal CGSTRate { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal CGSTAmount { get; set; }

        [Required]
        [Column(TypeName = "decimal(5, 2)")]
        public decimal SGSTRate { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal SGSTAmount { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal TotalAmount { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        [DefaultValue(false)]
        public bool IsDeleted { get; set; } = false;

        [Required]
        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        // Navigation Property
        [ForeignKey(nameof(ProformaId))]
        public virtual ProformaInvoice? ProformaInvoice { get; set; }
    }
}