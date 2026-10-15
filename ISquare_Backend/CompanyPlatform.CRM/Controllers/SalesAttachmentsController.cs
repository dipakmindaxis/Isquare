using CompanyPlatform.CRM.DTO.SalesAttachment;
using CompanyPlatform.CRM.Services.SalesAttachment;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SalesAttachmentsController : ControllerBase
    {
        private readonly ISalesAttachmentService _service;
        private readonly ILogger<SalesAttachmentsController> _logger;

        public SalesAttachmentsController(
            ISalesAttachmentService service,
            ILogger<SalesAttachmentsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSalesAttachments()
        {
            var attachments =
                await _service.GetAllSalesAttachmentsAsync();

            return Ok(attachments);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetSalesAttachmentById(int id)
        {
            var attachment =
                await _service.GetSalesAttachmentByIdAsync(id);

            if (attachment == null)
            {
                return NotFound(new
                {
                    message = $"Sales attachment with ID {id} not found."
                });
            }

            return Ok(attachment);
        }

        [HttpPost("upload")]
        [Authorize(Roles = "Admin,HR,Sales Executive,Sales Manager")]
        [RequestSizeLimit(11 * 1024 * 1024)]
        public async Task<IActionResult> UploadSalesAttachment(
            [FromForm] SalesAttachmentUploadDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                int? uploadedBy = null;

                var userIdValue = User.FindFirst("UserId")?.Value;

                if (int.TryParse(userIdValue, out int userId))
                {
                    uploadedBy = userId;
                }

                var result =
                    await _service.UploadSalesAttachmentAsync(
                        dto,
                        uploadedBy);

                return CreatedAtAction(
                    nameof(GetSalesAttachmentById),
                    new { id = result.SalesAttachmentId },
                    result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error uploading sales attachment.");

                return StatusCode(
                    500,
                    new { message = "Unable to upload attachment." });
            }
        }

        [HttpGet("{id:int}/download")]
        public async Task<IActionResult> DownloadSalesAttachment(int id)
        {
            var result =
                await _service.DownloadSalesAttachmentAsync(id);

            if (result == null)
            {
                return NotFound(new
                {
                    message = "Attachment or its file was not found."
                });
            }

            return File(
                result.Value.Stream,
                result.Value.ContentType,
                Path.GetFileName(result.Value.FileName));
        }

        [HttpGet("{id:int}/view")]
        public async Task<IActionResult> ViewSalesAttachment(int id)
        {
            var result =
                await _service.DownloadSalesAttachmentAsync(id);

            if (result == null)
            {
                return NotFound(new
                {
                    message = "Attachment or its file was not found."
                });
            }

            var inlineTypes = new[]
            {
                "application/pdf",
                "image/jpeg",
                "image/png"
            };

            if (!inlineTypes.Contains(
                result.Value.ContentType,
                StringComparer.OrdinalIgnoreCase))
            {
                result.Value.Stream.Dispose();

                return BadRequest(new
                {
                    message = "Preview is supported only for PDF and images."
                });
            }

            Response.Headers["Content-Disposition"] =
                $"inline; filename=\"{Path.GetFileName(result.Value.FileName)}\"";

            return File(
                result.Value.Stream,
                result.Value.ContentType);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin,Sales Manager")]
        public async Task<IActionResult> DeleteSalesAttachment(int id)
        {
            var result =
                await _service.DeleteSalesAttachmentAsync(id);

            if (!result)
            {
                return NotFound(new
                {
                    message = $"Sales attachment with ID {id} not found."
                });
            }

            return Ok(new
            {
                message = "Sales attachment deactivated successfully."
            });
        }
    }
}