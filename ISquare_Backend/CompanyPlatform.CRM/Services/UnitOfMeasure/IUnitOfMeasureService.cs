using CompanyPlatform.CRM.DTO;

namespace CompanyPlatform.Core.Models.CRM
{
    public interface IUnitOfMeasureService
    {
        Task<IEnumerable<UnitOfMeasureResponseDto>> GetAllAsync();

        // Active and non-deleted records for dropdowns (new enquiries)
        Task<IEnumerable<UnitOfMeasureResponseDto>> GetActiveForDropdownAsync();

        Task<UnitOfMeasureResponseDto?> GetByIdAsync(int id);
        Task<UnitOfMeasureResponseDto> CreateAsync(UnitOfMeasureCreateDto dto);
        Task<UnitOfMeasureResponseDto?> UpdateAsync(int id, UnitOfMeasureUpdateDto dto);

        // Soft delete
        Task<bool> DeleteAsync(int id, int? deletedBy = null);
    }
}