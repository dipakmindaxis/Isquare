//using MindAxis.Model;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Attendance
{
    public class CreateAttendanceDto
    {
        [Required]
        public int EmployeeId { get; set; }

        [Required]
        public DateTime Date { get; set; }

        public DateTime? InTime { get; set; }

        public DateTime? OutTime { get; set; }

        public string? InDeviceID { get; set; }  

        public string? OutDeviceID { get; set; }

        //public AttendanceStatus Status { get; set; }

        public string? Notes { get; set; }
    }
}
