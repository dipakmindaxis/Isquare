using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.NonGSTInvoice
{
    public class CreateNonGSTInvoiceDto
    {
        public string? InvoiceNo { get; set; }

        [Required]
        public DateTime InvoiceDate { get; set; }

        [Required]
        public int CompanyId { get; set; }

        public List<CreateNonGSTInvoiceItemDto> Items { get; set; } = new List<CreateNonGSTInvoiceItemDto>();

        public decimal TotalAmount { get; set; }

        public string? AmountInWords { get; set; }

        public string? Remarks { get; set; }
        public string? TermsAndConditions { get; set; }
        public string? Status { get; set; }
        public string? EmailBody { get; set; }
        public string? AdminEmailBody { get; set; }

        public int CreatedBy { get; set; }
    }
}
