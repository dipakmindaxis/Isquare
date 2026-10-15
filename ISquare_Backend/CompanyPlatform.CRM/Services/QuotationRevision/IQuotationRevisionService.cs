using CompanyPlatform.CRM.DTO.Quotation;

namespace CompanyPlatform.CRM.Services.Quotation
{
    public interface IQuotationRevisionService
    {
        Task<IEnumerable<QuotationRevisionDto>> GetAllAsync();

        Task<QuotationRevisionDto?> GetByIdAsync(int id);

        Task<IEnumerable<QuotationRevisionDto>>
            GetByQuotationIdAsync(int quotationId);

        Task<QuotationRevisionDto> CreateAsync(
            CreateQuotationRevisionDto dto,
            string? revisedBy);

        Task<bool> DeleteAsync(int id);
    }
}