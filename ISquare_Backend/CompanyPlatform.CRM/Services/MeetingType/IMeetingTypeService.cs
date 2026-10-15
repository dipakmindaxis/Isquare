using CompanyPlatform.Core.DTO;
using CompanyPlatform.Core.DTO.MeetingType;

namespace CompanyPlatform.Core.Services.MeetingType
{
    public interface IMeetingTypeService
    {
        Task<IEnumerable<MeetingTypeDto>> GetAllMeetingTypesAsync();
        Task<MeetingTypeDto> GetMeetingTypeByIdAsync(int id);
        Task<MeetingTypeDto> CreateMeetingTypeAsync(MeetingTypeDto meetingTypeDto);
        Task<bool> UpdateMeetingTypeAsync(int id, MeetingTypeDto meetingTypeDto);
        Task<bool> DeleteMeetingTypeAsync(int id);
    }
}