using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO.Meeting
{
    public class ReminderNotificationDto
    {
        public int ReminderNotificationId { get; set; }

        public int ReminderId { get; set; }

        public string NotificationType { get; set; } = string.Empty;

        public DateTime NotificationDate { get; set; }

        public string NotificationStatus { get; set; } = string.Empty;

        public int SentBy { get; set; }

        public string? Remarks { get; set; }

        public bool IsActive { get; set; }
    }
}