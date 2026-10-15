using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.Company
{
    [Table("tbl_CustomerStatus")]
    public class CustomerStatus
    {
        [Key]
        public int CustomerStatusId { get; set; }

        [Required]
        public string StatusName { get; set; }

        public string? Description { get; set; }

        [Required]
        public string StatusCode { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}