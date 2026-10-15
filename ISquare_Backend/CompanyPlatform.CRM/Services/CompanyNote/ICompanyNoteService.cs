using CompanyPlatform.CRM.DTO.CompanyNote;

namespace CompanyPlatform.CRM.Services.CompanyNote
{
    public interface ICompanyNoteService
    {
        Task<IEnumerable<CompanyNoteDto>> GetAllCompanyNotesAsync();

        Task<CompanyNoteDto> GetCompanyNoteByIdAsync(int id);

        Task<CompanyNoteDto> CreateCompanyNoteAsync(CompanyNoteDto companyNoteDto);

        Task<bool> UpdateCompanyNoteAsync(int id, CompanyNoteDto companyNoteDto);

        Task<bool> DeleteCompanyNoteAsync(int id);
    }
}