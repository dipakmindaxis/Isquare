using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO.TaskReminderMapping;
using CompanyPlatform.CRM.Services.TaskReminderMapping;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TaskReminderMappingController : ControllerBase
    {
        private readonly ITaskReminderMappingService _taskReminderMappingService;
        private readonly ILogger<TaskReminderMappingController> _logger;

        public TaskReminderMappingController(
            ITaskReminderMappingService taskReminderMappingService,
            ILogger<TaskReminderMappingController> logger)
        {
            _taskReminderMappingService = taskReminderMappingService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Fetching all Task Reminder Mappings.");

            var mappings = await _taskReminderMappingService.GetAllTaskReminderMappingsAsync();

            return Ok(mappings);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("Fetching Task Reminder Mapping with ID : {MappingId}", id);

            var mapping = await _taskReminderMappingService.GetTaskReminderMappingByIdAsync(id);

            if (mapping == null)
            {
                _logger.LogWarning("Task Reminder Mapping not found.");

                return NotFound(new
                {
                    Message = "Task Reminder Mapping not found."
                });
            }

            return Ok(mapping);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Create([FromBody] CreateTaskReminderMappingDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _taskReminderMappingService.CreateTaskReminderMappingAsync(dto);

                return CreatedAtAction(nameof(GetById),
                    new { id = result.MappingId },
                    result);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(int id, [FromBody] TaskReminderMappingDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _taskReminderMappingService.UpdateTaskReminderMappingAsync(id, dto);

                if (!updated)
                {
                    return NotFound(new
                    {
                        Message = "Task Reminder Mapping not found."
                    });
                }

                return Ok(new
                {
                    Message = "Task Reminder Mapping updated successfully."
                });
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _taskReminderMappingService.DeleteTaskReminderMappingAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message = "Task Reminder Mapping not found."
                });
            }

            return Ok(new
            {
                Message = "Task Reminder Mapping deleted successfully."
            });
        }
    }
}
