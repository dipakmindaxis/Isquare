using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.TaskStatus
{
    public class TaskStatusDto
    {
        public int ID { get; set; }

        [Required(ErrorMessage = "Status Name is required.")]
        public string StatusName { get; set; } = string.Empty;

        public bool IsDeleted { get; set; }
    }
}