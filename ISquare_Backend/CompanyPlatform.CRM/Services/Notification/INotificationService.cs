//using CompanyPlatform.CRM.Models;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace CompanyPlatform.CRM.Services.Notification
//{
//    internal class INotificationService
//    {
//        Task CreateNotificationAsync(int employeeId, string message);
//        Task<List<Notifications>> GetNotificationsForUserAsync(int employeeId);
//        Task MarkAllAsReadAsync(int employeeId);
//        Task<bool> MarkAsReadAsync(int notificationId, int employeeId);


//    }
//}


using CompanyPlatform.Core.Models.CRM.Notification;

namespace CompanyPlatform.CRM.Services.Notification
{
    public interface INotificationService
    {
        Task CreateNotificationAsync(
            int employeeId,
            string message);

        Task<List<Notifications>> GetNotificationsForUserAsync(
            int employeeId);

        Task MarkAllAsReadAsync(
            int employeeId);

        Task<bool> MarkAsReadAsync(
            int notificationId,
            int employeeId);
    }
}