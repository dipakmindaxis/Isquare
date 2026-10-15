using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO.TaskAttachment;
using CompanyPlatform.CRM.Services.TaskAttachment;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TaskAttachmentController : ControllerBase
    {
        private readonly ITaskAttachmentService _taskAttachmentService;
        private readonly ILogger<TaskAttachmentController> _logger;

        public TaskAttachmentController(
            ITaskAttachmentService taskAttachmentService,
            ILogger<TaskAttachmentController> logger)
        {
            _taskAttachmentService = taskAttachmentService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Fetching all Task Attachments.");

            var attachments = await _taskAttachmentService.GetAllTaskAttachmentsAsync();

            return Ok(attachments);
        }

        [HttpGet("ByTask/{taskId}")]
        public async Task<IActionResult> GetByTaskId(int taskId)
        {
            _logger.LogInformation("Fetching Task Attachments for TaskId: {TaskId}", taskId);

            var attachments = await _taskAttachmentService.GetAttachmentsByTaskIdAsync(taskId);

            return Ok(attachments);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("Fetching Task Attachment with ID : {AttachmentId}", id);

            var attachment = await _taskAttachmentService.GetTaskAttachmentByIdAsync(id);

            if (attachment == null)
            {
                _logger.LogWarning("Task Attachment not found.");

                return NotFound(new
                {
                    Message = "Task Attachment not found."
                });
            }

            return Ok(attachment);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] CreateTaskAttachmentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _taskAttachmentService.CreateTaskAttachmentAsync(dto);

                return CreatedAtAction(nameof(GetById),
                    new { id = result.AttachmentId },
                    result);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Create Task Attachment failed due to missing reference.");
                return BadRequest(new { Message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Create Task Attachment failed due to invalid argument.");
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Create Task Attachment failed.");
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(int id, [FromForm] TaskAttachmentDto taskAttachmentDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _taskAttachmentService.UpdateTaskAttachmentAsync(id, taskAttachmentDto);

                if (!updated)
                {
                    return NotFound(new
                    {
                        Message = $"Task Attachment with ID {id} not found."
                    });
                }

                return Ok(new
                {
                    Message = "Task Attachment updated successfully."
                });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Update Task Attachment failed due to missing reference.");
                return BadRequest(new { Message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Update Task Attachment failed due to invalid argument.");
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Update Task Attachment failed.");
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _taskAttachmentService.DeleteTaskAttachmentAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message = "Task Attachment not found."
                });
            }

            return Ok(new
            {
                Message = "Task Attachment deleted successfully."
            });
        }
    }
}
