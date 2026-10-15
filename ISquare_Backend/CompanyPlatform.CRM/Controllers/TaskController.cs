using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO.Tasks;
using CompanyPlatform.CRM.Services.Tasks;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TaskController : ControllerBase
    {
        private readonly ITaskService _taskService;
        private readonly ILogger<TaskController> _logger;

        public TaskController(
            ITaskService taskService,
            ILogger<TaskController> logger)
        {
            _taskService = taskService;
            _logger = logger;
        }

        // ==========================================
        // GET : All Tasks
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Getting all Tasks");

            var result = await _taskService.GetAllTasksAsync();

            return Ok(result);
        }

        // ==========================================
        // GET : Task By Id
        // ==========================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("Getting Task : {TaskId}", id);

            var result = await _taskService.GetTaskByIdAsync(id);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        // ==========================================
        // CREATE TASK
        // ==========================================
        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Create(TaskDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _taskService.CreateTaskAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.TaskId }, result);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Create Task failed due to invalid foreign key reference.");
                return BadRequest(new { Message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Create Task failed due to invalid argument.");
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating Task.");
                return BadRequest(new { Message = ex.Message });
            }
        }

        // ==========================================
        // UPDATE TASK
        // ==========================================
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(int id, TaskDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var success = await _taskService.UpdateTaskAsync(id, dto);

                if (!success)
                    return NotFound(new { Message = $"Task with ID {id} not found." });

                return Ok(new { Message = "Task Updated Successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Update Task failed due to invalid foreign key reference.");
                return BadRequest(new { Message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Update Task failed due to invalid argument.");
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating Task.");
                return BadRequest(new { Message = ex.Message });
            }
        }

        // ==========================================
        // DELETE TASK
        // ==========================================
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _taskService.DeleteTaskAsync(id);

            if (!success)
                return NotFound(new { Message = $"Task with ID {id} not found." });

            return Ok(new { Message = "Task Deleted Successfully." });
        }

        // ==========================================
        // ASSIGN TASK
        // ==========================================
        [HttpPut("Assign/{taskId}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> AssignTask(int taskId, AssignTaskDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var success = await _taskService.AssignTaskAsync(taskId, dto);

                if (!success)
                    return NotFound(new { Message = $"Task with ID {taskId} not found." });

                return Ok(new { Message = "Task Assigned Successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Assign Task failed due to invalid reference.");
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while assigning Task.");
                return BadRequest(new { Message = ex.Message });
            }
        }

        // ==========================================
        // COMPLETE TASK
        // ==========================================
        [HttpPut("Complete/{taskId}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> CompleteTask(int taskId)
        {
            var success = await _taskService.CompleteTaskAsync(taskId);

            if (!success)
                return NotFound(new { Message = $"Task with ID {taskId} not found." });

            return Ok(new { Message = "Task Completed Successfully." });
        }

        // ==========================================
        // TASK LIST
        // ==========================================
        [HttpGet("List")]
        public async Task<IActionResult> GetTaskList()
        {
            var result = await _taskService.GetTaskListAsync();

            return Ok(result);
        }

        // ==========================================
        // TASK DETAILS
        // ==========================================
        [HttpGet("Details/{taskId}")]
        public async Task<IActionResult> GetTaskDetails(int taskId)
        {
            var result = await _taskService.GetTaskDetailsAsync(taskId);

            if (result == null)
                return NotFound();

            return Ok(result);
        }
    }
}