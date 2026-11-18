using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.EmailTemplate
{
    public class EmailTemplateDto
    {
        public int ID { get; set; }

        [Required(ErrorMessage = "Template name is required.")]
        public string TemplateName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Subject is required.")]
        public string Subject { get; set; } = string.Empty;

        [Required(ErrorMessage = "Body is required.")]
        public string Body { get; set; } = string.Empty;

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}