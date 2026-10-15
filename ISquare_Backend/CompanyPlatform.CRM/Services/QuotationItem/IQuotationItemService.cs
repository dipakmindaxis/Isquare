using CompanyPlatform.CRM.DTO.Quotation;

namespace CompanyPlatform.CRM.Services.Quotation
{
    public interface IQuotationItemService
    {
        Task<IEnumerable<QuotationItemDto>> GetAllAsync();

        Task<IEnumerable<QuotationItemDto>> GetByQuotationIdAsync(
            int quotationId);

        Task<QuotationItemDto?> GetByIdAsync(int id);

        Task<QuotationItemDto> CreateAsync(QuotationItemDto dto);

        Task<bool> UpdateAsync(int id, QuotationItemDto dto);

        Task<bool> DeleteAsync(int id);
    }
}