using CompanyPlatform.CRM.DTO;

namespace CompanyPlatform.CRM.Services.CompanyVisit
{
    public interface ICompanyVisitService
    {
        Task<IEnumerable<CompanyVisitDto>> GetAllCompanyVisitsAsync();

        Task<CompanyVisitDto> GetCompanyVisitByIdAsync(int id);

        Task<CompanyVisitDto> CreateCompanyVisitAsync(CompanyVisitDto dto);

        Task<bool> UpdateCompanyVisitAsync(int id, CompanyVisitDto dto);

        Task<bool> DeleteCompanyVisitAsync(int id);
    }
}