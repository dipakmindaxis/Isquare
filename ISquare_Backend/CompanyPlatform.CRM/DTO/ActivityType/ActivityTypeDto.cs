using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.ActivityType
{
    public class ActivityTypeDto
    {
        public int ID { get; set; }

        [Required(ErrorMessage = "Activity Name is required.")]
        public string ActivityName { get; set; } = string.Empty;

        public string? ActivitySubType { get; set; }

        // New columns
        public string? SubjectPurpose { get; set; }

        public string? DiscussionNotesMOM { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}