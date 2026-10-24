using CompanyPlatform.CRM.DTO;

namespace CompanyPlatform.Core.Models.CRM
{
    public interface ISalesTerritoryService
    {
        Task<IEnumerable<SalesTerritoryResponseDto>> GetAllAsync();

        // Active and non-deleted records for dropdowns (new enquiries)
        Task<IEnumerable<SalesTerritoryResponseDto>> GetActiveForDropdownAsync();

        Task<SalesTerritoryResponseDto?> GetByIdAsync(int id);
        Task<SalesTerritoryResponseDto> CreateAsync(SalesTerritoryCreateDto dto);
        Task<SalesTerritoryResponseDto?> UpdateAsync(int id, SalesTerritoryUpdateDto dto);

        // Soft delete
        Task<bool> DeleteAsync(int id, int? deletedBy = null);
    }
}