using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.Company
{
    [Table("tbl_CustomerTypes")]
    public class CustomerTypes
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string CustomerTypeName { get; set; }

        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;
    }
}