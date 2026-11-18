using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("sales_user_manager")]
    public class SalesUserManager
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public string UserName { get; set; } = string.Empty;

        [Required]
        public string Code { get; set; } = string.Empty;

        [DefaultValue(true)]
        public bool IsActive { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}