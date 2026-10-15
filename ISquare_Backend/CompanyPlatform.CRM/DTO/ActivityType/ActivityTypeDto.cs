using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.ActivityType
{
    public class ActivityTypeDto
    {
        public int ID { get; set; }

        [Required(ErrorMessage = "Activity Name is required.")]
        public string ActivityName { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}