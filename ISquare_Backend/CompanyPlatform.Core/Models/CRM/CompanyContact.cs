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
    [Table("tbl_CompanyContacts")]
    public class CompanyContact
    {
        [Key]
        public int ContactId { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        public string ContactPerson { get; set; }

        [Required]
        public int DesignationId { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Mobile { get; set; }

        public string? AlternateMobile { get; set; }

        [DefaultValue(false)]
        public bool IsPrimary { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

        [Required]
        public int CreatedBy { get; set; }

        [Required]
        public DateTime CreatedDate { get; set; }

        // Company Master is not created yet.
        // Uncomment after Company model is added.

        // [ForeignKey("CompanyId")]
        // public virtual Company? Company { get; set; }

        [ForeignKey("DesignationId")]
        public virtual Designation? Designation { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual Employee? CreatedByEmployee { get; set; }
    }
}
