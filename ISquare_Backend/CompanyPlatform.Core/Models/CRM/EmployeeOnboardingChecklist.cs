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
    [Table("tbl_EmployeeOnboardingChecklist")]
    public class EmployeeOnboardingChecklist
    {
        [Key]
        public int ID { get; set; }

        public int OnboardingID { get; set; }

        public int ChecklistMasterID { get; set; }

        public bool IsCompleted { get; set; }

        public DateTime? CompletedDate { get; set; }

        public string? Remarks { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

        [ForeignKey(nameof(OnboardingID))]
        public virtual Onboarding Onboarding { get; set; }

        [ForeignKey(nameof(ChecklistMasterID))]
        public virtual OnboardingChecklistMaster ChecklistMaster { get; set; }
    }
}
