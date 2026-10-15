using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.ActivityLog;
using Microsoft.Extensions.Logging;

using ActivityLogEntity =
    CompanyPlatform.Core.Models.CRM.Company.ActivityLog;

namespace CompanyPlatform.CRM.Services.ActivityLog
{
    public class ActivityLogService : IActivityLogService
    {
        private readonly IRepositories<ActivityLogEntity> _repository;
        private readonly ILogger<ActivityLogService> _logger;

        public ActivityLogService(
            IRepositories<ActivityLogEntity> repository,
            ILogger<ActivityLogService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<ActivityLogDto>> GetAllActivityLogsAsync()
        {
            _logger.LogInformation("Fetching all activity logs.");

            var items = await _repository.GetAll();

            return items
                .Where(a => !a.IsDeleted)
                .Select(a => new ActivityLogDto
                {
                    ActivityLogId = a.ActivityLogId,
                    CompanyId = a.CompanyId,
                    UserId = a.UserId,
                    ActivityType = a.ActivityType,
                    Description = a.Description,
                    ActivityDate = a.ActivityDate,
                    IsDeleted = a.IsDeleted
                });
        }

        public async Task<ActivityLogDto?> GetActivityLogByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching activity log by ID: {ActivityLogId}",
                id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning(
                    "Activity log with ID: {ActivityLogId} not found.",
                    id);

                return null;
            }

            return new ActivityLogDto
            {
                ActivityLogId = item.ActivityLogId,
                CompanyId = item.CompanyId,
                UserId = item.UserId,
                ActivityType = item.ActivityType,
                Description = item.Description,
                ActivityDate = item.ActivityDate,
                IsDeleted = item.IsDeleted
            };
        }

        public async Task<ActivityLogDto> CreateActivityLogAsync(
            ActivityLogDto dto)
        {
            _logger.LogInformation("Creating a new activity log.");

            var activityLog = new ActivityLogEntity
            {
                CompanyId = dto.CompanyId,
                UserId = dto.UserId,
                ActivityType = dto.ActivityType,
                Description = dto.Description,
                ActivityDate = DateTime.Now,
                IsDeleted = false
            };

            await _repository.Create(activityLog);

            dto.ActivityLogId = activityLog.ActivityLogId;
            dto.ActivityDate = activityLog.ActivityDate;
            dto.IsDeleted = activityLog.IsDeleted;

            _logger.LogInformation(
                "Successfully created activity log with ID: {ActivityLogId}",
                activityLog.ActivityLogId);

            return dto;
        }

        public async Task<bool> UpdateActivityLogAsync(
            int id,
            ActivityLogDto dto)
        {
            _logger.LogInformation(
                "Updating activity log with ID: {ActivityLogId}",
                id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning(
                    "Activity log with ID: {ActivityLogId} not found.",
                    id);

                return false;
            }

            item.CompanyId = dto.CompanyId;
            item.UserId = dto.UserId;
            item.ActivityType = dto.ActivityType;
            item.Description = dto.Description;

            await _repository.Update(item);

            _logger.LogInformation(
                "Successfully updated activity log with ID: {ActivityLogId}",
                id);

            return true;
        }

        public async Task<bool> DeleteActivityLogAsync(int id)
        {
            _logger.LogInformation(
                "Deleting activity log with ID: {ActivityLogId}",
                id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null)
            {
                _logger.LogWarning(
                    "Activity log with ID: {ActivityLogId} not found.",
                    id);

                return false;
            }

            item.IsDeleted = true;

            await _repository.Update(item);

            _logger.LogInformation(
                "Successfully deleted activity log with ID: {ActivityLogId}",
                id);

            return true;
        }
    }
}




//using CompanyPlatform.Core.Repository;
//using CompanyPlatform.CRM.DTO.ActivityLog;
//using Microsoft.Extensions.Logging;

