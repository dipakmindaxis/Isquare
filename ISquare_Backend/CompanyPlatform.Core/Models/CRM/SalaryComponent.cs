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
    [Table("tbl_SalaryComponent")]
    public class SalaryComponent
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string ComponentName { get; set; }

        [Required]
        [StringLength(50)]
        public string ComponentType {  get; set; }  

        public bool IsTaxable { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; } 
    }
}
