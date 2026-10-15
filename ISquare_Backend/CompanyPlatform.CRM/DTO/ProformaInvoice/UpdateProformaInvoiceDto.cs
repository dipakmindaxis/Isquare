using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.ProformaInvoice
{
    public class UpdateProformaInvoiceDto
    {
        public int ProformaId { get; set; }

        [Required(ErrorMessage = "Proforma number is required.")]
        public string ProformaNo { get; set; } = string.Empty;

        [Required(ErrorMessage = "Proforma date is required.")]
        public DateTime ProformaDate { get; set; }

        [Required(ErrorMessage = "Company is required.")]
        public int CompanyId { get; set; }

        public bool ReverseCharge { get; set; }

        public List<ProformaInvoiceItemDto> Items { get; set; } = new();

        public decimal TotalAmountBeforeTax { get; set; }

        public decimal TotalCGSTAmount { get; set; }

        public decimal TotalSGSTAmount { get; set; }

        public decimal TotalTaxAmount { get; set; }

        public decimal TotalAmountAfterTax { get; set; }

        public decimal GSTOnReverseCharge { get; set; }

        public string? AmountInWords { get; set; }

        public string? Remarks { get; set; }

        public string? TermsAndConditions { get; set; }

        public string? Status { get; set; }

        public bool IsActive { get; set; } = true;

        public int? UpdatedBy { get; set; }
    }
}
