using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.AuditLog
{
    public class AuditLogDto
    {
        public int AuditLogId { get; set; }

        public int CompanyId { get; set; }

        [Required(ErrorMessage = "Table Name is required.")]
        public string TableName { get; set; } = string.Empty;

        public string? EntityName { get; set; }

        [Required(ErrorMessage = "Record Id is required.")]
        public int RecordId { get; set; }

        [Required(ErrorMessage = "Action is required.")]
        public string Action { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? OldValue { get; set; }

        public string? NewValue { get; set; }

        [Required(ErrorMessage = "User is required.")]
        public int UserId { get; set; }

        public string? EmployeeName { get; set; }

        public string? CreatedByEmployeeName { get; set; }

        public string? PreviousActionByEmployeeName { get; set; }

        public DateTime AuditDate { get; set; }

        public bool IsDeleted { get; set; }
    }

    public class AuditLogSummaryDto
    {
        public int TotalActivities { get; set; }
        public int CreateActivities { get; set; }
        public int UpdateActivities { get; set; }
        public int DeleteActivities { get; set; }
    }
}
