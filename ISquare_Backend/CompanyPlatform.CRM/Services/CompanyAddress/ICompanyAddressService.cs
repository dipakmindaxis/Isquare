using CompanyPlatform.CRM.DTO;

namespace CompanyPlatform.CRM.Services.CompanyAddress
{
    public interface ICompanyAddressService
    {
        Task<IEnumerable<CompanyAddressDto>> GetAllCompanyAddressesAsync();

        Task<CompanyAddressDto> GetCompanyAddressByIdAsync(int id);

        Task<CompanyAddressDto> CreateCompanyAddressAsync(CompanyAddressDto dto);

        Task<bool> UpdateCompanyAddressAsync(int id, CompanyAddressDto dto);

        Task<bool> DeleteCompanyAddressAsync(int id);
    }
}