using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.BDEUser
{
    public class BDEUserDto
    {
        public int ID { get; set; }

        [Required(ErrorMessage = "Value is required.")]
        public string Value { get; set; } = string.Empty;

        [Required(ErrorMessage = "Code is required.")]
        public string Code { get; set; } = string.Empty;

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        [DefaultValue(false)]
        public bool IsDeleted { get; set; } = false;

        // Director or reporting Employee ID
        public int? DirectorEmployeeId { get; set; }
    }
}