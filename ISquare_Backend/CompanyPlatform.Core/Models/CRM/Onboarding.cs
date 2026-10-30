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
    [Table("tbl_Onboarding")]
    public class Onboarding
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int EmployeeID { get; set; }

        [ForeignKey(nameof(EmployeeID))]
        public virtual Employee Employee { get; set; }

        [Required]
        public DateTime JoiningDate { get; set; }

        public DateTime? OfferAcceptedDate { get; set; }

        public DateTime? ProbationEndDate { get; set; }

        [Required]
        public string Status { get; set; } = "Pending";
        /*
            Pending
            In Progress
            Completed
            Cancelled
        */

        // Progress Percentage
        public int Progress { get; set; } = 0;

        // HR Remarks
        [Column(TypeName = "nvarchar(max)")]
        public string? Remarks { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public DateTime? UpdatedDate { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}

