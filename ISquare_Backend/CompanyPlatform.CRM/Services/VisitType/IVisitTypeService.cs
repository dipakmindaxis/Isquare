using CompanyPlatform.CRM.DTO.Meeting;

namespace CompanyPlatform.CRM.VisitType
{
    public interface IVisitTypeService
    {
        Task<IEnumerable<VisitTypeDto>> GetAllVisitTypesAsync();

        Task<VisitTypeDto> GetVisitTypeByIdAsync(int id);

        Task<VisitTypeDto> CreateVisitTypeAsync(VisitTypeDto dto);

        Task<bool> UpdateVisitTypeAsync(int id, VisitTypeDto dto);

        Task<bool> DeleteVisitTypeAsync(int id);
    }
}