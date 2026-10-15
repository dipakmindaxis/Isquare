using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO.Meeting
{
    public class ReminderHistoryDto
    {
        public int ReminderHistoryId { get; set; }

        public int ReminderId { get; set; }

        public int ReminderStatusId { get; set; }

        public string? Remarks { get; set; }

        public int UpdatedBy { get; set; }

        public DateTime UpdatedDate { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}