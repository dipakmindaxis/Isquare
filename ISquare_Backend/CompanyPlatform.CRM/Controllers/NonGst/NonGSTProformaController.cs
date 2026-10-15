using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.NonGSTProforma;
using CompanyPlatform.CRM.Services.NonGSTProforma;

namespace CompanyPlatform.CRM.Controllers.NonGst
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NonGSTProformaController : ControllerBase
    {
        private readonly INonGSTProformaService _service;
        private readonly ILogger<NonGSTProformaController> _logger;

        public NonGSTProformaController(
            INonGSTProformaService service,
            ILogger<NonGSTProformaController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NonGSTProformaDto>>> GetAll()
        {
            _logger.LogInformation("API endpoint called: GetAll Non-GST Proformas");
            var result = await _service.GetAllNonGSTProformasAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NonGSTProformaDto>> GetById(int id)
        {
            _logger.LogInformation("API endpoint called: GetById for Non-GST Proforma ID: {Id}", id);
            var result = await _service.GetNonGSTProformaByIdAsync(id);

            if (result == null)
            {
                _logger.LogWarning("GetById failed. Non-GST Proforma with ID {Id} not found or is deleted.", id);
                return NotFound(new { message = $"Non-GST Proforma with ID {id} not found or is deleted." });
            }

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateNonGSTProformaDto dto)
        {
            _logger.LogInformation("API endpoint called: Create Non-GST Proforma");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _service.CreateNonGSTProformaAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.NonGSTProformaId }, new
                {
                    message = "Non-GST Proforma created successfully.",
                    data = result
                });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Create Non-GST Proforma failed due to invalid arguments.");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating Non-GST Proforma.");
                return StatusCode(500, new { message = "An error occurred while creating the Non-GST Proforma.", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateNonGSTProformaDto dto)
        {
            _logger.LogInformation("API endpoint called: Update Non-GST Proforma for ID: {Id}", id);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != dto.NonGSTProformaId)
            {
                return BadRequest(new { message = "ID in route does not match ID in request body." });
            }

            try
            {
                var updated = await _service.UpdateNonGSTProformaAsync(id, dto);

                if (!updated)
                {
                    _logger.LogWarning("Update failed. Non-GST Proforma with ID {Id} not found.", id);
                    return NotFound(new { message = $"Non-GST Proforma with ID {id} not found." });
                }

                return Ok(new { message = "Non-GST Proforma updated successfully." });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Update Non-GST Proforma failed due to invalid arguments.");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating Non-GST Proforma ID: {Id}", id);
                return StatusCode(500, new { message = "An error occurred while updating the Non-GST Proforma.", error = ex.Message });
            }
        }

        [AllowAnonymous]
        [HttpPost("public-response")]
        public async Task<IActionResult> PublicResponse([FromBody] PublicNonGSTProformaResponseDto responseDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var status = responseDto.Status.Trim();
            if (!string.Equals(status, "Accepted", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(status, "Rejected", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Status must be Accepted or Rejected." });
            }

            var proforma = await _service.UpdatePublicResponseAsync(responseDto.ProformaNo, status);
            if (proforma == null)
            {
                return NotFound(new { message = "Non-GST Proforma was not found." });
            }

            return Ok(proforma);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation("API endpoint called: Delete Non-GST Proforma for ID: {Id}", id);

            var deleted = await _service.DeleteNonGSTProformaAsync(id);

            if (!deleted)
            {
                _logger.LogWarning("Delete failed. Non-GST Proforma with ID {Id} not found.", id);
                return NotFound(new { message = $"Non-GST Proforma with ID {id} not found." });
            }

            return Ok(new { message = $"Non-GST Proforma with ID {id} has been deactivated/deleted successfully." });
        }
    }
}
