using CompanyPlatform.CRM.DTO.Invoice;

namespace CompanyPlatform.CRM.Services.InvoiceType
{
    public interface IInvoiceTypeService
    {
        Task<IEnumerable<InvoiceTypeDto>> GetAllInvoiceTypesAsync();
        Task<InvoiceTypeDto?> GetInvoiceTypeByIdAsync(int id);
        Task<InvoiceTypeDto> CreateInvoiceTypeAsync(InvoiceTypeDto invoiceTypeDto);
        Task<bool> UpdateInvoiceTypeAsync(int id, InvoiceTypeDto invoiceTypeDto);
        Task<bool> DeleteInvoiceTypeAsync(int id);
    }
}