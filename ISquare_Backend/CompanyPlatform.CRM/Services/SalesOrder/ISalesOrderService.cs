using CompanyPlatform.CRM.DTO.Quotation;

namespace CompanyPlatform.CRM.Services.SalesOrder
{
    public interface ISalesOrderService
    {
        Task<IEnumerable<SalesOrderDto>> GetAllAsync();

        Task<SalesOrderDto?> GetByIdAsync(int id);

        Task<SalesOrderDto?> GetByQuotationIdAsync(int quotationId);

        Task<SalesOrderDto> CreateAsync(
            CreateSalesOrderDto dto,
            string? createdBy);

        Task<SalesOrderDto?> UpdateAsync(
            int id,
            CreateSalesOrderDto dto,
            string? updatedBy);

        Task<bool> DeleteAsync(int id);
    }
}