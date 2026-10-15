using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.NonGSTProforma
{
    public class UpdateNonGSTProformaDto
    {
        [Required]
        public int NonGSTProformaId { get; set; }

        public string? ProformaNo { get; set; }

        [Required]
        public DateTime ProformaDate { get; set; }

        [Required]
        public int CompanyId { get; set; }

        public List<NonGSTProformaItemDto> Items { get; set; } = new List<NonGSTProformaItemDto>();

        public decimal TotalAmount { get; set; }

        public string? AmountInWords { get; set; }

        public string? Remarks { get; set; }

        public string? TermsAndConditions { get; set; }

        public string? Status { get; set; }

        public int? UpdatedBy { get; set; }
    }
}
