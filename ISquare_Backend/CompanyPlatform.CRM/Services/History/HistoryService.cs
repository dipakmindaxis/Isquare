using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.History;
using Microsoft.Extensions.Logging;
using HistoryModel = CompanyPlatform.Core.Models.CRM.Company.History;

namespace CompanyPlatform.CRM.Services.History
{
    public class HistoryService : IHistoryService
    {
        private readonly IRepositories<HistoryModel> _repository;
        private readonly ILogger<HistoryService> _logger;

        public HistoryService(
            IRepositories<HistoryModel> repository,
            ILogger<HistoryService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<HistoryDto>> GetAllHistoryAsync()
        {
            _logger.LogInformation("Fetching all history records.");

            var items = await _repository.GetAll();

            return items
                .Where(h => h.IsDeleted == false)
                .Select(h => new HistoryDto
                {
                    HistoryId = h.HistoryId,
                    CompanyId = h.CompanyId,
                    UserId = h.UserId,
                    RefType = h.RefType,
                    RefId = h.RefId,
                    Description = h.Description,
                    ActivityDate = h.ActivityDate
                });
        }

        public async Task<HistoryDto> GetHistoryByIdAsync(int id)
        {
            _logger.LogInformation("Fetching history by ID : {HistoryId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning("History with ID : {HistoryId} not found.", id);
                return null;
            }

            return new HistoryDto
            {
                HistoryId = item.HistoryId,
                CompanyId = item.CompanyId,
                UserId = item.UserId,
                RefType = item.RefType,
                RefId = item.RefId,
                Description = item.Description,
                ActivityDate = item.ActivityDate
            };
        }

        public async Task<HistoryDto> CreateHistoryAsync(HistoryDto dto)
        {
            _logger.LogInformation("Creating new history record.");

            var history = new HistoryModel
            {
                CompanyId = dto.CompanyId,
                UserId = dto.UserId,
                RefType = dto.RefType,
                RefId = dto.RefId,
                Description = dto.Description,
                ActivityDate = DateTime.Now,
                IsDeleted = false
            };

            await _repository.Create(history);

            dto.HistoryId = history.HistoryId;
            dto.ActivityDate = history.ActivityDate;

            _logger.LogInformation("History created successfully with ID : {HistoryId}", history.HistoryId);

            return dto;
        }

        public async Task<bool> UpdateHistoryAsync(int id, HistoryDto dto)
        {
            _logger.LogInformation("Updating history with ID : {HistoryId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning("History with ID : {HistoryId} not found.", id);
                return false;
            }

            item.CompanyId = dto.CompanyId;
            item.UserId = dto.UserId;
            item.RefType = dto.RefType;
            item.RefId = dto.RefId;
            item.Description = dto.Description;

            await _repository.Update(item);

            _logger.LogInformation("History updated successfully.");

            return true;
        }

        public async Task<bool> DeleteHistoryAsync(int id)
        {
            _logger.LogInformation("Deleting history with ID : {HistoryId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null)
            {
                _logger.LogWarning("History with ID : {HistoryId} not found.", id);
                return false;
            }

            item.IsDeleted = true;

            await _repository.Update(item);

            _logger.LogInformation("History deleted successfully.");

            return true;
        }
    }
}