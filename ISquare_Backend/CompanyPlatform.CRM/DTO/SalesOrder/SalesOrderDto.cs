using System;

namespace CompanyPlatform.CRM.DTO.Quotation
{
    public class SalesOrderDto
    {
        public int SalesOrderId { get; set; }

        public string SalesOrderNumber { get; set; } = string.Empty;

        public int? QuotationId { get; set; }

        public int CustomerId { get; set; }

        public DateTime OrderDate { get; set; }

        public DateTime? ExpectedDeliveryDate { get; set; }

        public string OrderStatus { get; set; } = "Pending";

        public decimal Subtotal { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal TaxableAmount { get; set; }

        public decimal TaxAmount { get; set; }

        public decimal FreightCharges { get; set; }

        public decimal OtherCharges { get; set; }

        public decimal GrandTotal { get; set; }

        public string? PaymentTerms { get; set; }

        public string? DeliveryAddress { get; set; }

        public string? Remarks { get; set; }

        public string? CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}