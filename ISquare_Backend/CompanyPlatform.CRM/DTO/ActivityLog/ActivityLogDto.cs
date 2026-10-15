using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.ActivityLog
{
    public class ActivityLogDto
    {
        public int ActivityLogId { get; set; }

        [Required(ErrorMessage = "Company is required.")]
        public int CompanyId { get; set; }

        [Required(ErrorMessage = "User is required.")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "Activity Type is required.")]
        public string ActivityType { get; set; }

        [Required(ErrorMessage = "Description is required.")]
        public string Description { get; set; }

        public DateTime ActivityDate { get; set; }

        public bool IsDeleted { get; set; }
    }
}