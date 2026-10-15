using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.LocationMasters;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Models.CRM.Company;
using CompanyPlatform.Core.Repository;


namespace CompanyPlatform.CRM.Services.LocationMasters
{
    public class CountryService : ICountryService
    {
        private readonly IRepositories<Country> _repository;
        private readonly ILogger<CountryService> _logger;

        public CountryService(
            IRepositories<Country> repository,
            ILogger<CountryService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<CountryDto>> GetAllCountriesAsync()
        {
            _logger.LogInformation("Fetching all active countries.");

            var items = await _repository.GetAll();

            return items
                .Where(c => c.IsActive)
                .Select(c => new CountryDto
                {
                    CountryId = c.CountryId,
                    CountryName = c.CountryName,
                    CountryCode = c.CountryCode,
                    ISOCode = c.ISOCode,
                    IsActive = c.IsActive,
                    CreatedBy = c.CreatedBy,
                    CreatedDate = c.CreatedDate,
                    UpdatedBy = c.UpdatedBy,
                    UpdatedDate = c.UpdatedDate
                });
        }

        public async Task<CountryDto> GetCountryByIdAsync(int id)
        {
            _logger.LogInformation("Fetching Country by ID: {CountryId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsActive == false)
            {
                _logger.LogWarning("Country with ID: {CountryId} not found or is inactive.", id);
            }

            return new CountryDto
            {
                CountryId = item.CountryId,
                CountryName = item.CountryName,
                CountryCode = item.CountryCode,
                ISOCode = item.ISOCode,
                IsActive = item.IsActive,
                CreatedBy = item.CreatedBy,
                CreatedDate = item.CreatedDate,
                UpdatedBy = item.UpdatedBy,
                UpdatedDate = item.UpdatedDate
            };
        }

        public async Task<CountryDto> CreateCountryAsync(CountryDto dto)
        {
            _logger.LogInformation("Creating a new Country with name: {CountryName}", dto.CountryName);

            var entity = new Country
            {
                CountryName = dto.CountryName,
                CountryCode = dto.CountryCode,
                ISOCode = dto.ISOCode,
                IsActive = true,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now
            };

            await _repository.Create(entity);

            dto.CountryId = entity.CountryId;
            dto.CreatedDate = entity.CreatedDate;
            dto.IsActive = entity.IsActive;

            _logger.LogInformation("Successfully created Country with ID: {CountryId}", entity.CountryId);

            return dto;
        }

        public async Task<bool> UpdateCountryAsync(int id, CountryDto dto)
        {
            _logger.LogInformation("Attempting to update Country with ID: {CountryId}", id);

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null || entity.IsActive == false)
            {
                _logger.LogWarning("Update failed. Country with ID: {CountryId} not found or is inactive.", id);
                return false;
            }

            entity.CountryName = dto.CountryName;
            entity.CountryCode = dto.CountryCode;
            entity.ISOCode = dto.ISOCode;
            entity.UpdatedBy = dto.UpdatedBy;
            entity.UpdatedDate = DateTime.Now;

            await _repository.Update(entity);

            _logger.LogInformation("Successfully updated Country with ID: {CountryId}", id);

            return true;
        }

        public async Task<bool> DeleteCountryAsync(int id)
        {
            _logger.LogInformation("Attempting to deactivate Country with ID: {CountryId}", id);

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null)
            {
                _logger.LogWarning("Deactivation failed. Country with ID: {CountryId} not found.", id);
                return false;
            }

            entity.IsActive = false;
            entity.UpdatedDate = DateTime.Now;

            await _repository.Update(entity);

            _logger.LogInformation("Successfully deactivated Country with ID: {CountryId}", id);

            return true;
        }
    }
}