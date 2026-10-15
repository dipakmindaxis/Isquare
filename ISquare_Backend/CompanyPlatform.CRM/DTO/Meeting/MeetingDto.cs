using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO.Meeting
{
    public class MeetingDto
    {
        public int MeetingId { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        public int MeetingTypeId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public DateTime MeetingDate { get; set; }

        [Required]
        public TimeSpan MeetingTime { get; set; }

        [Required]
        public int Duration { get; set; }

        public string? Location { get; set; }

        public string? Agenda { get; set; }

        public string? Outcome { get; set; }

        public DateTime? NextMeetingDate { get; set; }

        public string? Status { get; set; }

        [Required]
        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}