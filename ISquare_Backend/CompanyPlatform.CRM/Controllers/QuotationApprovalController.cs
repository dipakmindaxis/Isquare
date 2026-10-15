using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Quotation;
using CompanyPlatform.CRM.Services.Quotation;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/quotation-approval")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class QuotationApprovalController : ControllerBase
    {
        private readonly IQuotationApprovalService _service;
        private readonly ILogger<QuotationApprovalController> _logger;

        public QuotationApprovalController(
            IQuotationApprovalService service,
            ILogger<QuotationApprovalController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);

            if (result == null)
                return NotFound(new
                {
                    message = "Quotation approval not found."
                });

            return Ok(result);
        }

        [HttpGet("quotation/{quotationId:int}")]
        public async Task<IActionResult> GetByQuotationId(int quotationId)
        {
            var result =
                await _service.GetByQuotationIdAsync(quotationId);

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateQuotationApprovalDto dto)
        {
            try
            {
                var userId =
                    User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.Identity?.Name;

                var result =
                    await _service.CreateAsync(dto, userId);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = result.QuotationApprovalId },
                    result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error creating quotation approval.");

                return StatusCode(500, new
                {
                    message = "An error occurred while creating the approval."
                });
            }
        }

        [HttpPut("{id:int}/decision")]
        public async Task<IActionResult> Decide(
            int id,
            [FromBody] DecideQuotationApprovalDto dto)
        {
            try
            {
                var userId =
                    User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.Identity?.Name;

                var result =
                    await _service.DecideAsync(id, dto, userId);

                if (result == null)
                    return NotFound(new
                    {
                        message = "Quotation approval not found."
                    });

                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error processing quotation approval {Id}",
                    id);

                return StatusCode(500, new
                {
                    message = "An error occurred while processing the decision."
                });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
                return NotFound(new
                {
                    message = "Quotation approval not found."
                });

            return Ok(new
            {
                message = "Quotation approval deleted successfully."
            });
        }
    }
}