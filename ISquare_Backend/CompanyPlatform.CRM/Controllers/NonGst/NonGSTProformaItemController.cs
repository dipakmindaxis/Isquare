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
    public class NonGSTProformaItemController : ControllerBase
    {
        private readonly INonGSTProformaItemService _service;
        private readonly ILogger<NonGSTProformaItemController> _logger;

        public NonGSTProformaItemController(
            INonGSTProformaItemService service,
            ILogger<NonGSTProformaItemController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NonGSTProformaItemDto>>> GetAll()
        {
            _logger.LogInformation("API endpoint called: GetAll Non-GST Proforma line items");
            var items = await _service.GetAllNonGSTProformaItemsAsync();
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NonGSTProformaItemDto>> GetById(int id)
        {
            _logger.LogInformation("API endpoint called: GetById for Non-GST Proforma line item ID: {Id}", id);
            var item = await _service.GetNonGSTProformaItemByIdAsync(id);

            if (item == null)
            {
                _logger.LogWarning("GetById failed. Non-GST Proforma line item with ID {Id} not found.", id);
                return NotFound(new { message = $"Non-GST Proforma line item with ID {id} not found." });
            }

            return Ok(item);
        }

        [HttpGet("proforma/{proformaId}")]
        public async Task<ActionResult<IEnumerable<NonGSTProformaItemDto>>> GetByProformaId(int proformaId)
        {
            _logger.LogInformation("API endpoint called: GetByProformaId for Proforma ID: {ProformaId}", proformaId);
            var items = await _service.GetItemsByProformaIdAsync(proformaId);
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] NonGSTProformaItemDto dto)
        {
            _logger.LogInformation("API endpoint called: Create Non-GST Proforma line item");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var createdItem = await _service.CreateNonGSTProformaItemAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = createdItem.NonGSTProformaItemId }, new
                {
                    message = "Non-GST Proforma line item created successfully.",
                    data = createdItem
                });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Create line item failed due to invalid arguments.");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating Non-GST Proforma line item.");
                return StatusCode(500, new { message = "An error occurred while creating the line item.", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] NonGSTProformaItemDto dto)
        {
            _logger.LogInformation("API endpoint called: Update Non-GST Proforma line item for ID: {Id}", id);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != dto.NonGSTProformaItemId)
            {
                return BadRequest(new { message = "ID in route does not match ID in request body." });
            }

            try
            {
                var updated = await _service.UpdateNonGSTProformaItemAsync(id, dto);

                if (!updated)
                {
                    _logger.LogWarning("Update failed. Non-GST Proforma line item with ID {Id} not found.", id);
                    return NotFound(new { message = $"Non-GST Proforma line item with ID {id} not found." });
                }

                return Ok(new { message = "Non-GST Proforma line item updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating Non-GST Proforma line item ID: {Id}", id);
                return StatusCode(500, new { message = "An error occurred while updating the line item.", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation("API endpoint called: Delete Non-GST Proforma line item for ID: {Id}", id);

            var deleted = await _service.DeleteNonGSTProformaItemAsync(id);

            if (!deleted)
            {
                _logger.LogWarning("Delete failed. Non-GST Proforma line item with ID {Id} not found.", id);
                return NotFound(new { message = $"Non-GST Proforma line item with ID {id} not found." });
            }

            return Ok(new { message = $"Non-GST Proforma line item with ID {id} deleted successfully." });
        }
    }
}
