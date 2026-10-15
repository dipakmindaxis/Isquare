using System.Collections.Generic;
using System.Threading.Tasks;
using CompanyPlatform.CRM.DTO.ProformaInvoice;

namespace CompanyPlatform.CRM.Services.ProformaInvoice
{
    public interface IProformaInvoiceItemService
    {
        Task<IEnumerable<ProformaInvoiceItemDto>> GetAllProformaInvoiceItemsAsync();
        Task<ProformaInvoiceItemDto?> GetProformaInvoiceItemByIdAsync(int id);
        Task<IEnumerable<ProformaInvoiceItemDto>> GetItemsByProformaIdAsync(int proformaId);
        Task<ProformaInvoiceItemDto> CreateProformaInvoiceItemAsync(ProformaInvoiceItemDto dto);
        Task<bool> UpdateProformaInvoiceItemAsync(ProformaInvoiceItemDto dto);
        Task<bool> DeleteProformaInvoiceItemAsync(int id);
    }
}
