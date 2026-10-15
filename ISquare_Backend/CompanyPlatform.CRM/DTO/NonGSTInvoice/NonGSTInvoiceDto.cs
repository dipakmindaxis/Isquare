using System;
using System.Collections.Generic;

namespace CompanyPlatform.CRM.DTO.NonGSTInvoice
{
    public class NonGSTInvoiceDto
    {
        public int NonGSTInvoiceId { get; set; }
        public string InvoiceNo { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; }
        public int CompanyId { get; set; }

        // Populated dynamically from Company and CompanyAddress data
        public string? CompanyName { get; set; }
        public string? Address { get; set; }
        public string? State { get; set; }

        public List<NonGSTInvoiceItemDto> Items { get; set; } = new List<NonGSTInvoiceItemDto>();

        public decimal TotalAmount { get; set; }
        public string? AmountInWords { get; set; }
        public string? Remarks { get; set; }
        public string? TermsAndConditions { get; set; }
        public string? Status { get; set; }
        public string? EmailBody { get; set; }
        public string? AdminEmailBody { get; set; }

        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
    }
}
