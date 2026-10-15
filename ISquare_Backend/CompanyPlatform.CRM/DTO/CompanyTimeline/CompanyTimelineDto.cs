using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.CompanyTimeline
{
    public class CompanyTimelineDto
    {
        public int TimelineId { get; set; }

        [Required(ErrorMessage = "Company Id is required.")]
        public int CompanyId { get; set; }

        [Required(ErrorMessage = "Activity Type Id is required.")]
        public int ActivityTypeId { get; set; }

        public int? ReferenceId { get; set; }

        [Required(ErrorMessage = "User Id is required.")]
        public string UserId { get; set; }

        [Required(ErrorMessage = "Description is required.")]
        public string Description { get; set; }

        public DateTime CreatedDate { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
