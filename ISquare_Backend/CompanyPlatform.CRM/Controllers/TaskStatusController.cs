using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.TaskStatus;
using CompanyPlatform.CRM.Services.TaskStatus;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TaskStatusController : ControllerBase
    {
        private readonly ITaskStatusService _taskStatusService;
        private readonly ILogger<TaskStatusController> _logger;

        public TaskStatusController(
            ITaskStatusService taskStatusService,
            ILogger<TaskStatusController> logger)
        {
            _taskStatusService = taskStatusService;
            _logger = logger;
        }

        // 1. GET ALL
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation(
                "API endpoint called: GetAll Task Statuses");

            var taskStatuses =
                await _taskStatusService.GetAllTaskStatusesAsync();

            return Ok(taskStatuses);
        }

        // 2. CREATE
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] TaskStatusDto taskStatusDto)
        {
            _logger.LogInformation(
                "API endpoint called: Create Task Status");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdTaskStatus =
                await _taskStatusService.CreateTaskStatusAsync(
                    taskStatusDto);

            return Ok(createdTaskStatus);
        }

        // 3. UPDATE
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] TaskStatusDto taskStatusDto)
        {
            _logger.LogInformation(
                "API endpoint called: Update Task Status for ID: {TaskStatusId}",
                id);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result =
                await _taskStatusService.UpdateTaskStatusAsync(
                    id,
                    taskStatusDto);

            if (!result)
            {
                _logger.LogWarning(
                    "Update failed. Task Status with ID {TaskStatusId} not found or is deleted.",
                    id);

                return NotFound(new
                {
                    message =
                        $"Task Status with ID {id} not found or is deleted."
                });
            }

            return Ok(new
            {
                message = "Task Status updated successfully."
            });
        }

        // 4. DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation(
                "API endpoint called: Delete Task Status for ID: {TaskStatusId}",
                id);

            var result =
                await _taskStatusService.DeleteTaskStatusAsync(id);

            if (!result)
            {
                _logger.LogWarning(
                    "Delete failed. Task Status with ID {TaskStatusId} not found or already deleted.",
                    id);

                return NotFound(new
                {
                    message =
                        $"Task Status with ID {id} not found or already deleted."
                });
            }

            return Ok(new
            {
                message =
                    $"Task Status with ID {id} has been deleted."
            });
        }
    }
}