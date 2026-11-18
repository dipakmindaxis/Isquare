using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("tbl_ActivityType")]
    public class ActivityType
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public string ActivityName { get; set; } = string.Empty;

        public string? ActivitySubType { get; set; }

        // New columns
        public string? SubjectPurpose { get; set; }

        public string? DiscussionNotesMOM { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}