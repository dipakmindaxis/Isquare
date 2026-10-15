//using CompanyPlatform.CRM.DTO;
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
//    public class NotificationQueueController : ControllerBase
//    {
//        private readonly INotificationQueueService _notificationQueueService;
//        private readonly ILogger<NotificationQueueController> _logger;

//        public NotificationQueueController(
//            INotificationQueueService notificationQueueService,
//            ILogger<NotificationQueueController> logger)
//        {
//            _notificationQueueService = notificationQueueService;
//            _logger = logger;
//        }

//        // GET: api/NotificationQueue
//        [HttpGet]
//        public async Task<IActionResult> GetAll()
//        {
//            _logger.LogInformation("Fetching all Notification Queues.");

//            var queues = await _notificationQueueService.GetAllNotificationQueuesAsync();

//            return Ok(queues);
//        }

//        // GET: api/NotificationQueue/5
//        [HttpGet("{id}")]
//        public async Task<IActionResult> GetById(int id)
//        {
//            _logger.LogInformation("Fetching Notification Queue with ID : {QueueId}", id);

//            var queue = await _notificationQueueService.GetNotificationQueueByIdAsync(id);

//            if (queue == null)
//            {
//                _logger.LogWarning("Notification Queue not found.");

//                return NotFound(new
//                {
//                    Message = "Notification Queue not found."
//                });
//            }

//            return Ok(queue);
//        }

//        // POST: api/NotificationQueue
//        [HttpPost]
//        public async Task<IActionResult> Create(CreateNotificationQueueDto dto)
//        {
//            if (!ModelState.IsValid)
//                return BadRequest(ModelState);

//            var result = await _notificationQueueService.CreateNotificationQueueAsync(dto);

//            return CreatedAtAction(nameof(GetById),
//                new { id = result.QueueId },
//                result);
//        }

//        // PUT: api/NotificationQueue/5
//        [HttpPut("{id}")]
//        public async Task<IActionResult> Update(int id, NotificationQueueDto dto)
//        {
//            if (!ModelState.IsValid)
//                return BadRequest(ModelState);

//            var updated = await _notificationQueueService.UpdateNotificationQueueAsync(id, dto);

//            if (!updated)
//            {
//                return NotFound(new
//                {
//                    Message = "Notification Queue not found."
//                });
//            }

//            return Ok(new
//            {
//                Message = "Notification Queue updated successfully."
//            });
//        }

//        // DELETE: api/NotificationQueue/5
//        [HttpDelete("{id}")]
//        public async Task<IActionResult> Delete(int id)
//        {
//            var deleted = await _notificationQueueService.DeleteNotificationQueueAsync(id);

//            if (!deleted)
//            {
//                return NotFound(new
//                {
//                    Message = "Notification Queue not found."
//                });
//            }

//            return Ok(new
//            {
//                Message = "Notification Queue deleted successfully."
//            });
//        }
//    }
//}


using CompanyPlatform.CRM.DTO;
using CompanyPlatform.CRM.Services.NotificationQueue;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationQueueController
        : ControllerBase
    {
        private readonly INotificationQueueService
            _notificationQueueService;

        private readonly ILogger<NotificationQueueController>
            _logger;

        public NotificationQueueController(
            INotificationQueueService notificationQueueService,
            ILogger<NotificationQueueController> logger)
        {
            _notificationQueueService =
                notificationQueueService;

            _logger = logger;
        }

        // GET: api/NotificationQueue
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var queues =
                await _notificationQueueService
                    .GetAllNotificationQueuesAsync();

            return Ok(queues);
        }

        // GET: api/NotificationQueue/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(
            int id)
        {
            var queue =
                await _notificationQueueService
                    .GetNotificationQueueByIdAsync(id);

            if (queue == null)
            {
                return NotFound(new
                {
                    Message =
                        "Notification Queue not found."
                });
            }

            return Ok(queue);
        }

        // POST: api/NotificationQueue
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateNotificationQueueDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result =
                await _notificationQueueService
                    .CreateNotificationQueueAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new
                {
                    id = result.QueueId
                },
                result);
        }

        // PUT: api/NotificationQueue/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] NotificationQueueDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated =
                await _notificationQueueService
                    .UpdateNotificationQueueAsync(
                        id,
                        dto);

            if (!updated)
            {
                return NotFound(new
                {
                    Message =
                        "Notification Queue not found."
                });
            }

            return Ok(new
            {
                Message =
                    "Notification Queue updated successfully."
            });
        }

        // DELETE: api/NotificationQueue/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(
            int id)
        {
            var deleted =
                await _notificationQueueService
                    .DeleteNotificationQueueAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message =
                        "Notification Queue not found."
                });
            }

            return Ok(new
            {
                Message =
                    "Notification Queue deleted successfully."
            });
        }
    }
}