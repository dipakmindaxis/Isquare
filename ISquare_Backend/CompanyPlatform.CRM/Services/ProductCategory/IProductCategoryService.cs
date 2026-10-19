using CompanyPlatform.CRM.DTO;

namespace CompanyPlatform.Core.Models.CRM
{
    public interface IProductCategoryService
    {
        Task<IEnumerable<ProductCategoryResponseDto>> GetAllAsync();

        // Active and non-deleted records for dropdowns (new enquiries/products)
        Task<IEnumerable<ProductCategoryResponseDto>> GetActiveForDropdownAsync();

        Task<ProductCategoryResponseDto?> GetByIdAsync(int id);
        Task<ProductCategoryResponseDto> CreateAsync(ProductCategoryCreateDto dto);
        Task<ProductCategoryResponseDto?> UpdateAsync(int id, ProductCategoryUpdateDto dto);

        // Soft Delete
        Task<bool> DeleteAsync(int id, int? deletedBy = null);
    }
}