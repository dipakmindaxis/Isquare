using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.LocationMasters;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Models.CRM.Company;
using CompanyPlatform.Core.Repository;


namespace CompanyPlatform.CRM.Services.LocationMasters
{
    public class StateService : IStateService
    {
        private readonly IRepositories<State> _repository;
        private readonly ILogger<StateService> _logger;

        public StateService(
            IRepositories<State> repository,
            ILogger<StateService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<StateDto>> GetAllStatesAsync()
        {
            _logger.LogInformation("Fetching all active states.");

            var items = await _repository.GetAll();

            return items
                .Where(s => s.IsActive)
                .Select(s => new StateDto
                {
                    StateId = s.StateId,
                    CountryId = s.CountryId,
                    StateName = s.StateName,
                    StateCode = s.StateCode,
                    IsActive = s.IsActive,
                    CreatedBy = s.CreatedBy,
                    CreatedDate = s.CreatedDate,
                    UpdatedBy = s.UpdatedBy,
                    UpdatedDate = s.UpdatedDate
                });
        }

        public async Task<StateDto> GetStateByIdAsync(int id)
        {
            _logger.LogInformation("Fetching State by ID: {StateId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsActive == false)
            {
                _logger.LogWarning("State with ID: {StateId} not found or is inactive.", id);
                return null;
            }

            return new StateDto
            {
                StateId = item.StateId,
                CountryId = item.CountryId,
                StateName = item.StateName,
                StateCode = item.StateCode,
                IsActive = item.IsActive,
                CreatedBy = item.CreatedBy,
                CreatedDate = item.CreatedDate,
                UpdatedBy = item.UpdatedBy,
                UpdatedDate = item.UpdatedDate
            };
        }

        public async Task<StateDto> CreateStateAsync(StateDto dto)
        {
            _logger.LogInformation("Creating a new State with name: {StateName}", dto.StateName);

            var entity = new State
            {
                CountryId = dto.CountryId,
                StateName = dto.StateName,
                StateCode = dto.StateCode,
                IsActive = true,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now
            };

            await _repository.Create(entity);

            dto.StateId = entity.StateId;
            dto.CreatedDate = entity.CreatedDate;
            dto.IsActive = entity.IsActive;

            _logger.LogInformation("Successfully created State with ID: {StateId}", entity.StateId);

            return dto;
        }

        public async Task<bool> UpdateStateAsync(int id, StateDto dto)
        {
            _logger.LogInformation("Attempting to update State with ID: {StateId}", id);

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null || entity.IsActive == false)
            {
                _logger.LogWarning("Update failed. State with ID: {StateId} not found or is inactive.", id);
                return false;
            }

            entity.CountryId = dto.CountryId;
            entity.StateName = dto.StateName;
            entity.StateCode = dto.StateCode;
            entity.UpdatedBy = dto.UpdatedBy;
            entity.UpdatedDate = DateTime.Now;

            await _repository.Update(entity);

            _logger.LogInformation("Successfully updated State with ID: {StateId}", id);

            return true;
        }

        public async Task<bool> DeleteStateAsync(int id)
        {
            _logger.LogInformation("Attempting to deactivate State with ID: {StateId}", id);

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null)
            {
                _logger.LogWarning("Deactivation failed. State with ID: {StateId} not found.", id);
                return false;
            }

            entity.IsActive = false;
            entity.UpdatedDate = DateTime.Now;

            await _repository.Update(entity);

            _logger.LogInformation("Successfully deactivated State with ID: {StateId}", id);

            return true;
        }

        public async Task<IEnumerable<StateDto>> GetStatesByCountryAsync(int countryId)
        {
            _logger.LogInformation("Fetching states for Country ID: {CountryId}", countryId);

            var items = await _repository.FindAsync(s => s.CountryId == countryId && s.IsActive);

            return items.Select(s => new StateDto
            {
                StateId = s.StateId,
                CountryId = s.CountryId,
                StateName = s.StateName,
                StateCode = s.StateCode,
                IsActive = s.IsActive,
                CreatedBy = s.CreatedBy,
                CreatedDate = s.CreatedDate,
                UpdatedBy = s.UpdatedBy,
                UpdatedDate = s.UpdatedDate
            });
        }
    }
}