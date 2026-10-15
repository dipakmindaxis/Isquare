using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
namespace CompanyPlatform.CRM.DTO.Invoice
{
    public class InvoiceDto
    {
        public int InvoiceId { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        public string InvoiceNumber { get; set; } = string.Empty;

        [Required]
        public DateTime InvoiceDate { get; set; }

        [Required]
        public int ClientTypeId { get; set; }

        public string? GSTNumber { get; set; }

        [Required]
        public decimal SubTotal { get; set; }

        [Required]
        public decimal GSTAmount { get; set; }

        [Required]
        public decimal TotalAmount { get; set; }

        [Required]
        public string InvoiceStatus { get; set; } = "Draft";

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;

        [Required]
        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public List<InvoiceItemDto>? Items { get; set; }

        public string? AmountInWords { get; set; }

        public string? TermsAndConditions { get; set; }

        public decimal? TotalAmountBeforeTax { get; set; }

        public decimal? TotalCGSTAmount { get; set; }

        public decimal? TotalSGSTAmount { get; set; }

        public string? StateName { get; set; }

        public string? EmailBody { get; set; }

        public string? AdminEmailBody { get; set; }
    }
}