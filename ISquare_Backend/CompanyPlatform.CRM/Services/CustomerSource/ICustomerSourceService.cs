using CompanyPlatform.CRM.DTO.CustomerSource;

namespace CompanyPlatform.CRM.Services.CustomerSource
{
    public interface ICustomerSourceService
    {
        Task<IEnumerable<CustomerSourceDto>> GetAllCustomerSourcesAsync();

        Task<CustomerSourceDto> GetCustomerSourceByIdAsync(int id);

        Task<CustomerSourceDto> CreateCustomerSourceAsync(CustomerSourceDto customerSourceDto);

        Task<bool> UpdateCustomerSourceAsync(int id, CustomerSourceDto customerSourceDto);

        Task<bool> DeleteCustomerSourceAsync(int id);
    }
}