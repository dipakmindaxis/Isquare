namespace CompanyPlatform.CRM.DTO.Quotation
{
    public class SalesOrderItemDto
    {
        public int SalesOrderItemId { get; set; }

        public int SalesOrderId { get; set; }

        public int? ProductId { get; set; }

        public int? ParentSalesOrderItemId { get; set; }

        public bool IsAccessory { get; set; }

        public string? ItemCode { get; set; }

        public string ItemName { get; set; } = string.Empty;

        public string? Brand { get; set; }

        public string? Specification { get; set; }

        public decimal Quantity { get; set; }

        public string? UnitOfMeasurement { get; set; }

        public decimal Rate { get; set; }

        public decimal DiscountPercentage { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal GSTRate { get; set; }

        public decimal TaxableAmount { get; set; }

        public decimal TaxAmount { get; set; }

        public decimal LineTotal { get; set; }

        public int DisplayOrder { get; set; }
    }
}