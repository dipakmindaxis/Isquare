using CompanyPlatform.CRM.DTO.SalesAttachment;

namespace CompanyPlatform.CRM.Services.SalesAttachment
{
    public interface ISalesAttachmentService
    {
        Task<IEnumerable<SalesAttachmentDto>>
            GetAllSalesAttachmentsAsync();

        Task<SalesAttachmentDto?>
            GetSalesAttachmentByIdAsync(int id);

        Task<SalesAttachmentDto>
            UploadSalesAttachmentAsync(
                SalesAttachmentUploadDto dto,
                int? uploadedBy);

        Task<(Stream Stream, string ContentType, string FileName)?>
            DownloadSalesAttachmentAsync(int id);

        Task<bool>
            DeleteSalesAttachmentAsync(int id);
    }
}