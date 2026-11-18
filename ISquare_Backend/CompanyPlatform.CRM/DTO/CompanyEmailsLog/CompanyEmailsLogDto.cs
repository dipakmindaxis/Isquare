using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.CompanyEmailsLog
{
    public class CompanyEmailsLogDto
    {
        public int EmailLogId { get; set; }

        [Required(ErrorMessage = "Company Id is required.")]
        public int CompanyId { get; set; }

        [Required(ErrorMessage = "User Id is required.")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "Subject is required.")]
        public string Subject { get; set; } = string.Empty;

        [Required(ErrorMessage = "Body is required.")]
        public string Body { get; set; } = string.Empty;

        [Required(ErrorMessage = "SentTo is required.")]
        public string SentTo { get; set; } = string.Empty;

        public DateTime SentDate { get; set; }

        public string Status { get; set; } = string.Empty;

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
