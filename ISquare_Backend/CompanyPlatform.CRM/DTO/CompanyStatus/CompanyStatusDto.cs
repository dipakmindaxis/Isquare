using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.CompanyStatus
{
    public class CompanyStatusDto
    {
        public int ID { get; set; }

        [Required(ErrorMessage = "Company Status Name is required.")]
        public string CompanyStatusName { get; set; } = string.Empty;

        public bool IsActive { get; set; }
    }
}