//namespace CompanyPlatform.CRM.Services.ActivityLog
//{
//    public class ActivityLogService : IActivityLogService
//    {
//        private readonly IRepositories<Model.ActivityLog> _repository;
//        private readonly ILogger<ActivityLogService> _logger;

//        public ActivityLogService(
//            IRepositories<Model.ActivityLog> repository,
//            ILogger<ActivityLogService> logger)
//        {
//            _repository = repository;
//            _logger = logger;
//        }

//        public async Task<IEnumerable<ActivityLogDto>> GetAllActivityLogsAsync()
//        {
//            _logger.LogInformation("Fetching all activity logs.");

//            var items = await _repository.GetAll();

//            return items
//                .Where(a => a.IsDeleted == false)
//                .Select(a => new ActivityLogDto
//                {
//                    ActivityLogId = a.ActivityLogId,
//                    CompanyId = a.CompanyId,
//                    UserId = a.UserId,
//                    ActivityType = a.ActivityType,
//                    Description = a.Description,
//                    ActivityDate = a.ActivityDate,
//                    IsDeleted = a.IsDeleted
//                });
//        }

//        public async Task<ActivityLogDto> GetActivityLogByIdAsync(int id)
//        {
//            _logger.LogInformation("Fetching activity log by ID: {ActivityLogId}", id);

//            var item = await _repository.GetByIdAsync(id);

//            if (item == null || item.IsDeleted)
//            {
//                _logger.LogWarning("Activity log with ID: {ActivityLogId} not found.", id);
//                return null;
//            }

//            return new ActivityLogDto
//            {
//                ActivityLogId = item.ActivityLogId,
//                CompanyId = item.CompanyId,
//                UserId = item.UserId,
//                ActivityType = item.ActivityType,
//                Description = item.Description,
//                ActivityDate = item.ActivityDate,
//                IsDeleted = item.IsDeleted
//            };
//        }

//        public async Task<ActivityLogDto> CreateActivityLogAsync(ActivityLogDto dto)
//        {
//            _logger.LogInformation("Creating a new activity log.");

//            var activityLog = new Model.ActivityLog
//            {
//                CompanyId = dto.CompanyId,
//                UserId = dto.UserId,
//                ActivityType = dto.ActivityType,
//                Description = dto.Description,
//                ActivityDate = DateTime.Now,
//                IsDeleted = false
//            };

//            await _repository.Create(activityLog);

//            dto.ActivityLogId = activityLog.ActivityLogId;
//            dto.ActivityDate = activityLog.ActivityDate;
//            dto.IsDeleted = activityLog.IsDeleted;

//            _logger.LogInformation("Successfully created activity log with ID: {ActivityLogId}", activityLog.ActivityLogId);

//            return dto;
//        }

//        public async Task<bool> UpdateActivityLogAsync(int id, ActivityLogDto dto)
//        {
//            _logger.LogInformation("Updating activity log with ID: {ActivityLogId}", id);

//            var item = await _repository.GetByIdAsync(id);

//            if (item == null || item.IsDeleted)
//            {
//                _logger.LogWarning("Activity log with ID: {ActivityLogId} not found.", id);
//                return false;
//            }

//            item.CompanyId = dto.CompanyId;
//            item.UserId = dto.UserId;
//            item.ActivityType = dto.ActivityType;
//            item.Description = dto.Description;

//            await _repository.Update(item);

//            _logger.LogInformation("Successfully updated activity log with ID: {ActivityLogId}", id);

//            return true;
//        }

//        public async Task<bool> DeleteActivityLogAsync(int id)
//        {
//            _logger.LogInformation("Deleting activity log with ID: {ActivityLogId}", id);

//            var item = await _repository.GetByIdAsync(id);

//            if (item == null)
//            {
//                _logger.LogWarning("Activity log with ID: {ActivityLogId} not found.", id);
//                return false;
//            }

//            item.IsDeleted = true;

//            await _repository.Update(item);

//            _logger.LogInformation("Successfully deleted activity log with ID: {ActivityLogId}", id);

//            return true;
//        }
//    }
//}