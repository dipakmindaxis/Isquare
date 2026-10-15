using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.NonGSTInvoice;
using CompanyPlatform.CRM.Services.NonGSTInvoice;

namespace CompanyPlatform.CRM.Controllers.NonGst

{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NonGSTInvoiceController : ControllerBase
    {
        private readonly INonGSTInvoiceService _service;
        private readonly ILogger<NonGSTInvoiceController> _logger;

        public NonGSTInvoiceController(
            INonGSTInvoiceService service,
            ILogger<NonGSTInvoiceController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NonGSTInvoiceDto>>> GetAll()
        {
            _logger.LogInformation("API endpoint called: GetAll Non-GST Invoices");
            var result = await _service.GetAllNonGSTInvoicesAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NonGSTInvoiceDto>> GetById(int id)
        {
            _logger.LogInformation("API endpoint called: GetById for Non-GST Invoice ID: {Id}", id);
            var result = await _service.GetNonGSTInvoiceByIdAsync(id);

            if (result == null)
            {
                _logger.LogWarning("GetById failed. Non-GST Invoice with ID {Id} not found or is deleted.", id);
                return NotFound(new { message = $"Non-GST Invoice with ID {id} not found or is deleted." });
            }

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateNonGSTInvoiceDto dto)
        {
            _logger.LogInformation("API endpoint called: Create Non-GST Invoice");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _service.CreateNonGSTInvoiceAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.NonGSTInvoiceId }, new
                {
                    message = "Non-GST Invoice created successfully.",
                    data = result
                });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Create Non-GST Invoice failed due to invalid arguments.");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating Non-GST Invoice.");
                return StatusCode(500, new { message = "An error occurred while creating the Non-GST Invoice.", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateNonGSTInvoiceDto dto)
        {
            _logger.LogInformation("API endpoint called: Update Non-GST Invoice for ID: {Id}", id);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != dto.NonGSTInvoiceId)
            {
                return BadRequest(new { message = "ID in route does not match ID in request body." });
            }

            try
            {
                var updated = await _service.UpdateNonGSTInvoiceAsync(id, dto);

                if (!updated)
                {
                    _logger.LogWarning("Update failed. Non-GST Invoice with ID {Id} not found.", id);
                    return NotFound(new { message = $"Non-GST Invoice with ID {id} not found." });
                }

                return Ok(new { message = "Non-GST Invoice updated successfully." });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Update Non-GST Invoice failed due to invalid arguments.");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating Non-GST Invoice ID: {Id}", id);
                return StatusCode(500, new { message = "An error occurred while updating the Non-GST Invoice.", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation("API endpoint called: Delete Non-GST Invoice for ID: {Id}", id);

            var deleted = await _service.DeleteNonGSTInvoiceAsync(id);

            if (!deleted)
            {
                _logger.LogWarning("Delete failed. Non-GST Invoice with ID {Id} not found.", id);
                return NotFound(new { message = $"Non-GST Invoice with ID {id} not found." });
            }

            return Ok(new { message = $"Non-GST Invoice with ID {id} has been deactivated/deleted successfully." });
        }
    }
}
