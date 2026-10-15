using System.Collections.Generic;
using System.Threading.Tasks;
using CompanyPlatform.CRM.DTO.ProformaInvoice;

namespace CompanyPlatform.CRM.Services.ProformaInvoice
{
    public interface IProformaInvoiceService
    {
        Task<IEnumerable<ProformaInvoiceDto>> GetAllProformaInvoicesAsync();
        Task<string> GetNextProformaNumberAsync();
        Task<ProformaInvoiceDto?> GetProformaInvoiceByIdAsync(int id);
        Task<ProformaInvoiceDto> CreateProformaInvoiceAsync(CreateProformaInvoiceDto createDto);
        Task<bool> UpdateProformaInvoiceAsync(int id, UpdateProformaInvoiceDto updateDto);
        Task<ProformaInvoiceDto?> UpdatePublicResponseAsync(string proformaNo, string status);
        Task<bool> DeleteProformaInvoiceAsync(int id);
    }
}
