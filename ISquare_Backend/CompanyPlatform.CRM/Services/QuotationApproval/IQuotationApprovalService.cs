using CompanyPlatform.CRM.DTO.Quotation;

namespace CompanyPlatform.CRM.Services.Quotation
{
    public interface IQuotationApprovalService
    {
        Task<IEnumerable<QuotationApprovalDto>> GetAllAsync();

        Task<QuotationApprovalDto?> GetByIdAsync(int id);

        Task<IEnumerable<QuotationApprovalDto>>
            GetByQuotationIdAsync(int quotationId);

        Task<QuotationApprovalDto> CreateAsync(
            CreateQuotationApprovalDto dto,
            string? requestedBy);

        Task<QuotationApprovalDto?> DecideAsync(
            int id,
            DecideQuotationApprovalDto dto,
            string? approvedBy);

        Task<bool> DeleteAsync(int id);
    }
}