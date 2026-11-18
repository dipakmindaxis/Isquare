using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using CompanyPlatform.Core.Models.CRM.Employee;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_EmployeeTaxDeclaration")]
    public class EmployeeTaxDeclaration
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int EmployeeID { get; set; }

        //[ForeignKey("EmployeeID")]
        //public virtual Employees Employee { get; set; }

        [Required]
        public string FinancialYear { get; set; } = string.Empty; // e.g., "2024-2025"

        [Required]
        public string TaxRegime { get; set; } = string.Empty; // "Old" or "New"
        public DateTime DeclarationDate { get; set; }

        public string Status { get; set; } = string.Empty; // "Declared", "Approved"

        public virtual ICollection<EmployeeDeclarationDetail> DeclarationDetails { get; set; } = new List<EmployeeDeclarationDetail>(); 
    }
}
