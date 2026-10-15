//using CompanyPlatform.CRM.Services.Notification;
//using DocumentFormat.OpenXml.Spreadsheet;
//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace CompanyPlatform.CRM.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    [Authorize]
//    public class NotificationController : ControllerBase
//    {
//        private readonly INotificationService _notificationService;

//        public NotificationController(INotificationService notificationService)
//        {
//            _notificationService = notificationService;
//        }

//        [HttpGet]
//        public async Task<IActionResult> GetNotifications()
//        {
//            var employeeIdStr = User.FindFirstValue("EmployeeId");
//            if (!int.TryParse(employeeIdStr, out var employeeId))
//            {
//                return Unauthorized();
//            }

//            var notifications = await _notificationService.GetNotificationsForUserAsync(employeeId);
//            return Ok(notifications);
//        }

//        [HttpPut("mark-all-as-read")]
//        public async Task<IActionResult> MarkAllAsRead()
//        {
//            var employeeIdStr = User.FindFirstValue("EmployeeId");
//            if (!int.TryParse(employeeIdStr, out var employeeId))
//            {
//                return Unauthorized();
//            }

//            await _notificationService.MarkAllAsReadAsync(employeeId);
//            return NoContent();
//        }

//        [HttpPut("{notificationId}/read")]
//        public async Task<IActionResult> MarkAsRead(int notificationId)
//        {
//            var employeeIdStr = User.FindFirstValue("EmployeeId");
//            if (!int.TryParse(employeeIdStr, out var employeeId))
//            {
//                return Unauthorized();
//            }

//            var result = await _notificationService.MarkAsReadAsync(notificationId, employeeId);

//            if (!result)
//            {
//                return NotFound();
//            }

//            return NoContent();
//        }
//    }
//}

using CompanyPlatform.CRM.Services.Notification;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(
            INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        // GET: api/Notification
        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var employeeIdString =
                User.FindFirstValue("EmployeeId");

            if (!int.TryParse(
                    employeeIdString,
                    out var employeeId))
            {
                return Unauthorized(new
                {
                    Message = "Employee ID not found in token."
                });
            }

            var notifications =
                await _notificationService
                    .GetNotificationsForUserAsync(employeeId);

            return Ok(notifications);
        }

        // PUT: api/Notification/mark-all-as-read
        [HttpPut("mark-all-as-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var employeeIdString =
                User.FindFirstValue("EmployeeId");

            if (!int.TryParse(
                    employeeIdString,
                    out var employeeId))
            {
                return Unauthorized(new
                {
                    Message = "Employee ID not found in token."
                });
            }

            await _notificationService
                .MarkAllAsReadAsync(employeeId);

            return NoContent();
        }

        // PUT: api/Notification/{notificationId}/read
        [HttpPut("{notificationId}/read")]
        public async Task<IActionResult> MarkAsRead(
            int notificationId)
        {
            var employeeIdString =
                User.FindFirstValue("EmployeeId");

            if (!int.TryParse(
                    employeeIdString,
                    out var employeeId))
            {
                return Unauthorized(new
                {
                    Message = "Employee ID not found in token."
                });
            }

            var result =
                await _notificationService
                    .MarkAsReadAsync(
                        notificationId,
                        employeeId);

            if (!result)
            {
                return NotFound(new
                {
                    Message = "Notification not found."
                });
            }

            return NoContent();
        }
    }
}