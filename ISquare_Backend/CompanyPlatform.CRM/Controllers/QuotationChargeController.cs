using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Quotation;
using CompanyPlatform.CRM.Services.Quotation;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/quotation-charge")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class QuotationChargeController : ControllerBase
    {
        private readonly IQuotationChargeService _service;
        private readonly ILogger<QuotationChargeController> _logger;

        public QuotationChargeController(
            IQuotationChargeService service,
            ILogger<QuotationChargeController> logger)
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
                    message = "Quotation charge not found."
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
            [FromBody] CreateQuotationChargeDto dto)
        {
            try
            {
                var result = await _service.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = result.QuotationChargeId },
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
                _logger.LogError(ex, "Error creating quotation charge.");

                return StatusCode(500, new
                {
                    message = "An error occurred while creating the quotation charge."
                });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] CreateQuotationChargeDto dto)
        {
            try
            {
                var result = await _service.UpdateAsync(id, dto);

                if (result == null)
                    return NotFound(new
                    {
                        message = "Quotation charge not found."
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
            catch (Exception ex)
            {
                _logger.LogError(
                    ex, "Error updating quotation charge {Id}", id);

                return StatusCode(500, new
                {
                    message = "An error occurred while updating the quotation charge."
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
                    message = "Quotation charge not found."
                });

            return Ok(new
            {
                message = "Quotation charge deleted successfully."
            });
        }
    }
}