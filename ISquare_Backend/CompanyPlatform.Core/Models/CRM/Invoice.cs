using CompanyPlatform.Core.Models.CRM.Employee;
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
    [Table("tbl_Invoice")]
    public class Invoice
    {
        [Key]
        public int InvoiceId { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        public string InvoiceNumber { get; set; }

        [Required]
        public DateTime InvoiceDate { get; set; }

        [Required]
        public int ClientTypeId { get; set; }

        public string? GSTNumber { get; set; }

        [Required]
        public decimal SubTotal { get; set; }

        [Required]
        public decimal GSTAmount { get; set; }

        [Required]
        public decimal TotalAmount { get; set; }

        [Required]
        public string InvoiceStatus { get; set; }

        [Required]
        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        [DefaultValue(false)]
        public bool IsDeleted { get; set; } = false;

        // Navigation Properties

        [ForeignKey(nameof(CompanyId))]
        public virtual Company? Company { get; set; }

        [ForeignKey(nameof(ClientTypeId))]
        public virtual ClientType? ClientType { get; set; }

        [ForeignKey(nameof(CreatedBy))]
        public virtual Employees? CreatedByEmployee { get; set; }

        [ForeignKey(nameof(UpdatedBy))]
        public virtual Employees? UpdatedByEmployee { get; set; }
    }
}