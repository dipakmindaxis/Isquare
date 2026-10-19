using CompanyPlatform.CRM.DTO;

namespace CompanyPlatform.Core.Models.CRM
{
    public interface IProductServiceItemService
    {
        Task<IEnumerable<ProductServiceResponseDto>> GetAllAsync();

        // Active and non-deleted records for dropdowns (new enquiries)
        Task<IEnumerable<ProductServiceResponseDto>> GetActiveForDropdownAsync();

        Task<ProductServiceResponseDto?> GetByIdAsync(int id);
        Task<ProductServiceResponseDto> CreateAsync(ProductServiceCreateDto dto);
        Task<ProductServiceResponseDto?> UpdateAsync(int id, ProductServiceUpdateDto dto);

        // Soft Delete
        Task<bool> DeleteAsync(int id, int? deletedBy = null);
    }
}