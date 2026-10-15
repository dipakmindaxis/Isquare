using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.Call;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
namespace CompanyPlatform.CRM.Services.Call
{
    public class CallService : ICallService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Call.Call> _repository;
        private readonly ILogger<CallService> _logger;

        public CallService(
            IRepositories<CompanyPlatform.Core.Models.CRM.Call.Call> repository,
            ILogger<CallService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<CallDto>> GetAllCallsAsync()
        {
            _logger.LogInformation("Fetching all active calls.");

            var items = await _repository.GetAll();

            return items
                .Where(x => x.IsDeleted == false)
                .Select(x => new CallDto
                {
                    CallId = x.CallId,
                    CompanyId = x.CompanyId,
                    CallTypeId = x.CallTypeId,
                    UserId = x.UserId,
                    CallDate = x.CallDate,
                    Duration = x.Duration,
                    Status = x.Status,
                    Remarks = x.Remarks,
                    NextFollowUpDate = x.NextFollowUpDate,
                    CreatedBy = x.CreatedBy,
                    CreatedDate = x.CreatedDate,
                    IsDeleted = x.IsDeleted
                });
        }

        public async Task<CallDto> GetCallByIdAsync(int id)
        {
            _logger.LogInformation("Fetching Call by ID: {CallId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted == true)
            {
                _logger.LogWarning("Call with ID: {CallId} not found or is deleted.", id);
                return null;
            }

            return new CallDto
            {
                CallId = item.CallId,
                CompanyId = item.CompanyId,
                CallTypeId = item.CallTypeId,
                UserId = item.UserId,
                CallDate = item.CallDate,
                Duration = item.Duration,
                Status = item.Status,
                Remarks = item.Remarks,
                NextFollowUpDate = item.NextFollowUpDate,
                CreatedBy = item.CreatedBy,
                CreatedDate = item.CreatedDate,
                IsDeleted = item.IsDeleted
            };
        }

        public async Task<CallDto> CreateCallAsync(CallDto dto)
        {
            _logger.LogInformation("Creating a new Call.");

            var newItem = new CompanyPlatform.Core.Models.CRM.Call.Call {
                CompanyId = dto.CompanyId,
                CallTypeId = dto.CallTypeId,
                UserId = dto.UserId,
                CallDate = dto.CallDate,
                Duration = dto.Duration,
                Status = dto.Status,
                Remarks = dto.Remarks,
                NextFollowUpDate = dto.NextFollowUpDate,
                CreatedBy = dto.CreatedBy,
                CreatedDate = System.DateTime.Now,
                IsDeleted = false
            };

            await _repository.Create(newItem);

            dto.CallId = newItem.CallId;
            dto.CreatedDate = newItem.CreatedDate;
            dto.IsDeleted = newItem.IsDeleted;

            _logger.LogInformation("Successfully created Call with ID: {CallId}", newItem.CallId);

            return dto;
        }

        public async Task<bool> UpdateCallAsync(int id, CallDto dto)
        {
            _logger.LogInformation("Attempting to update Call with ID: {CallId}", id);

            var itemToUpdate = await _repository.GetByIdAsync(id);

            if (itemToUpdate == null || itemToUpdate.IsDeleted == true)
            {
                _logger.LogWarning("Update failed. Call with ID: {CallId} not found or is deleted.", id);
                return false;
            }

            itemToUpdate.CompanyId = dto.CompanyId;
            itemToUpdate.CallTypeId = dto.CallTypeId;
            itemToUpdate.UserId = dto.UserId;
            itemToUpdate.CallDate = dto.CallDate;
            itemToUpdate.Duration = dto.Duration;
            itemToUpdate.Status = dto.Status;
            itemToUpdate.Remarks = dto.Remarks;
            itemToUpdate.NextFollowUpDate = dto.NextFollowUpDate;
            itemToUpdate.CreatedBy = dto.CreatedBy;

            await _repository.Update(itemToUpdate);

            _logger.LogInformation("Successfully updated Call with ID: {CallId}", id);

            return true;
        }

        public async Task<bool> DeleteCallAsync(int id)
        {
            _logger.LogInformation("Attempting to delete Call with ID: {CallId}", id);

            var itemToDelete = await _repository.GetByIdAsync(id);

            if (itemToDelete == null)
            {
                _logger.LogWarning("Delete failed. Call with ID: {CallId} not found.", id);
                return false;
            }

            itemToDelete.IsDeleted = true;

            await _repository.Update(itemToDelete);

            _logger.LogInformation("Successfully deleted Call with ID: {CallId}", id);

            return true;
        }
    }
}