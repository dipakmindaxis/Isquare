using System;

namespace CompanyPlatform.CRM.DTO.Quotation
{
    public class QuotationChargeDto
    {
        public int QuotationChargeId { get; set; }

        public int QuotationId { get; set; }

        public string ChargeName { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string ChargeType { get; set; } = "Fixed";

        public decimal ChargeAmount { get; set; }

        public decimal TaxRate { get; set; }

        public decimal TaxAmount { get; set; }

        public decimal TotalAmount { get; set; }

        public bool IsTaxable { get; set; }

        public bool IsActive { get; set; }
    }
}