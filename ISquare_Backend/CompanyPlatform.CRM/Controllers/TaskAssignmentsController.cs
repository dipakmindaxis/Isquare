using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO.TaskAssignments;
using CompanyPlatform.CRM.Services.TaskAssignments;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TaskAssignmentsController : ControllerBase
    {
        private readonly ITaskAssignmentsService _taskAssignmentsService;
        private readonly ILogger<TaskAssignmentsController> _logger;

        public TaskAssignmentsController(
            ITaskAssignmentsService taskAssignmentsService,
            ILogger<TaskAssignmentsController> logger)
        {
            _taskAssignmentsService = taskAssignmentsService;
            _logger = logger;
        }

        // ==========================================
        // GET : All Task Assignments
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Getting all Task Assignments.");

            var result = await _taskAssignmentsService.GetAllAssignmentsAsync();

            return Ok(result);
        }

        // ==========================================
        // GET : Task Assignment By Id
        // ==========================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("Getting Task Assignment : {AssignmentId}", id);

            var result = await _taskAssignmentsService.GetAssignmentByIdAsync(id);

            if (result == null)
                return NotFound(new { Message = "Task Assignment not found." });

            return Ok(result);
        }

        // ==========================================
        // CREATE Task Assignment
        // ==========================================
        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Create([FromBody] TaskAssignmentsDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _taskAssignmentsService.CreateAssignmentAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.AssignmentId }, result);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Create Task Assignment failed due to missing reference.");
                return BadRequest(new { Message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Create Task Assignment failed due to invalid argument.");
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Create Task Assignment failed.");
                return BadRequest(new { Message = ex.Message });
            }
        }

        // ==========================================
        // UPDATE Task Assignment
        // ==========================================
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(int id, [FromBody] TaskAssignmentsDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var success = await _taskAssignmentsService.UpdateAssignmentAsync(id, dto);

                if (!success)
                    return NotFound(new { Message = $"Task Assignment with ID {id} not found." });

                return Ok(new { Message = "Task Assignment updated successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Update Task Assignment failed due to missing reference.");
                return BadRequest(new { Message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Update Task Assignment failed due to invalid argument.");
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Update Task Assignment failed.");
                return BadRequest(new { Message = ex.Message });
            }
        }

        // ==========================================
        // DELETE Task Assignment
        // ==========================================
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _taskAssignmentsService.DeleteAssignmentAsync(id);

            if (!success)
                return NotFound(new { Message = "Task Assignment not found." });

            return Ok(new { Message = "Task Assignment deleted successfully." });
        }

        // ==========================================
        // ASSIGN TASK
        // POST api/TaskAssignments/Assign
        // ==========================================
        [HttpPost("Assign")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> AssignTask([FromBody] AssignTaskRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _taskAssignmentsService.AssignTaskAsync(dto);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "AssignTask failed.");
                return BadRequest(new { Message = ex.Message });
            }
        }

        // ==========================================
        // REASSIGN TASK
        // PUT api/TaskAssignments/Reassign/{taskId}
        // ==========================================
        [HttpPut("Reassign/{taskId}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> ReassignTask(int taskId, [FromBody] ReassignTaskRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _taskAssignmentsService.ReassignTaskAsync(taskId, dto);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "ReassignTask failed for TaskId: {TaskId}", taskId);
                return BadRequest(new { Message = ex.Message });
            }
        }

        // ==========================================
        // UPLOAD ATTACHMENT
        // POST api/TaskAssignments/UploadAttachment
        // ==========================================
        [HttpPost("UploadAttachment")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadAttachment([FromForm] UploadTaskAssignmentAttachmentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _taskAssignmentsService.UploadAttachmentAsync(dto);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "UploadAttachment failed for TaskId: {TaskId}", dto.TaskId);
                return BadRequest(new { Message = ex.Message });
            }
        }

        // ==========================================
        // TASK TIMELINE
        // GET api/TaskAssignments/Timeline/{taskId}
        // ==========================================
        [HttpGet("Timeline/{taskId}")]
        public async Task<IActionResult> GetTaskTimeline(int taskId)
        {
            _logger.LogInformation("Getting Task Timeline for TaskId: {TaskId}", taskId);

            var result = await _taskAssignmentsService.GetTaskTimelineAsync(taskId);

            return Ok(result);
        }
    }
}
