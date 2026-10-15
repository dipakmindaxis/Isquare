using CompanyPlatform.Core.DTO;
using CompanyPlatform.Core.DTO.MeetingAttachment;

namespace CompanyPlatform.Core.Services.MeetingAttachment
{
    public interface IMeetingAttachmentsService
    {
        Task<List<MeetingAttachmentsDto>> GetAllAsync();

        Task<MeetingAttachmentsDto?> GetByIdAsync(int attachmentId);

        Task<List<MeetingAttachmentsDto>> GetByMeetingIdAsync(int meetingId);

        Task<bool> UploadAsync(MeetingAttachmentsUploadDto dto);
        Task<bool> UpdateAsync(int attachmentId, MeetingAttachmentsDto dto);
        Task<bool> DeleteAsync(int attachmentId);
    }
}