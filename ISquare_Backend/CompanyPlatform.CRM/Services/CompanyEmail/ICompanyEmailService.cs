using CompanyPlatform.CRM.DTO;
using CompanyPlatform.CRM.DTO.CompanyEmail;

namespace CompanyPlatform.CRM.Services.CompanyEmail
{
    public interface ICompanyEmailService
    {
        Task<IEnumerable<CompanyEmailDto>> GetAllCompanyEmailsAsync();

        Task<CompanyEmailDto> GetCompanyEmailByIdAsync(int id);

        Task<CompanyEmailDto> CreateCompanyEmailAsync(CompanyEmailDto dto);

        Task<bool> UpdateCompanyEmailAsync(int id, CompanyEmailDto dto);

        Task<bool> DeleteCompanyEmailAsync(int id);
    }
}