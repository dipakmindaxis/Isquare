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
//    [Table("tbl_EmployeeBankDetails")]
//    public class EmployeeBankDetails
//    {
//        [Key]
//        public int ID { get; set; }

//        [Required]
//        public string BeneficiaryName { get; set; }

//        [Required]
//        public string BankName { get; set; }

//        [Required]
//        public string AccountNumber { get; set; }

//        [Required]
//        public string IFSCCode { get; set; }

//        public int EmployeeID { get; set; }


//        [ForeignKey("EmployeeID")]
//        public Employee Employee { get; set; }
//        [DefaultValue(false)]
//        public bool IsDeleted { get; set; }

//    }
//}
