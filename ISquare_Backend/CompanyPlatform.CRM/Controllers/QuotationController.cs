using CompanyPlatform.CRM.DTO.Quotation;
using CompanyPlatform.CRM.Services.Quotation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/quotation")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class QuotationController : ControllerBase
    {
        private readonly IQuotationService _quotationService;
        private readonly ILogger<QuotationController> _logger;

        public QuotationController(
            IQuotationService quotationService,
            ILogger<QuotationController> logger)
        {
            _quotationService = quotationService;
            _logger = logger;
        }

        // GET: api/quotation
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var quotations =
                await _quotationService.GetAllQuotationsAsync();

            return Ok(quotations);
        }

        // GET: api/quotation/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var quotation =
                await _quotationService.GetQuotationByIdAsync(id);

            if (quotation == null)
            {
                return NotFound(new
                {
                    Message = "Quotation not found."
                });
            }

            return Ok(quotation);
        }

        // POST: api/quotation
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] QuotationDto quotationDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdQuotation =
                await _quotationService.CreateQuotationAsync(
                    quotationDto);

            return Ok(createdQuotation);
        }

        // PUT: api/quotation/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id, [FromBody] QuotationDto quotationDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated =
                    await _quotationService.UpdateQuotationAsync(
                        id, quotationDto);

                if (!updated)
                {
                    return NotFound(new
                    {
                        Message = "Quotation not found."
                    });
                }

                return Ok(new
                {
                    Message = "Quotation updated successfully."
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // PATCH: api/quotation/1/status
        // PUT: api/quotation/1/status
        [HttpPatch("{id:int}/status")]
        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(
            int id, [FromBody] UpdateQuotationStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _quotationService.UpdateStatusAsync(id, dto.Status);

                if (result == null)
                {
                    return NotFound(new
                    {
                        Message = "Quotation not found."
                    });
                }

                return Ok(new
                {
                    Message = "Quotation status updated successfully.",
                    Data = result
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating status for quotation {Id}", id);
                return StatusCode(500, new
                {
                    Message = "An error occurred while updating the quotation status."
                });
            }
        }

        // DELETE: api/quotation/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted =
                await _quotationService.DeleteQuotationAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message = "Quotation not found."
                });
            }

            return Ok(new
            {
                Message = "Quotation deleted successfully."
            });
        }
    }
}