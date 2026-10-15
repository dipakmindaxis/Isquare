using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.TaskAssignment
{

    public class CreateTaskAssignmentDto
    {
        [Required(ErrorMessage = "Task Id is required.")]
        public int TaskId { get; set; }

        [Required(ErrorMessage = "Assigned To is required.")]
        public int AssignedTo { get; set; }

        [Required(ErrorMessage = "Assigned By is required.")]
        public int AssignedBy { get; set; }

        [Required(ErrorMessage = "Assigned Date is required.")]
        public DateTime AssignedDate { get; set; }

        public string? Remarks { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
