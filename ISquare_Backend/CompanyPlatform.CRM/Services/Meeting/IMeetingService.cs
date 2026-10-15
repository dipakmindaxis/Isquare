using CompanyPlatform.Core.DTO.Meeting;

namespace CompanyPlatform.Core.Services
{
    public interface IMeetingService
    {
        Task<IEnumerable<MeetingDto>> GetAllMeetingsAsync();

        Task<MeetingDto?> GetMeetingByIdAsync(int id);

        Task<MeetingDto> CreateMeetingAsync(MeetingDto meetingDto);

        Task<bool> UpdateMeetingAsync(int id, MeetingDto meetingDto);

        Task<bool> DeleteMeetingAsync(int id);
    }
}