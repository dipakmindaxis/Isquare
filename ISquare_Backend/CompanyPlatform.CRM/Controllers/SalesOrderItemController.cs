using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Quotation;
using CompanyPlatform.CRM.Services.Quotation;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/sales-order-item")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class SalesOrderItemController : ControllerBase
    {
        private readonly ISalesOrderItemService _service;
        private readonly ILogger<SalesOrderItemController> _logger;

        public SalesOrderItemController(
            ISalesOrderItemService service,
            ILogger<SalesOrderItemController> logger)
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
                return NotFound(new { message = "Sales order item not found." });

            return Ok(result);
        }

        [HttpGet("sales-order/{salesOrderId:int}")]
        public async Task<IActionResult> GetBySalesOrderId(int salesOrderId)
        {
            var result =
                await _service.GetBySalesOrderIdAsync(salesOrderId);

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateSalesOrderItemDto dto)
        {
            try
            {
                var result = await _service.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = result.SalesOrderItemId },
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
                _logger.LogError(ex, "Error creating sales order item.");

                return StatusCode(500, new
                {
                    message = "An error occurred while creating the sales order item."
                });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] CreateSalesOrderItemDto dto)
        {
            try
            {
                var result = await _service.UpdateAsync(id, dto);

                if (result == null)
                    return NotFound(new { message = "Sales order item not found." });

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
                    ex, "Error updating sales order item {Id}", id);

                return StatusCode(500, new
                {
                    message = "An error occurred while updating the sales order item."
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
                    return NotFound(new { message = "Sales order item not found." });

                return Ok(new
                {
                    message = "Sales order item deleted successfully."
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }
    }
}