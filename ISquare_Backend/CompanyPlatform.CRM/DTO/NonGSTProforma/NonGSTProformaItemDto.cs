namespace CompanyPlatform.CRM.DTO.NonGSTProforma
{
    public class NonGSTProformaItemDto
    {
        public int NonGSTProformaItemId { get; set; }
        public int NonGSTProformaId { get; set; }
        public int SrNo { get; set; }
        public string? Services { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Amount { get; set; }
        public decimal TotalAmount { get; set; }
    }
}
