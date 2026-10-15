using CompanyPlatform.CRM.DTO.Quotation;

namespace CompanyPlatform.CRM.Services.Quotation
{
    public interface ISalesOrderItemService
    {
        Task<IEnumerable<SalesOrderItemDto>> GetAllAsync();

        Task<SalesOrderItemDto?> GetByIdAsync(int id);

        Task<IEnumerable<SalesOrderItemDto>>
            GetBySalesOrderIdAsync(int salesOrderId);

        Task<SalesOrderItemDto> CreateAsync(
            CreateSalesOrderItemDto dto);

        Task<SalesOrderItemDto?> UpdateAsync(
            int id,
            CreateSalesOrderItemDto dto);

        Task<bool> DeleteAsync(int id);
    }
}