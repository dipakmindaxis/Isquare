using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.DTO;
using CompanyPlatform.Core.Services.MeetingAttachment;
using System.Threading.Tasks;
using CompanyPlatform.Core.DTO.MeetingAttachment;

namespace CompanyPlatform.Core.Controllers
{
    [Route("api/meeting-attachments")]
    [ApiController]
    [Authorize]
    public class MeetingAttachmentsController : ControllerBase
    {
        private readonly IMeetingAttachmentsService _meetingAttachmentsService;
        private readonly ILogger<MeetingAttachmentsController> _logger;

        public MeetingAttachmentsController(IMeetingAttachmentsService meetingAttachmentsService, ILogger<MeetingAttachmentsController> logger)
        {
            _meetingAttachmentsService = meetingAttachmentsService;
            _logger = logger;
        }

        /// <summary>
        /// Get all meeting attachments
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("API endpoint called: GetAll MeetingAttachments");
            var attachments = await _meetingAttachmentsService.GetAllAsync();
            return Ok(attachments);
        }

        /// <summary>
        /// Get attachment by Id
        /// </summary>
        /// <param name="attachmentId"></param>
        [HttpGet("{attachmentId}")]
        public async Task<IActionResult> GetById(int attachmentId)
        {
            _logger.LogInformation("API endpoint called: GetById for Attachment ID: {AttachmentId}", attachmentId);
            var attachment = await _meetingAttachmentsService.GetByIdAsync(attachmentId);

            if (attachment == null)
            {
                _logger.LogWarning("GetById failed. Attachment with ID {AttachmentId} not found.", attachmentId);
                return NotFound(new { message = $"Attachment with ID {attachmentId} not found." });
            }

            return Ok(attachment);
        }

        /// <summary>
        /// Get attachments by Meeting Id
        /// </summary>
        /// <param name="meetingId"></param>
        [HttpGet("meeting/{meetingId}")]
        public async Task<IActionResult> GetByMeetingId(int meetingId)
        {
            _logger.LogInformation("API endpoint called: GetByMeetingId for Meeting ID: {MeetingId}", meetingId);
            var attachments = await _meetingAttachmentsService.GetByMeetingIdAsync(meetingId);

            if (!attachments.Any())
            {
                _logger.LogWarning("No attachments found for Meeting ID: {MeetingId}", meetingId);
                return NotFound(new { message = $"No attachments found for Meeting ID {meetingId}." });
            }

            return Ok(attachments);
        }

        /// <summary>
        /// Upload multiple meeting attachments
        /// </summary>
        /// <param name="dto"></param>
        [HttpPost("upload")]
        public async Task<IActionResult> Upload([FromForm] MeetingAttachmentsUploadDto dto)
        {
            _logger.LogInformation("API endpoint called: Upload MeetingAttachments for Meeting ID: {MeetingId}", dto.MeetingId);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _meetingAttachmentsService.UploadAsync(dto);

            if (!result)
            {
                _logger.LogWarning("Upload failed for Meeting ID: {MeetingId}", dto.MeetingId);
                return BadRequest(new { message = "File upload failed." });
            }

            return Ok(new { message = "Files uploaded successfully." });
        }

        /// <summary>
        /// Update meeting attachment
        /// </summary>
        /// <param name="attachmentId"></param>
        /// <param name="dto"></param>
        [HttpPut("{attachmentId}")]
        public async Task<IActionResult> Update(int attachmentId, [FromForm] MeetingAttachmentsDto dto)
        {
            _logger.LogInformation("API endpoint called: Update Attachment for ID: {AttachmentId}", attachmentId);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            dto.AttachmentId = attachmentId;

            var result = await _meetingAttachmentsService.UpdateAsync(attachmentId, dto);

            if (!result)
            {
                _logger.LogWarning("Update failed. Attachment with ID {AttachmentId} not found.", attachmentId);
                return NotFound(new { message = $"Attachment with ID {attachmentId} not found." });
            }

            return Ok(new { message = $"Attachment with ID {attachmentId} updated successfully." });
        }

        /// <summary>
        /// Delete attachment
        /// </summary>
        /// <param name="attachmentId"></param>
        [HttpDelete("{attachmentId}")]
        public async Task<IActionResult> Delete(int attachmentId)
        {
            _logger.LogInformation("API endpoint called: Delete Attachment for ID: {AttachmentId}", attachmentId);
            var result = await _meetingAttachmentsService.DeleteAsync(attachmentId);

            if (!result)
            {
                _logger.LogWarning("Delete failed. Attachment with ID {AttachmentId} not found.", attachmentId);
                return NotFound(new { message = $"Attachment with ID {attachmentId} not found." });
            }

            return Ok(new { message = $"Attachment with ID {attachmentId} has been deleted." });
        }
    }
}