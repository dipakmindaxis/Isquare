using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.CRM.Services;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using CompanyPlatform.CRM.DTO.Meeting;
using CompanyPlatform.CRM.VisitAttachment;

namespace CompanyPlatform.CRM.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class VisitAttachmentController : ControllerBase
    {
        private readonly IVisitAttachmentService _visitAttachmentService;
        private readonly ILogger<VisitAttachmentController> _logger;

        public VisitAttachmentController(
            IVisitAttachmentService visitAttachmentService,
            ILogger<VisitAttachmentController> logger)
        {
            _visitAttachmentService = visitAttachmentService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Fetching all Visit Attachments.");

            var attachments = await _visitAttachmentService.GetAllVisitAttachmentsAsync();

            return Ok(attachments);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("Fetching Visit Attachment with ID : {AttachmentId}", id);

            var attachment = await _visitAttachmentService.GetVisitAttachmentByIdAsync(id);

            if (attachment == null)
            {
                _logger.LogWarning("Visit Attachment not found.");

                return NotFound(new
                {
                    Message = "Visit Attachment not found."
                });
            }

            return Ok(attachment);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] CreateVisitAttachmentDto dto)
        {
            var result = await _visitAttachmentService.CreateVisitAttachmentAsync(dto);

            return CreatedAtAction(nameof(GetById),
                new { id = result.AttachmentId },
                result);
        }

        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(int id, [FromForm] VisitAttachmentDto visitAttachmentDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _visitAttachmentService.UpdateVisitAttachmentAsync(id, visitAttachmentDto);

            if (!updated)
            {
                return NotFound(new
                {
                    Message = "Visit Attachment not found."
                });
            }

            return Ok(new
            {
                Message = "Visit Attachment updated successfully."
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _visitAttachmentService.DeleteVisitAttachmentAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message = "Visit Attachment not found."
                });
            }

            return Ok(new
            {
                Message = "Visit Attachment deleted successfully."
            });
        }
    }
}