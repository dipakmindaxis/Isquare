using CompanyPlatform.CRM.DTO.Invoice;

namespace CompanyPlatform.CRM.Services.InvoiceService
{
    public interface IInvoiceService
    {
        Task<IEnumerable<InvoiceDto>> GetAllInvoicesAsync();
        Task<InvoiceDto?> GetInvoiceByIdAsync(int id);
        Task<InvoiceDto> CreateInvoiceAsync(InvoiceDto dto);
        Task<bool> UpdateInvoiceAsync(InvoiceDto dto);
        Task<bool> DeleteInvoiceAsync(int id);
        Task<string> GetNextInvoiceNumberAsync(string docType = "Invoice");
    }
}