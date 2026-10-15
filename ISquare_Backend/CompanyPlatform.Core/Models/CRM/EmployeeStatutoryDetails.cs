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
//    [Table("tbl_EmployeeStatutoryDetails")]
//    public class EmployeeStatutoryDetails
//    {
//        [Key]
//        public int ID { get; set; }

//        [Required]
//        public string AadhaarNumber { get; set; }

//        [Required]
//        public string PANNumber { get; set; }

       
//        public string? UANNo { get; set; }

        
//        public string? PFNo { get; set; }

     
//        public string? ESINo { get; set; }

//        // Foreign Key to tbl_Employee
//        [Required]
//        public int EmployeeID { get; set; }

//        // Navigation Property
//        [ForeignKey("EmployeeID")]
//        public virtual Employee Employee { get; set; }

       
//        [DefaultValue(false)]
//        public bool IsDeleted { get; set; }

//    }
//}
