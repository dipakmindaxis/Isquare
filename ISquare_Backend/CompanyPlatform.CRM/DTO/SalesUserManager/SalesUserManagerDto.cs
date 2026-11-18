using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.SalesUserManager
{
    public class SalesUserManagerDto
    {
        public int ID { get; set; }

        [Required(ErrorMessage = "User Name is required.")]
        public string UserName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Code is required.")]
        public string Code { get; set; } = string.Empty;

        [DefaultValue(true)]
        public bool IsActive { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}