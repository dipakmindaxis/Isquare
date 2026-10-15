//using CompanyPlatform.Core.Data;
//using Microsoft.AspNetCore.SignalR;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace CompanyPlatform.CRM.Services.Notification
//{

//    public interface INotificationHelper
//    {
//        Task SendManagerNotificationAsync(int employeeId, string actionMessage);
//    }

//    public class NotificationHelper : INotificationHelper
//    {
//        private readonly ApplicationDBContext _context;
//        private readonly INotificationService _notificationService;
//        private readonly IUserConnectionService _userConnectionService;
//        private readonly IHubContext<NotificationHub> _hubContext;

//        public NotificationHelper(
//            ApplicationDBContext context,
//            INotificationService notificationService,
//            IUserConnectionService userConnectionService,
//            IHubContext<NotificationHub> hubContext)
//        {
//            _context = context;
//            _notificationService = notificationService;
//            _userConnectionService = userConnectionService;
//            _hubContext = hubContext;
//        }

//        public async Task SendManagerNotificationAsync(int employeeId, string actionMessage)
//        {
//            var employee = await _context.Employees.FindAsync(employeeId);
//            if (employee == null || !employee.ReportingTo.HasValue)
//            {
//                return;
//            }

//            var managerId = employee.ReportingTo.Value;
//            var message = $"'{employee.FirstName} {employee.LastName}' has updated their {actionMessage}.";

//            await _notificationService.CreateNotificationAsync(managerId, message);

//            var managerConnectionId = _userConnectionService.GetUserConnection(managerId);
//            if (!string.IsNullOrEmpty(managerConnectionId))
//            {
//                await _hubContext.Clients.Client(managerConnectionId).SendAsync("ReceiveNotification", message);
//            }
//        }
//    }
//}


using CompanyPlatform.Core.Data;
using Microsoft.AspNetCore.SignalR;

namespace CompanyPlatform.CRM.Services.Notification
{
    public interface INotificationHelper
    {
        Task SendManagerNotificationAsync(
            int employeeId,
            string actionMessage);
    }

    public class NotificationHelper : INotificationHelper
    {
        private readonly ApplicationDBContext _context;

        private readonly INotificationService
            _notificationService;

        private readonly IUserConnectionService
            _userConnectionService;

        private readonly IHubContext<NotificationHub>
            _hubContext;

        public NotificationHelper(
            ApplicationDBContext context,
            INotificationService notificationService,
            IUserConnectionService userConnectionService,
            IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _notificationService = notificationService;
            _userConnectionService = userConnectionService;
            _hubContext = hubContext;
        }

        public async Task SendManagerNotificationAsync(
            int employeeId,
            string actionMessage)
        {
            var employee =
                await _context.Employees
                    .FindAsync(employeeId);

            if (employee == null ||
                !employee.ReportingTo.HasValue)
            {
                return;
            }

            var managerId =
                employee.ReportingTo.Value;

            var message =
                $"'{employee.FirstName} {employee.LastName}' " +
                $"has updated their {actionMessage}.";

            // Save notification in database
            await _notificationService
                .CreateNotificationAsync(
                    managerId,
                    message);

            // Send real-time notification
            var connectionId =
                _userConnectionService
                    .GetUserConnection(managerId);

            if (!string.IsNullOrEmpty(connectionId))
            {
                await _hubContext.Clients
                    .Client(connectionId)
                    .SendAsync(
                        "ReceiveNotification",
                        new
                        {
                            EmployeeId = managerId,
                            Message = message,
                            CreatedAt = DateTime.UtcNow
                        });
            }
        }
    }
}