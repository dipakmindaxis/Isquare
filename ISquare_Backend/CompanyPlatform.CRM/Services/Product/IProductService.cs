using CompanyPlatform.CRM.DTO.Product;

namespace CompanyPlatform.CRM.Services.Product
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetAllProductsAsync();

        Task<ProductDto?> GetProductByIdAsync(int id);

        Task<ProductDto> CreateProductAsync(ProductDto productDto);

        Task<bool> UpdateProductAsync(int id, ProductDto productDto);

        Task<bool> DeleteProductAsync(int id);
    }
}