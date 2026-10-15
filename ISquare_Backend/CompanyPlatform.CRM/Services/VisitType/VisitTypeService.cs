using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Meeting;
using CompanyPlatform.CRM.VisitType;
using DocumentFormat.OpenXml.EMMA;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Models.CRM.Company;
using VisitTypeEntity = CompanyPlatform.Core.Models.CRM.Company.VisitType;

namespace CompanyPlatform.CRM.Services.VisitType
{
    public class VisitTypeService : IVisitTypeService
    {
        private readonly IRepositories<VisitTypeEntity> _repository;
        private readonly ILogger<VisitTypeService> _logger;

        public VisitTypeService(
            IRepositories<VisitTypeEntity> repository,
            ILogger<VisitTypeService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<VisitTypeDto>> GetAllVisitTypesAsync()
        {
            _logger.LogInformation("Fetching all visit types.");

            var items = await _repository.FindByCondition(x => !x.IsDeleted);

            return items.Select(v => new VisitTypeDto
            {
                ID = v.ID,
                VisitTypeName = v.VisitTypeName,
                IsActive = v.IsActive
            });
        }

        public async Task<VisitTypeDto> GetVisitTypeByIdAsync(int id)
        {
            _logger.LogInformation("Fetching Visit Type by ID: {ID}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning("Visit Type with ID: {ID} not found.", id);
                return null;
            }

            return new VisitTypeDto
            {
                ID = item.ID,
                VisitTypeName = item.VisitTypeName,
                IsActive = item.IsActive
            };
        }

        public async Task<VisitTypeDto> CreateVisitTypeAsync(VisitTypeDto dto)
        {
            _logger.LogInformation("Creating Visit Type: {VisitTypeName}", dto.VisitTypeName);

            var entity = new VisitTypeEntity
            {
                VisitTypeName = dto.VisitTypeName,
                IsActive = dto.IsActive,
                IsDeleted = false
            };

            await _repository.Create(entity);

            dto.ID = entity.ID;

            _logger.LogInformation("Successfully created Visit Type with ID: {ID}", entity.ID);

            return dto;
        }

        public async Task<bool> UpdateVisitTypeAsync(int id, VisitTypeDto dto)
        {
            _logger.LogInformation("Updating Visit Type with ID: {ID}", id);

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null || entity.IsDeleted)
            {
                _logger.LogWarning("Visit Type with ID: {ID} not found.", id);
                return false;
            }

            entity.VisitTypeName = dto.VisitTypeName;
            entity.IsActive = dto.IsActive;

            await _repository.Update(entity);

            _logger.LogInformation("Successfully updated Visit Type with ID: {ID}", id);

            return true;
        }

        public async Task<bool> DeleteVisitTypeAsync(int id)
        {
            _logger.LogInformation("Deleting Visit Type with ID: {ID}", id);

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null || entity.IsDeleted)
            {
                _logger.LogWarning("Visit Type with ID: {ID} not found.", id);
                return false;
            }

            entity.IsDeleted = true;

            await _repository.SoftDelete(entity);

            _logger.LogInformation("Successfully deleted Visit Type with ID: {ID}", id);

            return true;
        }
    }
}