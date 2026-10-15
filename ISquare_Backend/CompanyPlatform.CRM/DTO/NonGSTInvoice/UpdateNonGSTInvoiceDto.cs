using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.NonGSTInvoice
{
    public class UpdateNonGSTInvoiceDto
    {
        [Required]
        public int NonGSTInvoiceId { get; set; }

        public string? InvoiceNo { get; set; }

        [Required]
        public DateTime InvoiceDate { get; set; }

        [Required]
        public int CompanyId { get; set; }

        public List<NonGSTInvoiceItemDto> Items { get; set; } = new List<NonGSTInvoiceItemDto>();

        public decimal TotalAmount { get; set; }

        public string? AmountInWords { get; set; }

        public string? Remarks { get; set; }
        
        public string? Status { get; set; }

        public int? UpdatedBy { get; set; }
    }
}
