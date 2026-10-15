//using CompanyPlatform.CRM.DTO.NotificationLogs;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace CompanyPlatform.CRM.Services.NotificationLogs
//{
//    public interface INotificationLogsService
//    {
//        Task<IEnumerable<NotificationLogsDto>> GetAllNotificationLogsAsync();

//    Task<NotificationLogsDto?> GetNotificationLogByIdAsync(int id);

//    Task<NotificationLogsDto> CreateNotificationLogAsync(NotificationLogsDto dto);

//    Task<bool> UpdateNotificationLogAsync(int id, NotificationLogsDto dto);

//    Task<bool> DeleteNotificationLogAsync(int id);
//}
//}

using CompanyPlatform.CRM.DTO.NotificationLogs;

namespace CompanyPlatform.CRM.Services.NotificationLogs
{
    public interface INotificationLogsService
    {
        Task<IEnumerable<NotificationLogsDto>>
            GetAllNotificationLogsAsync();

        Task<NotificationLogsDto?>
            GetNotificationLogByIdAsync(int id);

        Task<NotificationLogsDto>
            CreateNotificationLogAsync(
                NotificationLogsDto dto);

        Task<bool>
            UpdateNotificationLogAsync(
                int id,
                NotificationLogsDto dto);

        Task<bool>
            DeleteNotificationLogAsync(int id);
    }
}