
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Quotation;

using CompanyPlatform.CRM.Services.SalesOrder;


namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/sales-order")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class SalesOrderController : ControllerBase
    {
        private readonly ISalesOrderService _service;
        private readonly ILogger<SalesOrderController> _logger;

        public SalesOrderController(
            ISalesOrderService service,
            ILogger<SalesOrderController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);

            if (result == null)
                return NotFound(new { message = "Sales order not found." });

            return Ok(result);
        }


        [HttpGet("by-quotation/{quotationId:int}")]
        public async Task<IActionResult> GetByQuotationId(int quotationId)
        {
            if (quotationId <= 0)
                return BadRequest(new { message = "Valid quotation ID is required." });

            var result = await _service.GetByQuotationIdAsync(quotationId);

            if (result == null)
                return NotFound(new { message = "No sales order found for the specified quotation." });

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateSalesOrderDto dto)
        {

            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            try
            {
                var userId =
                    User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.Identity?.Name;

                var result = await _service.CreateAsync(dto, userId);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = result.SalesOrderId },
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
                _logger.LogError(ex, "Error creating sales order.");

                return StatusCode(500, new
                {
                    message = "An error occurred while creating the sales order."
                });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] CreateSalesOrderDto dto)
        {

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId =
                    User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.Identity?.Name;

                var result = await _service.UpdateAsync(id, dto, userId);

                if (result == null)
                    return NotFound(new { message = "Sales order not found." });

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
                _logger.LogError(ex, "Error updating sales order {Id}", id);

                return StatusCode(500, new
                {
                    message = "An error occurred while updating the sales order."
                });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _service.DeleteAsync(id);

                if (!deleted)
                    return NotFound(new { message = "Sales order not found." });

                return Ok(new { message = "Sales order deleted successfully." });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }
    }
}