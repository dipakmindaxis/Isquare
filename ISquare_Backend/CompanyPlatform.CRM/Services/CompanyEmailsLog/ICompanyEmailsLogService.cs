using CompanyPlatform.CRM.DTO.CompanyEmailsLog;

namespace CompanyPlatform.CRM.Services.CompanyEmailsLog
{
    public interface ICompanyEmailsLogService
    {
        Task<IEnumerable<CompanyEmailsLogDto>> GetAllCompanyEmailsLogsAsync();
        Task<CompanyEmailsLogDto> GetCompanyEmailsLogByIdAsync(int id);
        Task<CompanyEmailsLogDto> CreateCompanyEmailsLogAsync(CompanyEmailsLogDto dto);
        Task<bool> UpdateCompanyEmailsLogAsync(int id, CompanyEmailsLogDto dto);
        Task<bool> DeleteCompanyEmailsLogAsync(int id);
    }
}
