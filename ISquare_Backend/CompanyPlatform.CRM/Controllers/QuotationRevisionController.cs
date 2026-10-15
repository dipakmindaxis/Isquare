using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Quotation;
using CompanyPlatform.CRM.Services.Quotation;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/quotation-revision")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class QuotationRevisionController : ControllerBase
    {
        private readonly IQuotationRevisionService _service;
        private readonly ILogger<QuotationRevisionController> _logger;

        public QuotationRevisionController(
            IQuotationRevisionService service,
            ILogger<QuotationRevisionController> logger)
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
                    message = "Quotation revision not found."
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
            [FromBody] CreateQuotationRevisionDto dto)
        {
            try
            {
                var userId =
                    User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.Identity?.Name;

                var result = await _service.CreateAsync(dto, userId);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = result.QuotationRevisionId },
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
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error creating quotation revision.");

                return StatusCode(500, new
                {
                    message = "An error occurred while creating the quotation revision."
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
                    message = "Quotation revision not found."
                });

            return Ok(new
            {
                message = "Quotation revision deleted successfully."
            });
        }
    }
}