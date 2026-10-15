using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.AuditLog
{
    public class AuditLogDto
    {
        public int AuditLogId { get; set; }

        public int CompanyId { get; set; }

        [Required(ErrorMessage = "Table Name is required.")]
        public string TableName { get; set; }

        [Required(ErrorMessage = "Record Id is required.")]
        public int RecordId { get; set; }

        [Required(ErrorMessage = "Action is required.")]
        public string Action { get; set; }

        public string? OldValue { get; set; }

        public string? NewValue { get; set; }

        [Required(ErrorMessage = "User is required.")]
        public int UserId { get; set; }
        
        public string? EmployeeName { get; set; }

        public DateTime AuditDate { get; set; }

        public bool IsDeleted { get; set; }
    }
}