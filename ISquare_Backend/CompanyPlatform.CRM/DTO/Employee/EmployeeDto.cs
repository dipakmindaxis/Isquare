using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Employee
{
    // Response DTO
    public class EmployeeDto
    {
        public int ID { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string? MiddleName { get; set; }
        public string LastName { get; set; } = string.Empty;
        public string FullName => $"{FirstName} {(string.IsNullOrWhiteSpace(MiddleName) ? "" : MiddleName + " ")}{LastName}".Trim();
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string MobileNumber { get; set; } = string.Empty;
        public string EmailAddress { get; set; } = string.Empty;
        public string? PresentAddress { get; set; }
        public DateTime? DateOfJoining { get; set; }
        public int? WorkLocationID { get; set; }
        public string? WorkLocationName { get; set; }
        public int? DepartmentID { get; set; }
        public string? DepartmentName { get; set; }
        public int? DesignationID { get; set; }
        public string? DesignationName { get; set; }
        public int? ReportingTo { get; set; }
        public string? ReportingToName { get; set; }
        public string? UserId { get; set; }
        public DateTime? DateOfLeaving { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
    }

    // Create DTO
    public class CreateEmployeeDto
    {
        public string? EmployeeCode { get; set; }

        [Required(ErrorMessage = "First name is required.")]
        public string FirstName { get; set; } = string.Empty;

        public string? MiddleName { get; set; }

        [Required(ErrorMessage = "Last name is required.")]
        public string LastName { get; set; } = string.Empty;

        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }

        public string? MobileNumber { get; set; }

        [Required(ErrorMessage = "Email address is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string EmailAddress { get; set; } = string.Empty;

        public string? PresentAddress { get; set; }
        public DateTime? DateOfJoining { get; set; }
        public int? WorkLocationID { get; set; }
        public int? DepartmentID { get; set; }
        public int? DesignationID { get; set; }
        public int? ReportingTo { get; set; }
        public string? UserId { get; set; }
        public bool IsActive { get; set; } = true;
    }

    // Update DTO
    public class UpdateEmployeeDto
    {
        public string? EmployeeCode { get; set; }

        [Required(ErrorMessage = "First name is required.")]
        public string FirstName { get; set; } = string.Empty;

        public string? MiddleName { get; set; }

        [Required(ErrorMessage = "Last name is required.")]
        public string LastName { get; set; } = string.Empty;

        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? MobileNumber { get; set; }

        [Required(ErrorMessage = "Email address is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string EmailAddress { get; set; } = string.Empty;

        public string? PresentAddress { get; set; }
        public DateTime? DateOfJoining { get; set; }
        public int? WorkLocationID { get; set; }
        public int? DepartmentID { get; set; }
        public int? DesignationID { get; set; }
        public int? ReportingTo { get; set; }
        public string? UserId { get; set; }
        public DateTime? DateOfLeaving { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
