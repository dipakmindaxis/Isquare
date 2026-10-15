using System.Collections.Generic;
using System.Threading.Tasks;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.CRM.DTO.Customer;

namespace CompanyPlatform.CRM.Services.Customer
{
    public interface ICustomerService
    {
        Task<IEnumerable<CustomerDto>> GetAllCustomersAsync();
        Task<CustomerDto?> GetCustomerByIdAsync(int id);
        Task<CustomerDto> CreateCustomerAsync(CustomerCreateDto customerDto);
        Task<bool> UpdateCustomerAsync(int id, CustomerUpdateDto customerDto);
        Task<bool> DeleteCustomerAsync(int id);
        Task<IEnumerable<CompanyAddressDto>> GetCustomerAddressesAsync(int customerId);
        Task<bool> ValidateAddressOwnershipAsync(int customerId, int addressId);
    }
}
