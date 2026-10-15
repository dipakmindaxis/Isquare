using CompanyPlatform.CRM.DTO.CompanyTimeline;

namespace CompanyPlatform.CRM.Services.CompanyTimeline
{
    public interface ICompanyTimelineService
    {
        Task<IEnumerable<CompanyTimelineDto>> GetAllCompanyTimelinesAsync();
        Task<CompanyTimelineDto> GetCompanyTimelineByIdAsync(int id);
        Task<CompanyTimelineDto> CreateCompanyTimelineAsync(CreateCompanyTimelineDto dto);
        Task<bool> UpdateCompanyTimelineAsync(int id, CompanyTimelineDto dto);
        Task<bool> DeleteCompanyTimelineAsync(int id);
    }
}
