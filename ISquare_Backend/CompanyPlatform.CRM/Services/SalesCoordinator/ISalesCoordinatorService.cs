using System.Collections.Generic;
using System.Threading.Tasks;
using CompanyPlatform.CRM.DTO.SalesCoordinator;

namespace CompanyPlatform.CRM.Services.SalesCoordinator
{
    public interface ISalesCoordinatorService
    {
        Task<IEnumerable<SalesCoordinatorDto>>
            GetAllSalesCoordinatorsAsync();

        Task<IEnumerable<SalesCoordinatorDto>>
            GetActiveSalesCoordinatorsAsync();

        Task<SalesCoordinatorDto?>
            GetSalesCoordinatorByIdAsync(int id);

        Task<SalesCoordinatorDto>
            CreateSalesCoordinatorAsync(SalesCoordinatorDto dto);

        Task<bool>
            UpdateSalesCoordinatorAsync(int id, SalesCoordinatorDto dto);

        Task<bool>
            DeleteSalesCoordinatorAsync(int id);

        // Get Sales Coordinators assigned to a specific BDE User
        Task<IEnumerable<SalesCoordinatorDto>>
            GetSalesCoordinatorsByBDEUserIdAsync(int bdeUserId);
    }
}