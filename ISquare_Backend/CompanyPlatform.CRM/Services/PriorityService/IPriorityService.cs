using CompanyPlatform.Core.DTO.Meeting;
using CompanyPlatform.Core.DTO.PriorityMaster;

namespace CompanyPlatform.Core.Services
{
    public interface IPriorityService
    {
        Task<IEnumerable<PriorityDto>> GetAllPrioritiesAsync();

        Task<PriorityDto> GetPriorityByIdAsync(int id);

        Task<PriorityDto> CreatePriorityAsync(PriorityDto dto);

        Task<bool> UpdatePriorityAsync(int id, PriorityDto dto);

        Task<bool> DeletePriorityAsync(int id);
    }
}