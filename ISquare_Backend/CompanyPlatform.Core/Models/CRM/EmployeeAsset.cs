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
    [Table("tbl_EmployeeAsset")]
    public class EmployeeAsset
    {
        [Key]
        public int EmployeeAssetID { get; set; }

        [Required]
        public int EmployeeID { get; set; }

        [ForeignKey(nameof(EmployeeID))]
        public virtual Employee Employee { get; set; }

        [Required]
        public int AssetID { get; set; }

        [ForeignKey(nameof(AssetID))]
        public virtual AssetMaster Asset { get; set; }

        // Date when asset is assigned
        [Required]
        public DateTime AllocationDate { get; set; }

        // Optional expected return date
        public DateTime? ExpectedReturnDate { get; set; }

        // Filled when asset is returned
        public DateTime? ReturnedDate { get; set; }

        [Required]
        [MaxLength(30)]
        public string AllocationStatus { get; set; } = "Allocated";
        /*
            Allocated
            Returned
            Lost
            Damaged
        */

     

        [MaxLength(50)]
        public string? ReturnCondition { get; set; }
        /*
            Good
            Damaged
            Lost
        */

        [Column(TypeName = "nvarchar(max)")]
        public string? Remarks { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public DateTime? UpdatedDate { get; set; }
      
    }
}

