using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.Core.DTO;
using CompanyPlatform.Core.Services;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using CompanyPlatform.Core.DTO.Meeting;
using CompanyPlatform.CRM.Service;


namespace CompanyPlatform.Core.Controllers
{

    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ReminderController : ControllerBase
    {
        private readonly IReminderService _service;
        private readonly ILogger<ReminderController> _logger;

        public ReminderController(
            IReminderService service,
            ILogger<ReminderController> logger)
        {
            _service = service;
            _logger = logger;
        }

        // GET: api/Reminder
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Fetching all reminders.");

            var reminders = await _service.GetAllAsync();

            return Ok(reminders);
        }

        // GET: api/Reminder/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("Fetching reminder with ID : {Id}", id);

            var reminder = await _service.GetByIdAsync(id);

            if (reminder == null)
            {
                _logger.LogWarning("Reminder not found.");

                return NotFound(new
                {
                    Message = "Reminder not found."
                });
            }

            return Ok(reminder);
        }

        // POST: api/Reminder
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ReminderDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _service.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.ReminderId },
                result);
        }

        // PUT: api/Reminder/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ReminderDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _service.UpdateAsync(id, dto);

            if (!updated)
            {
                return NotFound(new
                {
                    Message = "Reminder not found."
                });
            }

            return Ok(new
            {
                Message = "Reminder updated successfully."
            });
        }

        // DELETE: api/Reminder/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message = "Reminder not found."
                });
            }

            return Ok(new
            {
                Message = "Reminder deleted successfully."
            });
        }
    }
}