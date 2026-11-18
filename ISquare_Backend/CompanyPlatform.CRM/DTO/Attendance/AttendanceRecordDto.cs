namespace CompanyPlatform.CRM.DTO.Attendance
{
    public class AttendanceRecordDto
    {
        public string EmployeeName { get; set; } = string.Empty;
        public string EmployeeId { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Plant { get; set; } = string.Empty;
        public InTimeDetails InTime { get; set; } = new();
        public string? OutTime { get; set; }
        public string? TotalHours { get; set; }
        public string Overtime { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    public class InTimeDetails
    {
        public string? Time { get; set; }
        public string? LateInfo { get; set; }
    }
}
