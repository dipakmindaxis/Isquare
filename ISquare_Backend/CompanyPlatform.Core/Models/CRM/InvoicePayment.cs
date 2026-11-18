using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("tbl_InvoicePayments")]
    public class InvoicePayment
    {
        [Key]
        public int PaymentId { get; set; }

        [Required]
        public int InvoiceId { get; set; }

        [Required]
        public DateTime PaymentDate { get; set; }

        [Required]
        public string PaymentMode { get; set; } = string.Empty;

        public string? TransactionId { get; set; }

        [Required]
        public decimal PaidAmount { get; set; }

        [Required]
        public decimal BalanceAmount { get; set; }

        [Required]
        public string PaymentStatus { get; set; } = string.Empty;

        public string? Remarks { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

        // Navigation Property
        [ForeignKey("InvoiceId")]
        public virtual Invoice? Invoice { get; set; }
    }
}