using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.DocumentType
{
    public class DocumentTypeDto
    {
        public int ID { get; set; }

        [Required(ErrorMessage = "Document Name is required.")]
        public string DocumentName { get; set; }

        [Required(ErrorMessage = "Code is required.")]
        public string Code { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}