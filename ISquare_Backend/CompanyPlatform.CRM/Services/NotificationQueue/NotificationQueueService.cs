//using CompanyPlatform.Core.Repository;
//using CompanyPlatform.CRM.DTO;
//using DocumentFormat.OpenXml.EMMA;
//using Microsoft.Extensions.Logging;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace CompanyPlatform.CRM.Services.NotificationQueue
//{
//    public class NotificationQueueService : INotificationQueueService
//    {
//        private readonly IRepositories<Model.NotificationQueue> _repository;
//        private readonly ILogger<NotificationQueueService> _logger;

//        public NotificationQueueService(
//            IRepositories<Model.NotificationQueue> repository,
//            ILogger<NotificationQueueService> logger)
//        {
//            _repository = repository;
//            _logger = logger;
//        }

//        public async Task<NotificationQueueDto> CreateNotificationQueueAsync(CreateNotificationQueueDto dto)
//        {
//            _logger.LogInformation("Creating Notification Queue.");

//            var notificationQueue = new Model.NotificationQueue
//            {
//                NotificationId = dto.NotificationId,
//                QueueStatus = dto.QueueStatus,
//                RetryCount = dto.RetryCount,
//                ScheduledTime = dto.ScheduledTime,
//                ProcessedTime = dto.ProcessedTime,
//                ErrorMessage = dto.ErrorMessage,
//                IsActive = dto.IsActive,
//                IsDeleted = false
//            };

//            await _repository.Create(notificationQueue);

//            return new NotificationQueueDto
//            {
//                QueueId = notificationQueue.QueueId,
//                NotificationId = notificationQueue.NotificationId,
//                QueueStatus = notificationQueue.QueueStatus,
//                RetryCount = notificationQueue.RetryCount,
//                ScheduledTime = notificationQueue.ScheduledTime,
//                ProcessedTime = notificationQueue.ProcessedTime,
//                ErrorMessage = notificationQueue.ErrorMessage,
//                IsActive = notificationQueue.IsActive,
//                IsDeleted = notificationQueue.IsDeleted
//            };
//        }

//        public async Task<IEnumerable<NotificationQueueDto>> GetAllNotificationQueuesAsync()
//        {
//            _logger.LogInformation("Fetching all Notification Queues.");

//            var queues = await _repository.GetAll();

//            return queues
//                .Where(x => !x.IsDeleted)
//                .Select(x => new NotificationQueueDto
//                {
//                    QueueId = x.QueueId,
//                    NotificationId = x.NotificationId,
//                    QueueStatus = x.QueueStatus,
//                    RetryCount = x.RetryCount,
//                    ScheduledTime = x.ScheduledTime,
//                    ProcessedTime = x.ProcessedTime,
//                    ErrorMessage = x.ErrorMessage,
//                    IsActive = x.IsActive,
//                    IsDeleted = x.IsDeleted
//                });
//        }

//        public async Task<NotificationQueueDto?> GetNotificationQueueByIdAsync(int id)
//        {
//            _logger.LogInformation("Fetching Notification Queue with ID : {QueueId}", id);

//            var queue = await _repository.GetByIdAsync(id);

//            if (queue == null || queue.IsDeleted)
//                return null;

//            return new NotificationQueueDto
//            {
//                QueueId = queue.QueueId,
//                NotificationId = queue.NotificationId,
//                QueueStatus = queue.QueueStatus,
//                RetryCount = queue.RetryCount,
//                ScheduledTime = queue.ScheduledTime,
//                ProcessedTime = queue.ProcessedTime,
//                ErrorMessage = queue.ErrorMessage,
//                IsActive = queue.IsActive,
//                IsDeleted = queue.IsDeleted
//            };
//        }

//        public async Task<bool> UpdateNotificationQueueAsync(int id, NotificationQueueDto dto)
//        {
//            _logger.LogInformation("Updating Notification Queue.");

//            var queue = await _repository.GetByIdAsync(id);

//            if (queue == null || queue.IsDeleted)
//                return false;

