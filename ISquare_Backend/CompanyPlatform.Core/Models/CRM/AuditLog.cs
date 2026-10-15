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
    [Table("tbl_AuditLog")]
    public class AuditLog
    {
        [Key]
        public int AuditLogId { get; set; }

        [Required]
        public string TableName { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        public int RecordId { get; set; }

        [Required]
        public string Action { get; set; }

        public string? OldValue { get; set; }

        public string? NewValue { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public DateTime AuditDate { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}