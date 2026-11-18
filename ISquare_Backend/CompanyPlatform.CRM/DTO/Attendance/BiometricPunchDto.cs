using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Attendance
{
    public class BiometricPunchDto
    {
        [Required]
        public string EmployeeCode { get; set; } = string.Empty;

        [Required]
        public DateTime PunchTime { get; set; }

        public string? DeviceId { get; set; }
    }
}
