namespace CompanyPlatform.CRM.DTO.Invoice
{
    public class InvoiceItemDto
    {
        public int InvoiceItemId { get; set; }
        public int InvoiceId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal GSTPercentage { get; set; }
        public decimal GSTAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;

        public string? ItemDescription { get => Description; set => Description = value; }
        public decimal TaxRate { get => GSTPercentage; set => GSTPercentage = value; }
        public decimal TaxAmount { get => GSTAmount; set => GSTAmount = value; }
    }
}
