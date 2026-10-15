using CompanyPlatform.CRM.DTO.CustomerStatus;

namespace CompanyPlatform.CRM.Services.CustomerStatus
{
    public interface ICustomerStatusService
    {
        Task<IEnumerable<CustomerStatusDto>> GetAllCustomerStatusesAsync();

        Task<CustomerStatusDto> GetCustomerStatusByIdAsync(int id);

        Task<CustomerStatusDto> CreateCustomerStatusAsync(
            CustomerStatusDto dto);

        Task<bool> UpdateCustomerStatusAsync(
            int id,
            CustomerStatusDto dto);

        Task<bool> DeleteCustomerStatusAsync(int id);
    }
}