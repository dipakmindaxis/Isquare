using CompanyPlatform.CRM.DTO.Invoice;

namespace CompanyPlatform.CRM.Services.InvoicePayment
{
    public interface IInvoicePaymentService
    {
        Task<IEnumerable<InvoicePaymentDto>> GetAllInvoicePaymentsAsync();

        Task<InvoicePaymentDto?> GetInvoicePaymentByIdAsync(int id);

        Task<InvoicePaymentDto> CreateInvoicePaymentAsync(InvoicePaymentDto dto);

        Task<bool> UpdateInvoicePaymentAsync(int id, InvoicePaymentDto dto);

        Task<bool> DeleteInvoicePaymentAsync(int id);
    }
}