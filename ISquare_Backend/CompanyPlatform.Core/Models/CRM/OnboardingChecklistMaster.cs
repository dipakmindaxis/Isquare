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
    [Table("tbl_OnboardingChecklistMaster")]
    public class OnboardingChecklistMaster
    {
        [Key]
        public int ID { get; set; }

        [Required]
        [MaxLength(150)]
        public string ChecklistName { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public bool IsMandatory { get; set; } = true;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public DateTime? UpdatedDate { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
