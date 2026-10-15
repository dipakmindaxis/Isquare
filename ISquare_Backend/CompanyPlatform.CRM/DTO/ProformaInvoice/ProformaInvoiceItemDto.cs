using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.ProformaInvoice
{
    public class ProformaInvoiceItemDto
    {
        public int ProformaItemId { get; set; }

        public int ProformaId { get; set; }

        public int SrNo { get; set; }

        public string? Services { get; set; }

        [Required(ErrorMessage = "Item description is required.")]
        public string Description { get; set; } = string.Empty;

        public decimal Quantity { get; set; }

        public decimal Rate { get; set; }

        public decimal Amount { get; set; }

        public decimal TaxableValue { get; set; }

        public decimal CGSTRate { get; set; }

        public decimal CGSTAmount { get; set; }

        public decimal SGSTRate { get; set; }

        public decimal SGSTAmount { get; set; }

        public decimal TotalAmount { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}
