using CompanyPlatform.CRM.DTO.LocationMasters;

namespace CompanyPlatform.CRM.Services.LocationMasters
{
    public interface ICountryService
    {
        Task<IEnumerable<CountryDto>> GetAllCountriesAsync();

        Task<CountryDto> GetCountryByIdAsync(int id);

        Task<CountryDto> CreateCountryAsync(CountryDto dto);

        Task<bool> UpdateCountryAsync(int id, CountryDto dto);

        Task<bool> DeleteCountryAsync(int id);
    }
}