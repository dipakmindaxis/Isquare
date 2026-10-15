using CompanyPlatform.CRM.DTO.CompanyStatus;

namespace CompanyPlatform.CRM.Services.CompanyStatus
{
    public interface ICompanyStatusService
    {
        Task<IEnumerable<CompanyStatusDto>> GetAllCompanyStatusesAsync();
        Task<CompanyStatusDto?> GetCompanyStatusByIdAsync(int id);
        Task<CompanyStatusDto> CreateCompanyStatusAsync(CompanyStatusDto companyStatusDto);
        Task<bool> UpdateCompanyStatusAsync(int id, CompanyStatusDto companyStatusDto);
        Task<bool> DeleteCompanyStatusAsync(int id);
    }
}