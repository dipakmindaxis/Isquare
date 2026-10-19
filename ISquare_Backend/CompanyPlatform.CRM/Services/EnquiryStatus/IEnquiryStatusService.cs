using CompanyPlatform.CRM.DTO;

namespace CompanyPlatform.Core.Models.CRM
{
    public interface IEnquiryStatusService
    {
        Task<IEnumerable<EnquiryStatusResponseDto>> GetAllAsync();

        // Active and non-deleted records for dropdowns (new/existing enquiries)
        Task<IEnumerable<EnquiryStatusResponseDto>> GetActiveForDropdownAsync();

        Task<EnquiryStatusResponseDto?> GetByIdAsync(int id);
        Task<EnquiryStatusResponseDto> CreateAsync(EnquiryStatusCreateDto dto);
        Task<EnquiryStatusResponseDto?> UpdateAsync(int id, EnquiryStatusUpdateDto dto);

        // Soft Delete
        Task<bool> DeleteAsync(int id, int? deletedBy = null);
    }
}