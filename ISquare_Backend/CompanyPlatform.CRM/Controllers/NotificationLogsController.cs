//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.Extensions.Logging;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace CompanyPlatform.CRM.Controllers
//{
//    [Authorize]
//    [Route("api/[controller]")]
//    [ApiController]
//    public class NotificationLogsController : ControllerBase
//    {
//        private readonly INotificationLogsService _notificationLogsService;
//        private readonly ILogger<NotificationLogsController> _logger;

//        public NotificationLogsController(
//            INotificationLogsService notificationLogsService,
//            ILogger<NotificationLogsController> logger)
//        {
//            _notificationLogsService = notificationLogsService;
//            _logger = logger;
//        }

//        // GET: api/NotificationLogs
//        [HttpGet]
//        public async Task<IActionResult> GetAll()
//        {
//            _logger.LogInformation("Fetching all notification logs.");

//            var logs = await _notificationLogsService.GetAllNotificationLogsAsync();

//            return Ok(logs);
//        }

//        // GET: api/NotificationLogs/5
//        [HttpGet("{id}")]
//        public async Task<IActionResult> GetById(int id)
//        {
//            _logger.LogInformation("Fetching notification log with ID : {Id}", id);

//            var log = await _notificationLogsService.GetNotificationLogByIdAsync(id);

//            if (log == null)
//            {
//                _logger.LogWarning("Notification Log not found.");

//                return NotFound(new
//                {
//                    Message = "Notification Log not found."
//                });
//            }

//            return Ok(log);
//        }

//        // POST: api/NotificationLogs
//        [HttpPost]
//        public async Task<IActionResult> Create([FromBody] NotificationLogsDto dto)
//        {
//            if (!ModelState.IsValid)
//                return BadRequest(ModelState);

//            var result = await _notificationLogsService.CreateNotificationLogAsync(dto);

//            return CreatedAtAction(
//                nameof(GetById),
//                new { id = result.NotificationLogId },
//                result);
//        }

//        // PUT: api/NotificationLogs/5
//        [HttpPut("{id}")]
//        public async Task<IActionResult> Update(int id, [FromBody] NotificationLogsDto dto)
//        {
//            if (!ModelState.IsValid)
//                return BadRequest(ModelState);

//            var updated = await _notificationLogsService.UpdateNotificationLogAsync(id, dto);

//            if (!updated)
//            {
//                return NotFound(new
//                {
//                    Message = "Notification Log not found."
//                });
//            }

//            return Ok(new
//            {
//                Message = "Notification Log updated successfully."
//            });
//        }

//        // DELETE: api/NotificationLogs/5
//        [HttpDelete("{id}")]
//        public async Task<IActionResult> Delete(int id)
//        {
//            var deleted = await _notificationLogsService.DeleteNotificationLogAsync(id);

//            if (!deleted)
//            {
//                return NotFound(new
//                {
//                    Message = "Notification Log not found."
//                });
//            }

//            return Ok(new
//            {
//                Message = "Notification Log deleted successfully."
//            });
//        }
//    }
//}


using CompanyPlatform.CRM.DTO.NotificationLogs;
using CompanyPlatform.CRM.Services.NotificationLogs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationLogsController
        : ControllerBase
    {
        private readonly INotificationLogsService
            _notificationLogsService;

        private readonly ILogger<NotificationLogsController>
            _logger;

        public NotificationLogsController(
            INotificationLogsService notificationLogsService,
            ILogger<NotificationLogsController> logger)
        {
            _notificationLogsService =
                notificationLogsService;

            _logger = logger;
        }

        // GET: api/NotificationLogs
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var logs =
                await _notificationLogsService
                    .GetAllNotificationLogsAsync();

            return Ok(logs);
        }

        // GET: api/NotificationLogs/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(
            int id)
        {
            var log =
                await _notificationLogsService
                    .GetNotificationLogByIdAsync(id);

            if (log == null)
            {
                return NotFound(new
                {
                    Message =
                        "Notification Log not found."
                });
            }

            return Ok(log);
        }

        // POST: api/NotificationLogs
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] NotificationLogsDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result =
                await _notificationLogsService
                    .CreateNotificationLogAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new
                {
                    id = result.NotificationLogId
                },
                result);
        }

        // PUT: api/NotificationLogs/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] NotificationLogsDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated =
                await _notificationLogsService
                    .UpdateNotificationLogAsync(
                        id,
                        dto);

            if (!updated)
            {
                return NotFound(new
                {
                    Message =
                        "Notification Log not found."
                });
            }

            return Ok(new
            {
                Message =
                    "Notification Log updated successfully."
            });
        }

        // DELETE: api/NotificationLogs/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(
            int id)
        {
            var deleted =
                await _notificationLogsService
                    .DeleteNotificationLogAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message =
                        "Notification Log not found."
                });
            }

            return Ok(new
            {
                Message =
                    "Notification Log deleted successfully."
            });
        }
    }
}