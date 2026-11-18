namespace CompanyPlatform.CRM.DTO.PaymentTerm
{
    public class PaymentTermDto
    {
        public int PaymentTermId { get; set; }

        public string PaymentTermName { get; set; } = string.Empty;

        public string PaymentTermCode { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}