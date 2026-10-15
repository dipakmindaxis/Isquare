using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.FollowUp;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Models.CRM.Company;
using FollowUpEntity = CompanyPlatform.Core.Models.CRM.Company.FollowUp;
namespace CompanyPlatform.CRM.Services.FollowUp
{
    public class FollowUpService : IFollowUpService
    {
        private readonly IRepositories<FollowUpEntity> _repository;
        private readonly ILogger<FollowUpService> _logger;

        public FollowUpService(
            IRepositories<FollowUpEntity> repository,
            ILogger<FollowUpService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<FollowUpDto>> GetAllFollowUpsAsync()
        {
            _logger.LogInformation("Fetching all FollowUps.");

            var followUps = await _repository.GetAll();

            return followUps
                .Where(x => x.IsActive)
                .Select(x => new FollowUpDto
                {
                    FollowUpId = x.FollowUpId,
                    CompanyId = x.CompanyId,
                    UserId = x.UserId,
                    FollowUpDate = x.FollowUpDate,
                    Remarks = x.Remarks,
                    StatusId = x.StatusId,
                    PriorityId = x.PriorityId,
                    NextFollowUpDate = x.NextFollowUpDate,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                });
        }

        public async Task<FollowUpDto?> GetFollowUpByIdAsync(int id)
        {
            _logger.LogInformation("Fetching FollowUp with ID : {Id}", id);

            var followUp = await _repository.GetByIdAsync(id);

            if (followUp == null || !followUp.IsActive)
            {
                _logger.LogWarning("FollowUp not found.");
                return null;
            }

            return new FollowUpDto
            {
                FollowUpId = followUp.FollowUpId,
                CompanyId = followUp.CompanyId,
                UserId = followUp.UserId,
                FollowUpDate = followUp.FollowUpDate,
                Remarks = followUp.Remarks,
                StatusId = followUp.StatusId,
                PriorityId = followUp.PriorityId,
                NextFollowUpDate = followUp.NextFollowUpDate,
                IsActive = followUp.IsActive,
                IsDeleted = followUp.IsDeleted
            };
        }

        public async Task<FollowUpDto> CreateFollowUpAsync(FollowUpDto dto)
        {
            _logger.LogInformation("Creating FollowUp.");

            var followUp = new FollowUpEntity
            {
                CompanyId = dto.CompanyId,
                UserId = dto.UserId,
                FollowUpDate = dto.FollowUpDate,
                Remarks = dto.Remarks,
                StatusId = dto.StatusId,
                PriorityId = dto.PriorityId,
                NextFollowUpDate = dto.NextFollowUpDate,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.Create(followUp);

            dto.FollowUpId = followUp.FollowUpId;
            dto.IsActive = followUp.IsActive;
            dto.IsDeleted = followUp.IsDeleted;

            return dto;
        }

        public async Task<bool> UpdateFollowUpAsync(int id, FollowUpDto dto)
        {
            _logger.LogInformation("Updating FollowUp.");

            var followUp = await _repository.GetByIdAsync(id);

            if (followUp == null || !followUp.IsActive)
                return false;

            followUp.CompanyId = dto.CompanyId;
            followUp.UserId = dto.UserId;
            followUp.FollowUpDate = dto.FollowUpDate;
            followUp.Remarks = dto.Remarks;
            followUp.StatusId = dto.StatusId;
            followUp.PriorityId = dto.PriorityId;
            followUp.NextFollowUpDate = dto.NextFollowUpDate;

            await _repository.Update(followUp);

            return true;
        }

        public async Task<bool> DeleteFollowUpAsync(int id)
        {
            _logger.LogInformation("Deleting FollowUp.");

            var followUp = await _repository.GetByIdAsync(id);

            if (followUp == null)
                return false;

            followUp.IsActive = false;
            followUp.IsDeleted = true;

            await _repository.Update(followUp);

            return true;
        }
    }
}