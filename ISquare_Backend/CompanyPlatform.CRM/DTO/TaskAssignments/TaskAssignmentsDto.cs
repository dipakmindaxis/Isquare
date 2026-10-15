using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace CompanyPlatform.CRM.DTO.TaskAssignments
{
    // ─────────────────────────────────────────────
    // Main DTO – read / update
    // ─────────────────────────────────────────────
    public class TaskAssignmentsDto
    {
        public int AssignmentId { get; set; }

        [Required]
        public int TaskId { get; set; }

        [Required]
        public int AssignedTo { get; set; }

        [Required]
        public int AssignedBy { get; set; }

        public string? AssignmentStatus { get; set; }

        public string? Remarks { get; set; }

        [Required]
        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }

    // ─────────────────────────────────────────────
    // Assign Task DTO
    // ─────────────────────────────────────────────
    public class AssignTaskRequestDto
    {
        [Required(ErrorMessage = "Task Id is required.")]
        public int TaskId { get; set; }

        [Required(ErrorMessage = "Assigned To (UserId) is required.")]
        public int AssignedTo { get; set; }

        [Required(ErrorMessage = "Assigned By is required.")]
        public int AssignedBy { get; set; }

        public string? Remarks { get; set; }

        [Required]
        public int CreatedBy { get; set; }
    }

    // ─────────────────────────────────────────────
    // Reassign Task DTO
    // ─────────────────────────────────────────────
    public class ReassignTaskRequestDto
    {
        [Required(ErrorMessage = "New Assigned To (UserId) is required.")]
        public int NewAssignedTo { get; set; }

        [Required(ErrorMessage = "Reassigned By is required.")]
        public int ReassignedBy { get; set; }

        public string? Remarks { get; set; }

        [Required]
        public int UpdatedBy { get; set; }
    }

    // ─────────────────────────────────────────────
    // Upload Attachment DTO
    // ─────────────────────────────────────────────
    public class UploadTaskAssignmentAttachmentDto
    {
        [Required(ErrorMessage = "Task Id is required.")]
        public int TaskId { get; set; }

        [Required(ErrorMessage = "Document Name is required.")]
        public string? DocumentName { get; set; }

        [Required(ErrorMessage = "Please select a file.")]
        public IFormFile? File { get; set; }

        public int UploadedBy { get; set; }
    }

    // ─────────────────────────────────────────────
    // Task Timeline Item DTO
    // ─────────────────────────────────────────────
    public class TaskTimelineItemDto
    {
        public string EventType { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public int PerformedBy { get; set; }

        public DateTime EventDate { get; set; }
    }
}
