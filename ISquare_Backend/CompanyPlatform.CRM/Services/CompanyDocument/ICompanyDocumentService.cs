using CompanyPlatform.CRM.DTO.CompanyDocument;

namespace CompanyPlatform.CRM.Services.CompanyDocument
{
    public interface ICompanyDocumentService
    {
        Task<IEnumerable<CompanyDocumentDto>> GetAllCompanyDocumentsAsync();

        Task<CompanyDocumentDto?> GetCompanyDocumentByIdAsync(int id);

        Task<CompanyDocumentDto> CreateCompanyDocumentAsync(CompanyDocumentDto companyDocumentDto);

        Task<bool> UpdateCompanyDocumentAsync(int id, CompanyDocumentDto companyDocumentDto);

        Task<bool> DeleteCompanyDocumentAsync(int id);
    }
}