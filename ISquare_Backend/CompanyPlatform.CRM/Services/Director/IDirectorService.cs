using System.Collections.Generic;
using System.Threading.Tasks;
using CompanyPlatform.CRM.DTO.Director;

namespace CompanyPlatform.CRM.Services.Director
{
    public interface IDirectorService
    {
        Task<IEnumerable<DirectorDto>> GetAllDirectorsAsync();

        Task<DirectorDto?> GetDirectorByIdAsync(int id);

        Task<DirectorDto> CreateDirectorAsync(DirectorDto dto);

        Task<bool> UpdateDirectorAsync(int id, DirectorDto dto);

        Task<bool> DeleteDirectorAsync(int id);
    }
}