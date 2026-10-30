using CompanyPlatform.Core.Models.CRM.Company;
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
    [Table("tbl_ActivityLog")]
    public class ActivityLog
    {
        [Key]
        public int ActivityLogId { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public string ActivityType { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public DateTime ActivityDate { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

        [ForeignKey("CompanyId")]
        public virtual Company Company { get; set; }

        [ForeignKey("UserId")]
        public virtual Employee User { get; set; }
    }
}