//            queue.NotificationId = dto.NotificationId;
//            queue.QueueStatus = dto.QueueStatus;
//            queue.RetryCount = dto.RetryCount;
//            queue.ScheduledTime = dto.ScheduledTime;
//            queue.ProcessedTime = dto.ProcessedTime;
//            queue.ErrorMessage = dto.ErrorMessage;
//            queue.IsActive = dto.IsActive;

//            await _repository.Update(queue);

//            return true;
//        }

//        public async Task<bool> DeleteNotificationQueueAsync(int id)
//        {
//            _logger.LogInformation("Deleting Notification Queue.");

//            var queue = await _repository.GetByIdAsync(id);

//            if (queue == null)
//                return false;

//            queue.IsDeleted = true;
//            queue.IsActive = false;

//            await _repository.Update(queue);

//            return true;
//        }
//    }
//}


using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO;
using NotificationQueueEntity =
    CompanyPlatform.Core.Models.CRM.Notification.NotificationQueue;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Services.NotificationQueue
{
    public class NotificationQueueService : INotificationQueueService
    {
        private readonly IRepositories<NotificationQueueEntity> _repository;
        private readonly ILogger<NotificationQueueService> _logger;

        public NotificationQueueService(
            IRepositories<NotificationQueueEntity> repository,
            ILogger<NotificationQueueService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<NotificationQueueDto>
            CreateNotificationQueueAsync(
                CreateNotificationQueueDto dto)
        {
            var queue = new NotificationQueueEntity
            {
                NotificationId = dto.NotificationId,
                QueueStatus = dto.QueueStatus,
                RetryCount = dto.RetryCount,
                ScheduledTime = dto.ScheduledTime,
                ProcessedTime = dto.ProcessedTime,
                ErrorMessage = dto.ErrorMessage,
                IsActive = dto.IsActive,
                IsDeleted = false
            };

            await _repository.Create(queue);

            return MapToDto(queue);
        }

        public async Task<IEnumerable<NotificationQueueDto>>
            GetAllNotificationQueuesAsync()
        {
            var queues = await _repository.GetAll();

            return queues
                .Where(x => !x.IsDeleted)
                .Select(MapToDto)
                .ToList();
        }

        public async Task<NotificationQueueDto?>
            GetNotificationQueueByIdAsync(int id)
        {
            var queue = await _repository.GetByIdAsync(id);

            if (queue == null || queue.IsDeleted)
                return null;

            return MapToDto(queue);
        }

        public async Task<bool>
            UpdateNotificationQueueAsync(
                int id,
                NotificationQueueDto dto)
        {
            var queue = await _repository.GetByIdAsync(id);

            if (queue == null || queue.IsDeleted)
                return false;

            queue.NotificationId = dto.NotificationId;
            queue.QueueStatus = dto.QueueStatus;
            queue.RetryCount = dto.RetryCount;
            queue.ScheduledTime = dto.ScheduledTime;
            queue.ProcessedTime = dto.ProcessedTime;
            queue.ErrorMessage = dto.ErrorMessage;
            queue.IsActive = dto.IsActive;

            await _repository.Update(queue);

            return true;
        }

        public async Task<bool>
            DeleteNotificationQueueAsync(int id)
        {
            var queue = await _repository.GetByIdAsync(id);

            if (queue == null || queue.IsDeleted)
                return false;

            queue.IsDeleted = true;
            queue.IsActive = false;

            await _repository.Update(queue);

            return true;
        }

        private static NotificationQueueDto MapToDto(
            NotificationQueueEntity queue)
        {
            return new NotificationQueueDto
            {
                QueueId = queue.QueueId,
                NotificationId = queue.NotificationId,
                QueueStatus = queue.QueueStatus,
                RetryCount = queue.RetryCount,
                ScheduledTime = queue.ScheduledTime,
                ProcessedTime = queue.ProcessedTime,
                ErrorMessage = queue.ErrorMessage,
                IsActive = queue.IsActive,
                IsDeleted = queue.IsDeleted
            };
        }
    }
}