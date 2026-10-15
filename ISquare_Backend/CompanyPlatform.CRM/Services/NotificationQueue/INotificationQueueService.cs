//using CompanyPlatform.CRM.DTO;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace CompanyPlatform.CRM.Services.NotificationQueue
//{
//    public interface INotificationQueueService
//    {
//        Task<NotificationQueueDto> CreateNotificationQueueAsync(CreateNotificationQueueDto dto);

//        Task<IEnumerable<NotificationQueueDto>> GetAllNotificationQueuesAsync();

//        Task<NotificationQueueDto?> GetNotificationQueueByIdAsync(int id);

//        Task<bool> UpdateNotificationQueueAsync(int id, NotificationQueueDto dto);

//        Task<bool> DeleteNotificationQueueAsync(int id);
//    }
//}

using CompanyPlatform.CRM.DTO;

namespace CompanyPlatform.CRM.Services.NotificationQueue
{
    public interface INotificationQueueService
    {
        Task<NotificationQueueDto>
            CreateNotificationQueueAsync(
                CreateNotificationQueueDto dto);

        Task<IEnumerable<NotificationQueueDto>>
            GetAllNotificationQueuesAsync();

        Task<NotificationQueueDto?>
            GetNotificationQueueByIdAsync(int id);

        Task<bool>
            UpdateNotificationQueueAsync(
                int id,
                NotificationQueueDto dto);

        Task<bool>
            DeleteNotificationQueueAsync(int id);
    }
}