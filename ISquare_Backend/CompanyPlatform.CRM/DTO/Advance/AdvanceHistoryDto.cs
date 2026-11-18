using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

public class AdvanceRepaymentViewDto
{
    public decimal RepaymentAmount { get; set; }
    public string RepaymentDate { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string CreatedByName { get; set; } = string.Empty;
}

public class AdvanceHistoryDto
{
    public int AdvanceId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public decimal OriginalAmount { get; set; }
    public string RequestDate { get; set; } = string.Empty;
    public decimal TotalRepaid { get; set; }
    public decimal Balance { get; set; }
  
    public string Reason { get; set; } = string.Empty;
    public List<AdvanceRepaymentViewDto> Repayments { get; set; } = new();
}