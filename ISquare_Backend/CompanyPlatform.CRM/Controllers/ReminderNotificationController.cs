using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.Core.Services;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using CompanyPlatform.Core.DTO.Meeting;

namespace CompanyPlatform.Core.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ReminderNotificationController : ControllerBase
    {
        private readonly IReminderNotificationService _reminderNotificationService;
        private readonly ILogger<ReminderNotificationController> _logger;

        public ReminderNotificationController(
            IReminderNotificationService reminderNotificationService,
            ILogger<ReminderNotificationController> logger)
        {
            _reminderNotificationService = reminderNotificationService;
            _logger = logger;
        }

        // GET: api/ReminderNotification
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Fetching all reminder notifications.");

            var notifications = await _reminderNotificationService.GetAllReminderNotificationsAsync();

            return Ok(notifications);
        }

        // GET: api/ReminderNotification/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("Fetching reminder notification with ID : {Id}", id);

            var notification = await _reminderNotificationService.GetReminderNotificationByIdAsync(id);

            if (notification == null)
            {
                _logger.LogWarning("Reminder notification not found.");

                return NotFound(new
                {
                    Message = "Reminder Notification not found."
                });
            }

            return Ok(notification);
        }

        // POST: api/ReminderNotification
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ReminderNotificationDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _reminderNotificationService.CreateReminderNotificationAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.ReminderNotificationId },
                result);
        }

        // PUT: api/ReminderNotification/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ReminderNotificationDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _reminderNotificationService.UpdateReminderNotificationAsync(id, dto);

            if (!updated)
            {
                return NotFound(new
                {
                    Message = "Reminder Notification not found."
                });
            }

            return Ok(new
            {
                Message = "Reminder Notification updated successfully."
            });
        }

        // DELETE: api/ReminderNotification/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _reminderNotificationService.DeleteReminderNotificationAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message = "Reminder Notification not found."
                });
            }

            return Ok(new
            {
                Message = "Reminder Notification deleted successfully."
            });
        }
    }
}