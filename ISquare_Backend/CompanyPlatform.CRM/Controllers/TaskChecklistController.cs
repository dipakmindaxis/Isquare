using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO.TaskChecklists;
using CompanyPlatform.CRM.Services.TaskChecklists;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TaskChecklistController : ControllerBase
    {
        private readonly ITaskChecklistService _taskChecklistService;
        private readonly ILogger<TaskChecklistController> _logger;

        public TaskChecklistController(
            ITaskChecklistService taskChecklistService,
            ILogger<TaskChecklistController> logger)
        {
            _taskChecklistService = taskChecklistService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Getting all Task Checklists.");

            var result = await _taskChecklistService.GetAllTaskChecklistsAsync();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("Getting Task Checklist : {ChecklistId}", id);

            var result = await _taskChecklistService.GetTaskChecklistByIdAsync(id);

            if (result == null)
                return NotFound(new { Message = $"Task Checklist with ID {id} not found." });

            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Create(TaskChecklistDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _taskChecklistService.CreateTaskChecklistAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.ChecklistId }, result);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Create Task Checklist failed due to missing reference.");
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Create Task Checklist failed.");
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(int id, TaskChecklistDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var success = await _taskChecklistService.UpdateTaskChecklistAsync(id, dto);

                if (!success)
                    return NotFound(new { Message = $"Task Checklist with ID {id} not found." });

                return Ok(new { Message = "Task Checklist Updated Successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Update Task Checklist failed due to missing reference.");
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Update Task Checklist failed.");
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _taskChecklistService.DeleteTaskChecklistAsync(id);

            if (!success)
                return NotFound(new { Message = $"Task Checklist with ID {id} not found." });

            return Ok(new { Message = "Task Checklist Deleted Successfully." });
        }
    }
}