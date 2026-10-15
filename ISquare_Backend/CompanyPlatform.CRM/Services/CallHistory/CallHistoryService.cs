using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.CallHistory;
using CompanyPlatform.Core.Repository;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.CallHistory
{
    public class CallHistoryService : ICallHistoryService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Call.CallHistory> _repository;
        private readonly ILogger<CallHistoryService> _logger;

        public CallHistoryService(
            IRepositories<CompanyPlatform.Core.Models.CRM.Call.CallHistory> repository,
            ILogger<CallHistoryService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<CallHistoryDto>> GetAllCallHistoryAsync()
        {
            _logger.LogInformation("Fetching all active call history.");

            var items = await _repository.GetAll();

            return items
                .Where(x => x.IsDeleted == false)
                .Select(x => new CallHistoryDto
                {
                    HistoryId = x.HistoryId,
                    CallId = x.CallId,
                    Status = x.Status,
                    Remarks = x.Remarks,
                    CreatedDate = x.CreatedDate,
                    IsDeleted = x.IsDeleted
                });
        }

        public async Task<CallHistoryDto> GetCallHistoryByIdAsync(int id)
        {
            _logger.LogInformation("Fetching Call History by ID: {HistoryId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted == true)
            {
                _logger.LogWarning("Call History with ID: {HistoryId} not found or is deleted.", id);
                return null;
            }

            return new CallHistoryDto
            {
                HistoryId = item.HistoryId,
                CallId = item.CallId,
                Status = item.Status,
                Remarks = item.Remarks,
                CreatedDate = item.CreatedDate,
                IsDeleted = item.IsDeleted
            };
        }

        public async Task<CallHistoryDto> CreateCallHistoryAsync(CallHistoryDto dto)
        {
            _logger.LogInformation("Creating new Call History.");

            var newItem = new CompanyPlatform.Core.Models.CRM.Call.CallHistory {
                CallId = dto.CallId,
                Status = dto.Status,
                Remarks = dto.Remarks,
                CreatedDate = System.DateTime.Now,
                IsDeleted = false
            };

            await _repository.Create(newItem);

            dto.HistoryId = newItem.HistoryId;
            dto.CreatedDate = newItem.CreatedDate;
            dto.IsDeleted = newItem.IsDeleted;

            _logger.LogInformation("Successfully created Call History with ID: {HistoryId}", newItem.HistoryId);

            return dto;
        }

        public async Task<bool> UpdateCallHistoryAsync(int id, CallHistoryDto dto)
        {
            _logger.LogInformation("Attempting to update Call History with ID: {HistoryId}", id);

            var itemToUpdate = await _repository.GetByIdAsync(id);

            if (itemToUpdate == null || itemToUpdate.IsDeleted == true)
            {
                _logger.LogWarning("Update failed. Call History with ID: {HistoryId} not found or is deleted.", id);
                return false;
            }

            itemToUpdate.CallId = dto.CallId;
            itemToUpdate.Status = dto.Status;
            itemToUpdate.Remarks = dto.Remarks;

            await _repository.Update(itemToUpdate);

            _logger.LogInformation("Successfully updated Call History with ID: {HistoryId}", id);

            return true;
        }

        public async Task<bool> DeleteCallHistoryAsync(int id)
        {
            _logger.LogInformation("Attempting to delete Call History with ID: {HistoryId}", id);

            var itemToDelete = await _repository.GetByIdAsync(id);

            if (itemToDelete == null)
            {
                _logger.LogWarning("Delete failed. Call History with ID: {HistoryId} not found.", id);
                return false;
            }

            itemToDelete.IsDeleted = true;

            await _repository.Update(itemToDelete);

            _logger.LogInformation("Successfully deleted Call History with ID: {HistoryId}", id);

            return true;
        }
    }
}