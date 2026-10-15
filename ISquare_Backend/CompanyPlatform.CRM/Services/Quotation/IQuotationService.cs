using CompanyPlatform.CRM.DTO.Quotation;

namespace CompanyPlatform.CRM.Services.Quotation
{
    public interface IQuotationService
    {
        Task<IEnumerable<QuotationDto>> GetAllQuotationsAsync();

        Task<QuotationDto?> GetQuotationByIdAsync(int id);

        Task<QuotationDto> CreateQuotationAsync(QuotationDto dto);

        Task<bool> UpdateQuotationAsync(int id, QuotationDto dto);

        Task<QuotationDto?> UpdateStatusAsync(int id, string status);

        Task<bool> DeleteQuotationAsync(int id);
    }
}