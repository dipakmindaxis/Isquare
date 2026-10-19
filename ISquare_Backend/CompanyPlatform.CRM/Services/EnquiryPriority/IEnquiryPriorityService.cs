using CompanyPlatform.CRM.DTO;

namespace CompanyPlatform.Core.Models.CRM
{
    public interface IEnquiryPriorityService
    {
        Task<IEnumerable<EnquiryPriorityResponseDto>> GetAllAsync();

        // Active and non-deleted records for dropdowns (new enquiries)
        Task<IEnumerable<EnquiryPriorityResponseDto>> GetActiveForDropdownAsync();

        Task<EnquiryPriorityResponseDto?> GetByIdAsync(int id);
        Task<EnquiryPriorityResponseDto> CreateAsync(EnquiryPriorityCreateDto dto);
        Task<EnquiryPriorityResponseDto?> UpdateAsync(int id, EnquiryPriorityUpdateDto dto);

        // Soft delete
        Task<bool> DeleteAsync(int id, int? deletedBy = null);
    }
}