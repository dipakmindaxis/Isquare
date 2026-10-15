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
using CompanyPlatform.Core.Models.CRM.Company;

//namespace CompanyPlatform.Core.Models.CRM.Company

namespace CompanyPlatform.Core.Models.CRM.Call
{
    [Table("tbl_Call")]
    public class Call
    {
        [Key]
        public int CallId { get; set; }

        [Required]
        public int CompanyId { get; set; }
        [ForeignKey("CompanyId")]
        public virtual CompanyPlatform.Core.Models.CRM.Company.Company Company { get; set; }

        [Required]
        public int CallTypeId { get; set; }
        [ForeignKey("CallTypeId")]
        public virtual CallType CallType { get; set; }

        [Required]
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual Employees User { get; set; }

        [Required]
        public DateTime CallDate { get; set; }

        [Required]
        public int Duration { get; set; }

        [Required]
        public string Status { get; set; }

        public string? Remarks { get; set; }

        public DateTime? NextFollowUpDate { get; set; }

        [Required]
        public int CreatedBy { get; set; }
        [ForeignKey("CreatedBy")]
        public virtual Employees CreatedByEmployee { get; set; }

        [Required]
        public DateTime CreatedDate { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}