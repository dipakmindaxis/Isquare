using System.Collections.Generic;
using System.Threading.Tasks;
using CompanyPlatform.CRM.DTO.SalesActivity;

namespace CompanyPlatform.CRM.Services.SalesActivity
{
    public interface ISalesActivityService
    {
        Task<IEnumerable<SalesActivityDto>> GetAllSalesActivitiesAsync();
        Task<SalesActivityDto?> GetSalesActivityByIdAsync(int id);
        Task<SalesActivityDto> CreateSalesActivityAsync(CreateSalesActivityDto dto);
        Task<SalesActivityDto?> UpdateSalesActivityAsync(int id, UpdateSalesActivityDto dto);
        Task<bool> DeleteSalesActivityAsync(int id);
    }
}
