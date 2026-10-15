using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO.TaskComments;
using CompanyPlatform.CRM.Services.TaskComments;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TaskCommentController : ControllerBase
    {
        private readonly ITaskCommentService _taskCommentService;
        private readonly ILogger<TaskCommentController> _logger;

        public TaskCommentController(
            ITaskCommentService taskCommentService,
            ILogger<TaskCommentController> logger)
        {
            _taskCommentService = taskCommentService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Getting all Task Comments.");

            var result = await _taskCommentService.GetAllTaskCommentsAsync();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("Getting Task Comment : {CommentId}", id);

            var result = await _taskCommentService.GetTaskCommentByIdAsync(id);

            if (result == null)
                return NotFound(new { message = $"Task Comment with ID {id} not found." });

            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Create([FromBody] TaskCommentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _taskCommentService.CreateTaskCommentAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.CommentId }, result);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(int id, [FromBody] TaskCommentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var success = await _taskCommentService.UpdateTaskCommentAsync(id, dto);

                if (!success)
                    return NotFound(new { message = $"Task Comment with ID {id} not found." });

                return Ok(new { message = "Task Comment Updated Successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _taskCommentService.DeleteTaskCommentAsync(id);

            if (!success)
                return NotFound(new { message = $"Task Comment with ID {id} not found." });

            return Ok(new { message = "Task Comment Deleted Successfully." });
        }
    }
}