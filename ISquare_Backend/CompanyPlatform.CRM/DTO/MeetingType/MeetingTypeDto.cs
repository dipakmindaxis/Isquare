using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO.MeetingType
{
    public class MeetingTypeDto
    {
        public int ID { get; set; }

        [Required(ErrorMessage = "Meeting type name is required.")]
        public string MeetingTypeName { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; }
    }
}
