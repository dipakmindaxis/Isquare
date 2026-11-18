namespace CompanyPlatform.Core.DTO.EmployeeReports
{
    public class EmployeeMasterReportDto
    {
        public string EmployeeCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string EmailAddress { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public DateTime? DateOfJoining { get; set; }
        public bool IsActive { get; set; }
    }

    public class HeadcountAnalysisDto
    {
        public string Department { get; set; } = string.Empty;
        public int EmployeeCount { get; set; }
    }

    public class AttendanceSummaryDto
    {
        public string EmployeeCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public int PresentDays { get; set; }
        public int AbsentDays { get; set; }
        public int HalfDays { get; set; }
        public int OnLeaveDays { get; set; }
    }

    public class LeaveBalanceReportDto
    {
        public string EmployeeCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string LeaveType { get; set; } = string.Empty;
        public decimal AllocatedDays { get; set; }
        public decimal AvailedDays { get; set; }
        public decimal BalanceDays { get; set; }
    }

    public class DepartmentWiseAnalysisDto
    {
        public string Department { get; set; } = string.Empty;
        public int TotalEmployees { get; set; }
    }

    public class MonthlySalaryRegisterDto
    {
        public string EmployeeCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public decimal PayableDays { get; set; }
        public decimal LOPDays { get; set; }
        public decimal GrossEarnings { get; set; }
        public decimal TotalDeductions { get; set; }
        public decimal NetSalary { get; set; }
        // This will hold dynamic earnings like Basic, HRA, etc.
        public Dictionary<string, decimal> Earnings { get; set; } = new();
        // This will hold dynamic deductions like PF, ESI, etc.
        public Dictionary<string, decimal> Deductions { get; set; } = new();
    }

    public class CostCenterAnalysisDto
    {
        public string Department { get; set; } = string.Empty;
        public decimal TotalCost { get; set; }
        public int EmployeeCount { get; set; }
    }

    public class OvertimeAnalysisDto
    {
        public string EmployeeCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public decimal OvertimeAmount { get; set; }
    }

    public class BonusIncentiveReportDto
    {
        public string EmployeeCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string FinancialYear { get; set; } = string.Empty;
        public decimal BonusAmount { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class BankTransferSummaryDto
    {
        public string EmployeeCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string IFSCCode { get; set; } = string.Empty;
        public decimal NetSalary { get; set; }
    }

    public class EmployerPfReportDto
    {
        public string EmployeeCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public decimal GrossEarnings { get; set; }
        public decimal EmployerPF { get; set; }
    }

    public class DetailedAttendanceReportDto
    {
        public string EmployeeCode { get; set; } = string.Empty;
        public string EmployeeName { get; set; } = string.Empty;
        public List<DailyAttendanceRecordDto> DailyRecords { get; set; } = new();
    }

    public class DailyAttendanceRecordDto
    {
        public int DayOfMonth { get; set; }
        public string Status { get; set; } = string.Empty;
        public string InTime { get; set; } = string.Empty;
        public string OutTime { get; set; } = string.Empty;
        public string TotalHours { get; set; } = string.Empty;
    }

    public class ExpenseClaimReportDto
    {
        public string EmployeeCode { get; set; } = string.Empty;
        public string EmployeeName { get; set; } = string.Empty;
        public string ExpenseType { get; set; } = string.Empty;
        public DateTime ClaimDate { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal? ApprovedAmount { get; set; }
        public string? ApproverName { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public string? Description { get; set; }
    }
}
