using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CompanyPlatform.CRM.DTO.Quotation;

namespace CompanyPlatform.CRM.Services.Quotation
{
    public interface IQuotationCustomerResponseService
    {
        Task<QuotationCustomerResponseDto> SendQuotationEmailAsync(
            int quotationId,
            SendQuotationEmailDto? dto = null);

        Task<IEnumerable<QuotationCustomerResponseDto>> GetAllResponsesAsync();

        Task<IEnumerable<QuotationCustomerResponseDto>> GetResponsesByQuotationIdAsync(
            int quotationId);

        Task<PublicQuotationResponseDto?> GetPublicQuotationAsync(
            Guid publicResponseId);

        Task<QuotationCustomerResponseDto> SubmitCustomerDecisionAsync(
            Guid publicResponseId,
            QuotationCustomerDecisionDto dto);
    }
}
