using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.LocationMasters;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Models.CRM.Company;
using CompanyPlatform.Core.Repository;


namespace CompanyPlatform.CRM.Services.LocationMasters
{
    public class CityService : ICityService
    {
        private readonly IRepositories<City> _repository;
        private readonly ILogger<CityService> _logger;

        public CityService(IRepositories<City> repository,ILogger<CityService> logger)
        {
            _repository = repository;
            _logger = logger;
        }
        public async Task<IEnumerable<CityDto>> GetAllCitiesAsync()
        {
            _logger.LogInformation("Fetching all active cities.");

            var items = await _repository.GetAll();

            return items
                .Where(c => c.IsActive)
                .Select(c => new CityDto
                {
                    CityId = c.CityId,
                    StateId = c.StateId,
                    CityName = c.CityName,
                    IsActive = c.IsActive,
                    CreatedBy = c.CreatedBy,
                    CreatedDate = c.CreatedDate,
                    UpdatedBy = c.UpdatedBy,
                    UpdatedDate = c.UpdatedDate
                });
        }

        public async Task<CityDto> GetCityByIdAsync(int id)
        {
            _logger.LogInformation("Fetching City by ID: {CityId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || !item.IsActive)
            {
                _logger.LogWarning("City with ID: {CityId} not found or is inactive.", id);
                throw new KeyNotFoundException($"City with ID {id} not found.");
            }

            return new CityDto
            {
                CityId = item.CityId,
                StateId = item.StateId,
                CityName = item.CityName,
                IsActive = item.IsActive,
                CreatedBy = item.CreatedBy,
                CreatedDate = item.CreatedDate,
                UpdatedBy = item.UpdatedBy,
                UpdatedDate = item.UpdatedDate
            };
        }

        public async Task<CityDto> CreateCityAsync(CityDto dto)
        {
            _logger.LogInformation("Creating a new City with name: {CityName}", dto.CityName);

            var entity = new City
            {
                StateId = dto.StateId,
                CityName = dto.CityName,
                IsActive = true,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now
            };

            await _repository.Create(entity);

            dto.CityId = entity.CityId;
            dto.IsActive = entity.IsActive;
            dto.CreatedDate = entity.CreatedDate;

            _logger.LogInformation("Successfully created City with ID: {CityId}", entity.CityId);

            return dto;
        }

        public async Task<bool> UpdateCityAsync(int id, CityDto dto)
        {
            _logger.LogInformation("Attempting to update City with ID: {CityId}", id);

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null || !entity.IsActive)
            {
                _logger.LogWarning("Update failed. City with ID: {CityId} not found or is inactive.", id);
                throw new KeyNotFoundException($"City with ID {id} not found.");
            }

            entity.StateId = dto.StateId;
            entity.CityName = dto.CityName;
            entity.UpdatedBy = dto.UpdatedBy;
            entity.UpdatedDate = DateTime.Now;

            await _repository.Update(entity);

            _logger.LogInformation("Successfully updated City with ID: {CityId}", id);

            return true;
        }

        public async Task<bool> DeleteCityAsync(int id)
        {
            _logger.LogInformation("Attempting to deactivate City with ID: {CityId}", id);

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null)
            {
                _logger.LogWarning("Deactivation failed. City with ID: {CityId} not found.");
                throw new KeyNotFoundException($"City with ID {id} not found.");
            }

            entity.IsActive = false;
            entity.UpdatedBy = "System";
            entity.UpdatedDate = DateTime.Now;

            await _repository.Update(entity);

            _logger.LogInformation("Successfully deactivated City with ID: {CityId}", id);

            return true;
        }

        public async Task<IEnumerable<CityDto>> GetCitiesByStateAsync(int stateId)
        {
            _logger.LogInformation("Fetching cities for State ID: {StateId}", stateId);

            var items = await _repository.FindAsync(c => c.StateId == stateId && c.IsActive);

            return items.Select(c => new CityDto
            {
                CityId = c.CityId,
                StateId = c.StateId,
                CityName = c.CityName,
                IsActive = c.IsActive,
                CreatedBy = c.CreatedBy,
                CreatedDate = c.CreatedDate,
                UpdatedBy = c.UpdatedBy,
                UpdatedDate = c.UpdatedDate
            });
        }
    }
}