using CompanyPlatform.Core.Models.CRM;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.Employee
{
    [Table("tbl_EmployeeStatutoryDetails")]
    public class EmployeeStatutoryDetails
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public string AadhaarNumber { get; set; } = string.Empty;

        [Required]
        public string PANNumber { get; set; } = string.Empty;

        public string? PassportNumber { get; set; }


        public string? UANNo { get; set; }


        public string? PFNo { get; set; }


        public string? ESINo { get; set; }

        // Foreign Key to tbl_Employee
        [Required]
        public int EmployeeID { get; set; }

        // Navigation Property
        [ForeignKey("EmployeeID")]
        public virtual CompanyPlatform.Core.Models.CRM.Employee.Employee Employee { get; set; } = null!;


        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

    }
}



