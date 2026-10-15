using CompanyPlatform.CRM.DTO.CustomerType;

namespace CompanyPlatform.CRM.Services.CustomerType
{
    public interface ICustomerTypeService
    {
        Task<IEnumerable<CustomerTypeDto>> GetAllCustomerTypesAsync();

        Task<CustomerTypeDto> GetCustomerTypeByIdAsync(int id);

        Task<CustomerTypeDto> CreateCustomerTypeAsync(CustomerTypeDto dto);

        Task<bool> UpdateCustomerTypeAsync(
            int id,
            CustomerTypeDto dto);

        Task<bool> DeleteCustomerTypeAsync(int id);
    }
}