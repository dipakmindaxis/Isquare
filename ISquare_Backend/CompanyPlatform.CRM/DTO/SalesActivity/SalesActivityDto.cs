using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.SalesActivity
{
    public class SalesActivityDto
    {
        public int ActivityId { get; set; }
        public string? ActivityCode { get; set; }
        public int? CompanyId { get; set; }
        public string? CustomerName { get; set; }
        public string? ContactPerson { get; set; }
        public string? ContactPhone { get; set; }
        public string? ContactEmail { get; set; }
        public int? AssignedEmployeeId { get; set; }
        public string? AssignedEmployeeName { get; set; }
        public string? AssignedType { get; set; }
        public int? AssignedTeamId { get; set; }
        public string? AssignedTeamName { get; set; }
        public string ActivityType { get; set; } = string.Empty;
        public string? ActivitySubType { get; set; }
        public DateTime? ActivityDate { get; set; }
        public string? ActivityTime { get; set; }
        public int? DurationMinutes { get; set; }
        public string Status { get; set; } = "Scheduled";
        public string? StatusDescription { get; set; }
        public string? Priority { get; set; }
        public int? PriorityId { get; set; }
        public string? Subject { get; set; }
        public string? DiscussionNotes { get; set; }
        public string? Outcome { get; set; }
        public string? Location { get; set; }
        public int? WorkLocationId { get; set; }
        public string? MeetingLink { get; set; }
        public string? MeetingType { get; set; }
        public string? CallOutcome { get; set; }
        public string? CallType { get; set; }
        public string? ProductName { get; set; }
        public string? SampleQuantity { get; set; }
        public string? RelatedRecordType { get; set; }
        public string? RelatedRecordId { get; set; }
        public string? RelatedRecordCode { get; set; }
        public string? RelatedRecordTitle { get; set; }
        public string? EnquiryId { get; set; }
        public string? DocumentCategory { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public string? DueTime { get; set; }
        public DateTime? NextActionDate { get; set; }
        public string? NextActionDetails { get; set; }
        public string? FollowUpStatus { get; set; }
        public int? FollowUpStatusId { get; set; }
        public int? FollowUpPriorityId { get; set; }
        public string? ReminderTitle { get; set; }
        public DateTime? ReminderDate { get; set; }
        public string? ReminderTime { get; set; }
        public string? ReminderRemarks { get; set; }
        public int? ReminderAssignedTo { get; set; }
        public int? ReminderPriorityId { get; set; }
        public int? ReminderStatusId { get; set; }
        public string? AttachmentsJson { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
    }

    public class CreateSalesActivityDto
    {
        public string? ActivityCode { get; set; }
        public int? CompanyId { get; set; }
        public string? CustomerName { get; set; }
        public string? ContactPerson { get; set; }
        public string? ContactPhone { get; set; }
        public string? ContactEmail { get; set; }
        public int? AssignedEmployeeId { get; set; }
        public string? AssignedEmployeeName { get; set; }
        public string? AssignedType { get; set; }
        public int? AssignedTeamId { get; set; }
        public string? AssignedTeamName { get; set; }

        [Required]
        public string ActivityType { get; set; } = string.Empty;

        public string? ActivitySubType { get; set; }
        public DateTime? ActivityDate { get; set; }
        public string? ActivityTime { get; set; }
        public int? DurationMinutes { get; set; }
        public string Status { get; set; } = "Scheduled";
        public string? StatusDescription { get; set; }
        public string? Priority { get; set; }
        public int? PriorityId { get; set; }
        public string? Subject { get; set; }
        public string? DiscussionNotes { get; set; }
        public string? Outcome { get; set; }
        public string? Location { get; set; }
        public int? WorkLocationId { get; set; }
        public string? MeetingLink { get; set; }
        public string? MeetingType { get; set; }
        public string? CallOutcome { get; set; }
        public string? CallType { get; set; }
        public string? ProductName { get; set; }
        public string? SampleQuantity { get; set; }
        public string? RelatedRecordType { get; set; }
        public string? RelatedRecordId { get; set; }
        public string? RelatedRecordCode { get; set; }
        public string? RelatedRecordTitle { get; set; }
        public string? EnquiryId { get; set; }
        public string? DocumentCategory { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public string? DueTime { get; set; }
        public DateTime? NextActionDate { get; set; }
        public string? NextActionDetails { get; set; }
        public string? FollowUpStatus { get; set; }
        public int? FollowUpStatusId { get; set; }
        public int? FollowUpPriorityId { get; set; }
        public string? ReminderTitle { get; set; }
        public DateTime? ReminderDate { get; set; }
        public string? ReminderTime { get; set; }
        public string? ReminderRemarks { get; set; }
        public int? ReminderAssignedTo { get; set; }
        public int? ReminderPriorityId { get; set; }
        public int? ReminderStatusId { get; set; }
        public string? AttachmentsJson { get; set; }
        public int? CreatedBy { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class UpdateSalesActivityDto : CreateSalesActivityDto
    {
        public int? UpdatedBy { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
