using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Tasks
{
    public class AssignTaskDto
    {
        [Required(ErrorMessage = "Assigned To is required.")]
        public int AssignedTo { get; set; }

        [Required(ErrorMessage = "Assigned By is required.")]
        public int AssignedBy { get; set; }
    }
}