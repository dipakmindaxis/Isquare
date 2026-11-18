namespace CompanyPlatform.CRM.DTO.TaxAndCompliance
{
    public class StatutoryRecordDto
    {
        public string EmployeeName { get; set; } = string.Empty;
        public string EmployeeId { get; set; } = string.Empty;
        public decimal PfWages { get; set; }
        public decimal PfContribution { get; set; }
        public decimal EsicWages { get; set; }
        public decimal EsicContribution { get; set; }
        public decimal Tds { get; set; }
        public decimal Pt { get; set; }
    }

    public class ComplianceDashboardStatsDto
    {
        public decimal TotalPfContribution { get; set; }
        public decimal TotalEsicContribution { get; set; }
        public decimal TotalTdsDeducted { get; set; }
        public int PendingReturns { get; set; }

        public int? LatestCompletedRunId {  get; set; }
    }

    public class UpdateComplianceStatusDto
    {
        public int Id { get; set; }
        public DateTime FiledDate { get; set; }
        public string? TransactionId { get; set; }
        public string? Notes { get; set; }
    }

    public class ComplianceItemDetailsDto
    {
        public string ComplianceType { get; set; } = string.Empty;
        public DateTime? FiledDate { get; set; }
        public string? TransactionId { get; set; }
        public string? Notes { get; set; }
    }


}
