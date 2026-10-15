using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.Core.Repository;

namespace CompanyPlatform.CRM.Services.CompanyAddress
{
    public class CompanyAddressService : ICompanyAddressService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.CompanyAddress> _repository;
        private readonly ILogger<CompanyAddressService> _logger;

        public CompanyAddressService(
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.CompanyAddress> repository,
            ILogger<CompanyAddressService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<CompanyAddressDto>> GetAllCompanyAddressesAsync()
        {
            _logger.LogInformation("Fetching all company addresses.");

            var items = await _repository.FindByCondition(x => !x.IsDeleted);

            return items.Select(a => new CompanyAddressDto
            {
                AddressId = a.AddressId,
                CompanyId = a.CompanyId,
                AddressType = a.AddressType,
                Address = a.Address,
                CountryId = a.CountryId,
                StateId = a.StateId,
                CityId = a.CityId,
                Pincode = a.Pincode,
                IsPrimary = a.IsPrimary,
                IsActive = a.IsActive,
                CreatedBy = a.CreatedBy,
                CreatedDate = a.CreatedDate
            });
        }

        public async Task<CompanyAddressDto> GetCompanyAddressByIdAsync(int id)
        {
            _logger.LogInformation("Fetching company address by ID: {AddressId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning("Company address with ID: {AddressId} not found.", id);
                return null;
            }

            return new CompanyAddressDto
            {
                AddressId = item.AddressId,
                CompanyId = item.CompanyId,
                AddressType = item.AddressType,
                Address = item.Address,
                CountryId = item.CountryId,
                StateId = item.StateId,
                CityId = item.CityId,
                Pincode = item.Pincode,
                IsPrimary = item.IsPrimary,
                IsActive = item.IsActive,
                CreatedBy = item.CreatedBy,
                CreatedDate = item.CreatedDate
            };
        }

        public async Task<CompanyAddressDto> CreateCompanyAddressAsync(CompanyAddressDto dto)
        {
            _logger.LogInformation("Creating company address.");

            var entity = new CompanyPlatform.Core.Models.CRM.Company.CompanyAddress {
                CompanyId = dto.CompanyId,
                AddressType = dto.AddressType,
                Address = dto.Address,
                CountryId = dto.CountryId,
                StateId = dto.StateId,
                CityId = dto.CityId,
                Pincode = dto.Pincode,
                IsPrimary = dto.IsPrimary,
                IsActive = dto.IsActive,
                IsDeleted = false,
                CreatedBy = dto.CreatedBy,
                CreatedDate = dto.CreatedDate
            };

            await _repository.Create(entity);

            dto.AddressId = entity.AddressId;

            _logger.LogInformation("Successfully created company address with ID: {AddressId}", entity.AddressId);

            return dto;
        }

        public async Task<bool> UpdateCompanyAddressAsync(int id, CompanyAddressDto dto)
        {
            _logger.LogInformation("Updating company address with ID: {AddressId}", id);

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null || entity.IsDeleted)
            {
                _logger.LogWarning("Company address with ID: {AddressId} not found.", id);
                return false;
            }

            entity.CompanyId = dto.CompanyId;
            entity.AddressType = dto.AddressType;
            entity.Address = dto.Address;
            entity.CountryId = dto.CountryId;
            entity.StateId = dto.StateId;
            entity.CityId = dto.CityId;
            entity.Pincode = dto.Pincode;
            entity.IsPrimary = dto.IsPrimary;
            entity.IsActive = dto.IsActive;

            await _repository.Update(entity);

            _logger.LogInformation("Successfully updated company address with ID: {AddressId}", id);

            return true;
        }

        public async Task<bool> DeleteCompanyAddressAsync(int id)
        {
            _logger.LogInformation("Deleting company address with ID: {AddressId}", id);

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null || entity.IsDeleted)
            {
                _logger.LogWarning("Company address with ID: {AddressId} not found.", id);
                return false;
            }

            entity.IsDeleted = true;

            await _repository.SoftDelete(entity);

            _logger.LogInformation("Successfully deleted company address with ID: {AddressId}", id);

            return true;
        }
    }
}