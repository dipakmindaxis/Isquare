using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.EmailTemplate
{
    public class EmailTemplateDto
    {
        public int ID { get; set; }

        [Required(ErrorMessage = "Template name is required.")]
        public string TemplateName { get; set; }

        [Required(ErrorMessage = "Subject is required.")]
        public string Subject { get; set; }

        [Required(ErrorMessage = "Body is required.")]
        public string Body { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}