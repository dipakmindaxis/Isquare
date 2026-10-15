using CompanyPlatform.CRM.DTO.CallAttachment;

namespace CompanyPlatform.CRM.Services.CallAttachment
{
    public interface ICallAttachmentService
    {
        Task<CallAttachmentDto> CreateCallAttachmentAsync(CreateCallAttachmentDto dto);

        Task<IEnumerable<CallAttachmentDto>> GetAllCallAttachmentsAsync();

        Task<CallAttachmentDto?> GetCallAttachmentByIdAsync(int id);

        Task<bool> UpdateCallAttachmentAsync(int id, CallAttachmentDto dto);

        Task<bool> DeleteCallAttachmentAsync(int id);
    }
}