using CompanyPlatform.CRM.DTO.LocationMasters;

namespace CompanyPlatform.CRM.Services.LocationMasters
{
    public interface ICityService
    {
        Task<IEnumerable<CityDto>> GetAllCitiesAsync();

        Task<CityDto> GetCityByIdAsync(int id);

        Task<CityDto> CreateCityAsync(CityDto dto);

        Task<bool> UpdateCityAsync(int id, CityDto dto);

        Task<bool> DeleteCityAsync(int id);

        Task<IEnumerable<CityDto>> GetCitiesByStateAsync(int stateId);
    }
}