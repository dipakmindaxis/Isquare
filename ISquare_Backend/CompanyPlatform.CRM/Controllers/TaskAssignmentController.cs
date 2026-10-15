using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.TaskAssignment;
using CompanyPlatform.CRM.Services.TaskAssignment;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TaskAssignmentController : ControllerBase
    {
        private readonly ITaskAssignmentService _taskAssignmentService;
        private readonly ILogger<TaskAssignmentController> _logger;

        public TaskAssignmentController(ITaskAssignmentService taskAssignmentService, ILogger<TaskAssignmentController> logger)
        {
            _taskAssignmentService = taskAssignmentService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("API endpoint called: GetAll Task Assignments");
            var assignments = await _taskAssignmentService.GetAllTaskAssignmentsAsync();
            return Ok(assignments);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("API endpoint called: GetById for Task Assignment ID: {AssignmentId}", id);
            var assignment = await _taskAssignmentService.GetTaskAssignmentByIdAsync(id);

            if (assignment == null)
            {
                _logger.LogWarning("GetById failed. Task assignment with ID {AssignmentId} not found or is inactive.", id);
                return NotFound(new { message = $"Task assignment with ID {id} not found or is inactive." });
            }

            return Ok(assignment);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Create([FromBody] TaskAssignmentDto taskAssignmentDto)
        {
            _logger.LogInformation("API endpoint called: Create Task Assignment");
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var createdAssignment = await _taskAssignmentService.CreateTaskAssignmentAsync(taskAssignmentDto);
                return CreatedAtAction(nameof(GetById), new { id = createdAssignment.AssignmentId }, createdAssignment);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Create Task Assignment failed due to missing reference.");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Create Task Assignment failed.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(int id, [FromBody] TaskAssignmentDto taskAssignmentDto)
        {
            _logger.LogInformation("API endpoint called: Update Task Assignment for ID: {AssignmentId}", id);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _taskAssignmentService.UpdateTaskAssignmentAsync(id, taskAssignmentDto);
                if (!result)
                {
                    _logger.LogWarning("Update failed. Task assignment with ID {AssignmentId} not found or is inactive.", id);
                    return NotFound(new { message = $"Task assignment with ID {id} not found or is inactive." });
                }

                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Update Task Assignment failed due to missing reference.");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Update Task Assignment failed.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation("API endpoint called: Delete Task Assignment for ID: {AssignmentId}", id);
            var result = await _taskAssignmentService.DeleteTaskAssignmentAsync(id);

            if (!result)
            {
                _logger.LogWarning("Delete failed. Task assignment with ID {AssignmentId} not found.", id);
                return NotFound(new { message = $"Task assignment with ID {id} not found." });
            }

            return Ok(new { message = $"Task assignment with ID {id} has been deactivated." });
        }
    }
}
