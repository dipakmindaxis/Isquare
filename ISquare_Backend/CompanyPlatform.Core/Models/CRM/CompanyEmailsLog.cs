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

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("tbl_CompanyEmailsLog")]
    public class CompanyEmailsLog
    {
        [Key]
        public int EmailLogId { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string Body { get; set; } = string.Empty;

        [Required]
        public string SentTo { get; set; } = string.Empty;

        public DateTime SentDate { get; set; }

        public string Status { get; set; } = string.Empty;

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

        [ForeignKey("CompanyId")]
        public virtual Company Company { get; set; } = null!;

        [ForeignKey("UserId")]
        public virtual Employee.Employee User { get; set; } = null!;
    }
}

