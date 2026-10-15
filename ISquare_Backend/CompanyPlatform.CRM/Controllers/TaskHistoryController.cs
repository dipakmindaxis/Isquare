using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO.TaskHistory;
using CompanyPlatform.CRM.Services.TaskHistory;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TaskHistoryController : ControllerBase
    {
        private readonly ITaskHistoryService _taskHistoryService;
        private readonly ILogger<TaskHistoryController> _logger;

        public TaskHistoryController(
            ITaskHistoryService taskHistoryService,
            ILogger<TaskHistoryController> logger)
        {
            _taskHistoryService = taskHistoryService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Fetching all Task Histories.");

            var histories = await _taskHistoryService.GetAllTaskHistoriesAsync();

            return Ok(histories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("Fetching Task History with ID : {HistoryId}", id);

            var history = await _taskHistoryService.GetTaskHistoryByIdAsync(id);

            if (history == null)
            {
                _logger.LogWarning("Task History not found.");

                return NotFound(new
                {
                    Message = "Task History not found."
                });
            }

            return Ok(history);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Create([FromBody] CreateTaskHistoryDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _taskHistoryService.CreateTaskHistoryAsync(dto);

                return CreatedAtAction(nameof(GetById),
                    new { id = result.HistoryId },
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
        public async Task<IActionResult> Update(int id, [FromBody] TaskHistoryDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _taskHistoryService.UpdateTaskHistoryAsync(id, dto);

                if (!updated)
                {
                    return NotFound(new
                    {
                        Message = "Task History not found."
                    });
                }

                return Ok(new
                {
                    Message = "Task History updated successfully."
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
            var deleted = await _taskHistoryService.DeleteTaskHistoryAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message = "Task History not found."
                });
            }

            return Ok(new
            {
                Message = "Task History deleted successfully."
            });
        }
    }
}
