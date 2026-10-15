using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO.Meeting
{
    public class ReminderDto
    {
        public int ReminderId { get; set; }

        public int CompanyId { get; set; }

        public int AssignedTo { get; set; }

        public int ReminderStatusId { get; set; }

        public string Title { get; set; } = string.Empty;

        public DateTime ReminderDate { get; set; }

        public TimeSpan ReminderTime { get; set; }

        public string? Remarks { get; set; }

        public int PriorityId { get; set; }

        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}