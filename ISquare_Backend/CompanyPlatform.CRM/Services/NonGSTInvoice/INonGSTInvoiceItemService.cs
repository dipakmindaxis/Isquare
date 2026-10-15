using System.Collections.Generic;
using System.Threading.Tasks;
using CompanyPlatform.CRM.DTO.NonGSTInvoice;

namespace CompanyPlatform.CRM.Services.NonGSTInvoice
{
    public interface INonGSTInvoiceItemService
    {
        Task<IEnumerable<NonGSTInvoiceItemDto>> GetAllNonGSTInvoiceItemsAsync();
        Task<IEnumerable<NonGSTInvoiceItemDto>> GetItemsByInvoiceIdAsync(int nonGSTInvoiceId);
        Task<NonGSTInvoiceItemDto?> GetNonGSTInvoiceItemByIdAsync(int id);
        Task<NonGSTInvoiceItemDto> CreateNonGSTInvoiceItemAsync(NonGSTInvoiceItemDto dto);
        Task<bool> UpdateNonGSTInvoiceItemAsync(int id, NonGSTInvoiceItemDto dto);
        Task<bool> DeleteNonGSTInvoiceItemAsync(int id);
    }
}
