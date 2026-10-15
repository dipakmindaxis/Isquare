using CompanyPlatform.CRM.DTO.Quotation;

namespace CompanyPlatform.CRM.Services.Quotation
{
    public interface IQuotationChargeService
    {
        Task<IEnumerable<QuotationChargeDto>> GetAllAsync();

        Task<QuotationChargeDto?> GetByIdAsync(int id);

        Task<IEnumerable<QuotationChargeDto>>
            GetByQuotationIdAsync(int quotationId);

        Task<QuotationChargeDto> CreateAsync(
            CreateQuotationChargeDto dto);

        Task<QuotationChargeDto?> UpdateAsync(
            int id,
            CreateQuotationChargeDto dto);

        Task<bool> DeleteAsync(int id);
    }
}