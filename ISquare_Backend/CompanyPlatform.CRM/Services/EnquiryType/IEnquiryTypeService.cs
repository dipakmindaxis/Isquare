using CompanyPlatform.CRM.DTO;

namespace CompanyPlatform.Core.Models.CRM
{
    public interface IEnquiryTypeService
    {
        Task<IEnumerable<EnquiryTypeResponseDto>> GetAllAsync();

        // Only returns active records for dropdowns (new enquiries)
        Task<IEnumerable<EnquiryTypeResponseDto>> GetActiveForDropdownAsync();

        Task<EnquiryTypeResponseDto?> GetByIdAsync(int id);
        Task<EnquiryTypeResponseDto> CreateAsync(EnquiryTypeCreateDto dto);
        Task<EnquiryTypeResponseDto?> UpdateAsync(int id, EnquiryTypeUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}