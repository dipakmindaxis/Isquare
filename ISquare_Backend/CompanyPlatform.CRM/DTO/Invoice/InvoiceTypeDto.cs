using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Invoice
{
    public class InvoiceTypeDto
    {
        public int ID { get; set; }

        [Required(ErrorMessage = "Invoice type name is required.")]
        public string InvoiceTypeName { get; set; } = string.Empty;

        [DefaultValue(true)]
        public bool IsActive { get; set; }
    }
}