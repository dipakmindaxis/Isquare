//using System;
//using System.Collections.Generic;
//using System.ComponentModel;
//using System.ComponentModel.DataAnnotations;
//using System.ComponentModel.DataAnnotations.Schema;
//using System.Diagnostics.Metrics;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace CompanyPlatform.Core.Models.CRM.Company
//{
//    [Table("tbl_EmployeePFDetails")]
//    public class EmployeePFDetails
//    {
//        [Key]
//        public int ID { get; set; }

//        [Required]
//        public int EmployeeID { get; set; }

//        [Required]
//        [Column(TypeName = "decimal(5, 2)")]
//        [Range(0, 100, ErrorMessage = "PF Deduction Percentage must be between 0 and 100.")]
//        public decimal PFDeductionPercentage { get; set; }

//        [Required]
//        public bool IsCappedAt15k { get; set; }

//        [ForeignKey("EmployeeID")]
//        public virtual Employee Employee { get; set; }

//        [DefaultValue(false)]
//        public bool IsDeleted { get; set; }
//    }
//}
