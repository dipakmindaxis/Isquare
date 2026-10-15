using CompanyPlatform.CRM.DTO.LocationMasters;

namespace CompanyPlatform.CRM.Services.LocationMasters
{
    public interface IStateService
    {
        Task<IEnumerable<StateDto>> GetAllStatesAsync();

        Task<StateDto> GetStateByIdAsync(int id);

        Task<StateDto> CreateStateAsync(StateDto dto);

        Task<bool> UpdateStateAsync(int id, StateDto dto);

        Task<bool> DeleteStateAsync(int id);

        Task<IEnumerable<StateDto>> GetStatesByCountryAsync(int countryId);
    }
}