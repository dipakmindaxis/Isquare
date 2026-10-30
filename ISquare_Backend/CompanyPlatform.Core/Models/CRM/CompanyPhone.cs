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
    [Table("tbl_CompanyPhones")]
    public class CompanyPhone
    {
        [Key]
        public int PhoneId { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        [StringLength(30)]
        public string PhoneType { get; set; }

        [Required]
        [StringLength(20)]
        public string PhoneNumber { get; set; }

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

        // Uncomment when Company Master is available
        //[ForeignKey("CompanyId")]
        //public virtual Company? Company { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual Employee? CreatedByEmployee { get; set; }
    }
}
