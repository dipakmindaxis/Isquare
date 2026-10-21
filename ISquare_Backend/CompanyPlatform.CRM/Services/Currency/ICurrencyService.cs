using CompanyPlatform.CRM.DTO;

namespace CompanyPlatform.Core.Models.CRM
{
    public interface ICurrencyService
    {
        Task<IEnumerable<CurrencyResponseDto>> GetAllAsync();

        // Active and non-deleted records for dropdowns (new enquiries)
        Task<IEnumerable<CurrencyResponseDto>> GetActiveForDropdownAsync();

        Task<CurrencyResponseDto?> GetByIdAsync(int id);
        Task<CurrencyResponseDto> CreateAsync(CurrencyCreateDto dto);
        Task<CurrencyResponseDto?> UpdateAsync(int id, CurrencyUpdateDto dto);

        // Soft delete
        Task<bool> DeleteAsync(int id, int? deletedBy = null);
    }
}