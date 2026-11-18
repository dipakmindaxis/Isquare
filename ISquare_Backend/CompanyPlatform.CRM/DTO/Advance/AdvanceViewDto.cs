namespace CompanyPlatform.CRM.DTO.Advance
{
    public class AdvanceViewDto
    {
        public int ID { get; set; }
        public int EmployeeID { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string RequestDate { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string StatusDate { get; set; } = string.Empty;
        public string ProcessedByName { get; set; } = string.Empty;
        public decimal TotalRepaid { get; set; }
        public decimal Balance { get; set; }
    }
}
