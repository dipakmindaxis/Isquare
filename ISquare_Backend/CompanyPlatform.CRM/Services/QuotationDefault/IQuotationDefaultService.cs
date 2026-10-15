using CompanyPlatform.CRM.DTO.Quotation;

namespace CompanyPlatform.CRM.Services.Quotation
{
    public interface IQuotationDefaultService
    {
        Task<IEnumerable<QuotationDefaultDto>> GetAllAsync();

        Task<QuotationDefaultDto?> GetByIdAsync(int id);

        Task<QuotationDefaultDto> CreateAsync(
            QuotationDefaultDto dto);

        Task<bool> UpdateAsync(
            int id, QuotationDefaultDto dto);

        Task<bool> DeleteAsync(int id);
    }
}