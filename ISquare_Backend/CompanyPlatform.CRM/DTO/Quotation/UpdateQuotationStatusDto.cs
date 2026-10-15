using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Quotation
{
    public class UpdateQuotationStatusDto
    {
        [Required(ErrorMessage = "Status is required.")]
        [StringLength(30, ErrorMessage = "Status cannot exceed 30 characters.")]
        public string Status { get; set; } = string.Empty;
    }
}
