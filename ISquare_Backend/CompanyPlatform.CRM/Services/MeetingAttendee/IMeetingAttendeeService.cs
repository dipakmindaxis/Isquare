using CompanyPlatform.Core.Controllers;
using CompanyPlatform.Core.DTO;

namespace CompanyPlatform.Core.Services
{
    public interface IMeetingAttendeeService
    {
        Task<IEnumerable<MeetingAttendeeDto>> GetAllMeetingAttendeesAsync();

        Task<MeetingAttendeeDto?> GetMeetingAttendeeByIdAsync(int id);

        Task<MeetingAttendeeDto> CreateMeetingAttendeeAsync(MeetingAttendeeDto dto);

        Task<bool> UpdateMeetingAttendeeAsync(int id, MeetingAttendeeDto dto);

        Task<bool> DeleteMeetingAttendeeAsync(int id);
    }
}