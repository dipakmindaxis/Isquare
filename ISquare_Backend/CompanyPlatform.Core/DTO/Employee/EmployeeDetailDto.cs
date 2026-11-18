using System.ComponentModel;

namespace CompanyPlatform.Core.DTO.Employee
{
    public class EmployeeDetailDto
    {
        public int ID { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string? MiddleName { get; set; }
        public string LastName { get; set; } = string.Empty;
        public string FullName => $"{FirstName} {LastName}";
        public string EmailAddress { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        public DateTime? DateOfJoining { get; set; }
        public string? Gender { get; set; }
        public string? PresentAddress { get; set; }
        public int? WorkLocationID { get; set; }
        public string? WorkLocationName { get; set; }

        public int? DepartmentID { get; set; }
        public string? DepartmentName { get; set; }

        public int? DesignationID { get; set; }
        public string? DesignationName { get; set; }

        public string? GoogleCalendarId { get; set; }

        public int? LevelID { get; set; }
        public string LevelName { get; set; } = string.Empty;

        public int? ReportingTo { get; set; }
        public string? ReportingToName { get; set; }
        public string Role { get; set; } = string.Empty;

        public string PANNumber { get; set; } = string.Empty;        
        public string AadhaarNumber { get; set; } = string.Empty;
        public string? PassportNumber { get; set; }

        public int? CompanyId { get; set; }
        public string? CompanyName { get; set; }
        public string? PhotoPath { get; set; }

        public bool IsActive { get; set; }
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }

    public class SetReportingDto
    {
        public int EmployeeId { get; set; }
        public int ReportingToId { get; set; }
    }
}
