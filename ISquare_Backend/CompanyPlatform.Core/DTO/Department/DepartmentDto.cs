using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO.Department
{
    public class DepartmentDto
    {
        public int ID { get; set; }

        [Required(ErrorMessage = "Department name is required.")]
        public string DepartmentName { get; set; } = string.Empty;
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

    }
}
