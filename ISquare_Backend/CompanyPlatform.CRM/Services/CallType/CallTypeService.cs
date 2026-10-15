using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.CallType;
using CompanyPlatform.Core.Repository;

namespace CompanyPlatform.CRM.Services.CallType
{
    public class CallTypeService : ICallTypeService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Call.CallType> _repository;
        private readonly ILogger<CallTypeService> _logger;

        public CallTypeService(
            IRepositories<CompanyPlatform.Core.Models.CRM.Call.CallType> repository,
            ILogger<CallTypeService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<CallTypeDto>> GetAllCallTypesAsync()
        {
            _logger.LogInformation("Fetching all call types.");

            var items = await _repository.FindByCondition(x => !x.IsDeleted);

            return items.Select(c => new CallTypeDto
            {
                ID = c.ID,
                CallTypeName = c.CallTypeName,
                IsActive = c.IsActive
            });
        }

        public async Task<CallTypeDto> GetCallTypeByIdAsync(int id)
        {
            _logger.LogInformation("Fetching call type by ID: {ID}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning("Call Type with ID: {ID} not found.", id);
                return null;
            }

            return new CallTypeDto
            {
                ID = item.ID,
                CallTypeName = item.CallTypeName,
                IsActive = item.IsActive
            };
        }

        public async Task<CallTypeDto> CreateCallTypeAsync(CallTypeDto dto)
        {
            _logger.LogInformation("Creating Call Type: {CallTypeName}", dto.CallTypeName);

            var entity = new CompanyPlatform.Core.Models.CRM.Call.CallType {
                CallTypeName = dto.CallTypeName,
                IsActive = dto.IsActive,
                IsDeleted = false
            };

            await _repository.Create(entity);

            dto.ID = entity.ID;

            _logger.LogInformation("Successfully created Call Type with ID: {ID}", entity.ID);

            return dto;
        }

        public async Task<bool> UpdateCallTypeAsync(int id, CallTypeDto dto)
        {
            _logger.LogInformation("Updating Call Type with ID: {ID}", id);

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null || entity.IsDeleted)
            {
                _logger.LogWarning("Call Type with ID: {ID} not found.", id);
                return false;
            }

            entity.CallTypeName = dto.CallTypeName;
            entity.IsActive = dto.IsActive;

            await _repository.Update(entity);

            _logger.LogInformation("Successfully updated Call Type with ID: {ID}", id);

            return true;
        }

        public async Task<bool> DeleteCallTypeAsync(int id)
        {
            _logger.LogInformation("Deleting Call Type with ID: {ID}", id);

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null || entity.IsDeleted)
            {
                _logger.LogWarning("Call Type with ID: {ID} not found.", id);
                return false;
            }

            entity.IsDeleted = true;

            await _repository.SoftDelete(entity);

            _logger.LogInformation("Successfully deleted Call Type with ID: {ID}", id);

            return true;
        }
    }
}