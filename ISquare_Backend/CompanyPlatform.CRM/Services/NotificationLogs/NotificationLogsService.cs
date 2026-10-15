//using CompanyPlatform.Core.Repository;
//using CompanyPlatform.CRM.DTO.NotificationLogs;
//using Microsoft.Extensions.Logging;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace CompanyPlatform.CRM.Services.NotificationLogs
//{
//    public class NotificationLogsService : INotificationLogsService
//    {
//        private readonly IRepositories<Model.NotificationLogs> _repository;
//        private readonly ILogger<NotificationLogsService> _logger;

//        public NotificationLogsService(
//            IRepositories<Model.NotificationLogs> repository,
//            ILogger<NotificationLogsService> logger)
//        {
//            _repository = repository;
//            _logger = logger;
//        }

//        public async Task<IEnumerable<NotificationLogsDto>> GetAllNotificationLogsAsync()
//        {
//            _logger.LogInformation("Fetching all notification logs.");

//            var logs = await _repository.GetAll();

//            return logs
//                .Where(x => x.IsActive && !x.IsDeleted)
//                .Select(x => new NotificationLogsDto
//                {
//                    NotificationLogId = x.NotificationLogId,
//                    ReminderId = x.ReminderId,
//                    UserId = x.UserId,
//                    NotificationType = x.NotificationType,
//                    NotificationMessage = x.NotificationMessage,
//                    NotificationDate = x.NotificationDate,
//                    Status = x.Status,
//                    CreatedBy = x.CreatedBy,
//                    CreatedDate = x.CreatedDate,
//                    UpdatedBy = x.UpdatedBy,
//                    UpdatedDate = x.UpdatedDate,
//                    IsActive = x.IsActive,
//                    IsDeleted = x.IsDeleted
//                });
//        }

//        public async Task<NotificationLogsDto?> GetNotificationLogByIdAsync(int id)
//        {
//            _logger.LogInformation("Fetching Notification Log with ID : {Id}", id);

//            var log = await _repository.GetByIdAsync(id);

//            if (log == null || !log.IsActive || log.IsDeleted)
//            {
//                _logger.LogWarning("Notification Log not found.");
//                return null;
//            }

//            return new NotificationLogsDto
//            {
//                NotificationLogId = log.NotificationLogId,
//                ReminderId = log.ReminderId,
//                UserId = log.UserId,
//                NotificationType = log.NotificationType,
//                NotificationMessage = log.NotificationMessage,
//                NotificationDate = log.NotificationDate,
//                Status = log.Status,
//                CreatedBy = log.CreatedBy,
//                CreatedDate = log.CreatedDate,
//                UpdatedBy = log.UpdatedBy,
//                UpdatedDate = log.UpdatedDate,
//                IsActive = log.IsActive,
//                IsDeleted = log.IsDeleted
//            };
//        }

//        public async Task<NotificationLogsDto> CreateNotificationLogAsync(NotificationLogsDto dto)
//        {
//            _logger.LogInformation("Creating Notification Log.");

//            var log = new Model.NotificationLogs
//            {
//                ReminderId = dto.ReminderId,
//                UserId = dto.UserId,
//                NotificationType = dto.NotificationType,
//                NotificationMessage = dto.NotificationMessage,
//                NotificationDate = dto.NotificationDate,
//                Status = dto.Status,
//                CreatedBy = dto.CreatedBy,
//                CreatedDate = DateTime.Now,
//                IsActive = true,
//                IsDeleted = false
//            };

//            await _repository.Create(log);

//            dto.NotificationLogId = log.NotificationLogId;
//            dto.CreatedDate = log.CreatedDate;
//            dto.IsActive = log.IsActive;
//            dto.IsDeleted = log.IsDeleted;

//            return dto;
//        }

//        public async Task<bool> UpdateNotificationLogAsync(int id, NotificationLogsDto dto)
//        {
//            _logger.LogInformation("Updating Notification Log.");

//            var log = await _repository.GetByIdAsync(id);

//            if (log == null || !log.IsActive || log.IsDeleted)
//                return false;

