using CompanyPlatform.Core.DTO.Companies;

namespace CompanyPlatform.Core.Services.Companies
{
    public interface ICompaniessService
    {
        Task<IEnumerable<CompaniessDto>> GetAllCompaniesAsync();

        Task<CompaniessDto?> GetCompanyByIdAsync(int id);

        Task<CompaniessDto> CreateCompanyAsync(CompaniessDto dto);

        Task<bool> UpdateCompanyAsync(int id, CompaniessDto dto);

        Task<bool> DeleteCompanyAsync(int id);
    }
}