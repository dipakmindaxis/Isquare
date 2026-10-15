using CompanyPlatform.CRM.DTO.CustomerArea;

namespace CompanyPlatform.CRM.Services.CustomerArea
{
    public interface ICustomerAreaService
    {
        Task<IEnumerable<CustomerAreaDto>> GetAllCustomerAreasAsync();

        Task<CustomerAreaDto> GetCustomerAreaByIdAsync(int id);

        Task<CustomerAreaDto> CreateCustomerAreaAsync(CustomerAreaDto customerAreaDto);

        Task<bool> UpdateCustomerAreaAsync(int id, CustomerAreaDto customerAreaDto);

        Task<bool> DeleteCustomerAreaAsync(int id);
    }
}