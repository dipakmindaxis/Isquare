namespace CompanyPlatform.CRM.DTO.TaxAndCompliance
{
    public class ComplianceStatusDto
    {
        public int Id { get; set; }
        public string Label { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // "Pending", "Filed", "Due"
        public string? DueDateInfo { get; set; }
    }
}
