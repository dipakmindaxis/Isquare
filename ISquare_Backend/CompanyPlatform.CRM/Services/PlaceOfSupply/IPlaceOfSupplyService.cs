using CompanyPlatform.CRM.DTO;

namespace CompanyPlatform.Core.Models.CRM
{
    public interface IPlaceOfSupplyService
    {
        Task<IEnumerable<PlaceOfSupplyResponseDto>> GetAllAsync();

        // Active and non-deleted records for dropdowns (new enquiries)
        Task<IEnumerable<PlaceOfSupplyResponseDto>> GetActiveForDropdownAsync();

        Task<PlaceOfSupplyResponseDto?> GetByIdAsync(int id);
        Task<PlaceOfSupplyResponseDto> CreateAsync(PlaceOfSupplyCreateDto dto);
        Task<PlaceOfSupplyResponseDto?> UpdateAsync(int id, PlaceOfSupplyUpdateDto dto);

        // Soft delete
        Task<bool> DeleteAsync(int id, int? deletedBy = null);
    }
}