using CompanyPlatform.CRM.DTO.Invoice;

namespace CompanyPlatform.CRM.Services.InvoiceItem
{
    public interface IInvoiceItemService
    {
        Task<IEnumerable<InvoiceItemDto>> GetAllInvoiceItemsAsync();

        Task<InvoiceItemDto?> GetInvoiceItemByIdAsync(int id);

        Task<InvoiceItemDto> CreateInvoiceItemAsync(InvoiceItemDto dto);

        Task<bool> UpdateInvoiceItemAsync(InvoiceItemDto dto);

        Task<bool> DeleteInvoiceItemAsync(int id);
    }
}