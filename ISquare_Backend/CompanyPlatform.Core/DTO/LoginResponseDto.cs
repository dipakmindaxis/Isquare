using CompanyPlatform.Core.DTO.AccessControl;
using System.ComponentModel;

namespace CompanyPlatform.Core.DTO
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public DateTime Expiration { get; set; }
        public string Email { get; set; } = string.Empty;

        public string? GoogleCalendarId { get; set; }
        public string Role { get; set; } = string.Empty;
        public int? WorkLocationID { get; set; }
        public int? DepartmentID { get; set; }
        public int? DesignationID { get; set; }
        public string EmployeeStatus { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
        public bool IsActive { get; set; }
        public int  EmployeeId { get; set; }
        public DateTime? DateOfJoining { get; set; }

        public string? PhotoPath { get; set; }
        public string? CompanyName { get; set; }

        public List<AccessControlDto> Permissions { get; set; } = new();
    }
}
