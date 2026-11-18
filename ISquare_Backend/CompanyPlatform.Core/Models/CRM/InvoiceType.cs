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
    [Table("tbl_InvoiceType")]
    public class InvoiceType
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public string InvoiceTypeName { get; set; } = string.Empty;

        [DefaultValue(true)]
        public bool IsActive { get; set; }
    }
}