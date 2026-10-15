using CompanyPlatform.CRM.DTO.Meeting;

namespace CompanyPlatform.CRM.VisitAttachment
{
    public interface IVisitAttachmentService
    {
        Task<VisitAttachmentDto> CreateVisitAttachmentAsync(CreateVisitAttachmentDto dto);

        Task<IEnumerable<VisitAttachmentDto>> GetAllVisitAttachmentsAsync();

        Task<VisitAttachmentDto?> GetVisitAttachmentByIdAsync(int id);

        Task<bool> UpdateVisitAttachmentAsync(int id, VisitAttachmentDto dto);

        Task<bool> DeleteVisitAttachmentAsync(int id);
    }
}