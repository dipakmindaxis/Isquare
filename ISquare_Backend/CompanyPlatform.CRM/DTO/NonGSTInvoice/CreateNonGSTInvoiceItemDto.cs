namespace CompanyPlatform.CRM.DTO.NonGSTInvoice
{
    public class CreateNonGSTInvoiceItemDto
    {
        public string? Services { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Amount { get; set; }
    }
}
