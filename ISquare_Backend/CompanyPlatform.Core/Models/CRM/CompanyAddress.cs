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
    [Table("tbl_CompanyAddresses")]
    public class CompanyAddress
    {
        [Key]
        public int AddressId { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        [StringLength(30)]
        public string AddressType { get; set; }

        [Required]
        [StringLength(500)]
        public string Address { get; set; }

        [Required]
        public int CountryId { get; set; }

        [Required]
        public int StateId { get; set; }

        [Required]
        public int CityId { get; set; }

        [Required]
        [StringLength(10)]
        public string Pincode { get; set; }

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

        // Company navigation (Uncomment when Company Master is available)
        //[ForeignKey("CompanyId")]
        //public virtual Company? Company { get; set; }

        [ForeignKey("CountryId")]
        public virtual Country? Country { get; set; }

        [ForeignKey("StateId")]
        public virtual State? State { get; set; }

        [ForeignKey("CityId")]
        public virtual City? City { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual Employee? CreatedByEmployee { get; set; }
    }
}
