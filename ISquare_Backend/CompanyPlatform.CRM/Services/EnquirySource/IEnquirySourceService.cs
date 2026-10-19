using CompanyPlatform.CRM.DTO; 

namespace CompanyPlatform.Core.Models.CRM
{
    public interface IEnquirySourceService
    {
        Task<IEnumerable<EnquirySourceResponseDto>> GetAllAsync();
        Task<IEnumerable<EnquirySourceResponseDto>> GetActiveForDropdownAsync();
        Task<EnquirySourceResponseDto?> GetByIdAsync(int id);
        Task<EnquirySourceResponseDto> CreateAsync(EnquirySourceCreateDto dto);
        Task<EnquirySourceResponseDto?> UpdateAsync(int id, EnquirySourceUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}