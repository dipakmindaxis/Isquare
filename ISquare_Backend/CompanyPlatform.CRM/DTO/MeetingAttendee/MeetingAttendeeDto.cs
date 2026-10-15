namespace CompanyPlatform.Core.DTOs
{
    public class MeetingAttendeeDto
    {
        public int AttendeeId { get; set; }
        public int MeetingId { get; set; }
        public int UserId { get; set; }
        public bool IsPresent { get; set; }
    }
}