//            log.ReminderId = dto.ReminderId;
//            log.UserId = dto.UserId;
//            log.NotificationType = dto.NotificationType;
//            log.NotificationMessage = dto.NotificationMessage;
//            log.NotificationDate = dto.NotificationDate;
//            log.Status = dto.Status;
//            log.UpdatedBy = dto.UpdatedBy;
//            log.UpdatedDate = DateTime.Now;
//            log.IsActive = dto.IsActive;
//            log.IsDeleted = dto.IsDeleted;

//            await _repository.Update(log);

//            return true;
//        }

//        public async Task<bool> DeleteNotificationLogAsync(int id)
//        {
//            _logger.LogInformation("Deleting Notification Log.");

//            var log = await _repository.GetByIdAsync(id);

//            if (log == null)
//                return false;

//            log.IsDeleted = true;

//            await _repository.Update(log);

//            return true;
//        }
//    }
//}

using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.NotificationLogs;
using NotificationLogsEntity = CompanyPlatform.Core.Models.CRM.Notification.NotificationLogs;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Services.NotificationLogs
{
    public class NotificationLogsService : INotificationLogsService
    {
        private readonly IRepositories<NotificationLogsEntity> _repository;
        private readonly ILogger<NotificationLogsService> _logger;

        public NotificationLogsService(
            IRepositories<NotificationLogsEntity> repository,
            ILogger<NotificationLogsService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<NotificationLogsDto>>
            GetAllNotificationLogsAsync()
        {
            var logs = await _repository.GetAll();

            return logs
                .Where(x => x.IsActive && !x.IsDeleted)
                .Select(MapToDto)
                .ToList();
        }

        public async Task<NotificationLogsDto?>
            GetNotificationLogByIdAsync(int id)
        {
            var log = await _repository.GetByIdAsync(id);

            if (log == null || !log.IsActive || log.IsDeleted)
                return null;

            return MapToDto(log);
        }

        public async Task<NotificationLogsDto>
            CreateNotificationLogAsync(NotificationLogsDto dto)
        {
            var log = new NotificationLogsEntity
            {
                ReminderId = dto.ReminderId,
                UserId = dto.UserId,
                NotificationType = dto.NotificationType,
                NotificationMessage = dto.NotificationMessage,
                NotificationDate = dto.NotificationDate,
                Status = dto.Status,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.UtcNow,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.Create(log);

            return MapToDto(log);
        }

        public async Task<bool>
            UpdateNotificationLogAsync(
                int id,
                NotificationLogsDto dto)
        {
            var log = await _repository.GetByIdAsync(id);

            if (log == null || !log.IsActive || log.IsDeleted)
                return false;

            log.ReminderId = dto.ReminderId;
            log.UserId = dto.UserId;
            log.NotificationType = dto.NotificationType;
            log.NotificationMessage = dto.NotificationMessage;
            log.NotificationDate = dto.NotificationDate;
            log.Status = dto.Status;
            log.UpdatedBy = dto.UpdatedBy;
            log.UpdatedDate = DateTime.UtcNow;
            log.IsActive = dto.IsActive;

            await _repository.Update(log);

            return true;
        }

        public async Task<bool>
            DeleteNotificationLogAsync(int id)
        {
            var log = await _repository.GetByIdAsync(id);

            if (log == null || log.IsDeleted)
                return false;

            log.IsDeleted = true;
            log.IsActive = false;

            await _repository.Update(log);

            return true;
        }

        private static NotificationLogsDto MapToDto(
            NotificationLogsEntity log)
        {
            return new NotificationLogsDto
            {
                NotificationLogId = log.NotificationLogId,
                ReminderId = log.ReminderId,
                UserId = log.UserId,
                NotificationType = log.NotificationType,
                NotificationMessage = log.NotificationMessage,
                NotificationDate = log.NotificationDate,
                Status = log.Status,
                CreatedBy = log.CreatedBy,
                CreatedDate = log.CreatedDate,
                UpdatedBy = log.UpdatedBy,
                UpdatedDate = log.UpdatedDate,
                IsActive = log.IsActive,
                IsDeleted = log.IsDeleted
            };
        }
    }
}