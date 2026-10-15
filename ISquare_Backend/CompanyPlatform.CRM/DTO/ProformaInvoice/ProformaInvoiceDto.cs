using System;
using System.Collections.Generic;

namespace CompanyPlatform.CRM.DTO.ProformaInvoice
{
    public class ProformaInvoiceDto
    {
        public int ProformaId { get; set; }

        public string ProformaNo { get; set; } = string.Empty;

        public DateTime ProformaDate { get; set; }

        public int CompanyId { get; set; }

        public string CompanyName { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string GSTIN { get; set; } = string.Empty;

        public string State { get; set; } = string.Empty;

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
        public string Status { get; set; } = "Pending";
        public string? EmailBody { get; set; }
        public string? AdminEmailBody { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }

        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }
    }
}
