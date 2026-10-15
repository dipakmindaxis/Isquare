using CompanyPlatform.CRM.DTO;

namespace CompanyPlatform.CRM.Services.CompanyPhone
{
    public interface ICompanyPhoneService
    {
        Task<IEnumerable<CompanyPhoneDto>> GetAllCompanyPhonesAsync();

        Task<CompanyPhoneDto> GetCompanyPhoneByIdAsync(int id);

        Task<CompanyPhoneDto> CreateCompanyPhoneAsync(CompanyPhoneDto dto);

        Task<bool> UpdateCompanyPhoneAsync(int id, CompanyPhoneDto dto);

        Task<bool> DeleteCompanyPhoneAsync(int id);
    }
}