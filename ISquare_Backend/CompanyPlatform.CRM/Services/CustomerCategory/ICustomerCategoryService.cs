using CompanyPlatform.CRM.DTO.CompanyCategory;

namespace CompanyPlatform.CRM.Services.CustomerCategory
{
    public interface ICustomerCategoryService
    {
        Task<IEnumerable<CustomerCategoryDto>>
            GetAllCustomerCategoriesAsync();

        Task<CustomerCategoryDto?>
            GetCustomerCategoryByIdAsync(int id);

        Task<CustomerCategoryDto>
            CreateCustomerCategoryAsync(
                CustomerCategoryDto dto);

        Task<bool>
            UpdateCustomerCategoryAsync(
                int id,
                CustomerCategoryDto dto);

        Task<bool>
            DeleteCustomerCategoryAsync(int id);
    }
}