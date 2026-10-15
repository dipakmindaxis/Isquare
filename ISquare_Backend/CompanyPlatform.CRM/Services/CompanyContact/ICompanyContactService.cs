using CompanyPlatform.CRM.DTO;

namespace CompanyPlatform.CRM.Services.CompanyContact
{
    public interface ICompanyContactService
    {
        Task<IEnumerable<CompanyContactDto>> GetAllCompanyContactsAsync();

        Task<CompanyContactDto> GetCompanyContactByIdAsync(int id);

        Task<CompanyContactDto> CreateCompanyContactAsync(CompanyContactDto dto);

        Task<bool> UpdateCompanyContactAsync(int id, CompanyContactDto dto);

        Task<bool> DeleteCompanyContactAsync(int id);
    }
}