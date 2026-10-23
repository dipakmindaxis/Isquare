using System.Collections.Generic;
using System.Threading.Tasks;
using CompanyPlatform.CRM.DTO.LevelMaster;

namespace CompanyPlatform.CRM.Services.LevelMaster
{
    public interface ILevelMasterService
    {
        Task<IEnumerable<LevelMasterDto>> GetAllAsync();
        Task<LevelMasterDto?> GetByIdAsync(int id);
        Task<LevelMasterDto> CreateAsync(CreateLevelMasterDto dto);
        Task<bool> UpdateAsync(int id, UpdateLevelMasterDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
