using CompanyPlatform.CRM.DTO;

namespace CompanyPlatform.Core.Models.CRM
{
    public interface IEnquiryStageService
    {
        Task<IEnumerable<EnquiryStageResponseDto>> GetAllAsync();

        // Active and non-deleted records for dropdowns (new enquiries)
        Task<IEnumerable<EnquiryStageResponseDto>> GetActiveForDropdownAsync();

        Task<EnquiryStageResponseDto?> GetByIdAsync(int id);
        Task<EnquiryStageResponseDto> CreateAsync(EnquiryStageCreateDto dto);
        Task<EnquiryStageResponseDto?> UpdateAsync(int id, EnquiryStageUpdateDto dto);

        // Soft Delete
        Task<bool> DeleteAsync(int id, int? deletedBy = null);
    }
}