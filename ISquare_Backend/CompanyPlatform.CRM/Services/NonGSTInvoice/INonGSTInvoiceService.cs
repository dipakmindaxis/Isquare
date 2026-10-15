using System.Collections.Generic;
using System.Threading.Tasks;
using CompanyPlatform.CRM.DTO.NonGSTInvoice;

namespace CompanyPlatform.CRM.Services.NonGSTInvoice
{
    public interface INonGSTInvoiceService
    {
        Task<IEnumerable<NonGSTInvoiceDto>> GetAllNonGSTInvoicesAsync();
        Task<NonGSTInvoiceDto?> GetNonGSTInvoiceByIdAsync(int id);
        Task<NonGSTInvoiceDto> CreateNonGSTInvoiceAsync(CreateNonGSTInvoiceDto dto);
        Task<bool> UpdateNonGSTInvoiceAsync(int id, UpdateNonGSTInvoiceDto dto);
        Task<bool> DeleteNonGSTInvoiceAsync(int id);
    }
}
