using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.Services;
using Microsoft.AspNetCore.Mvc;

namespace CompanyPlatform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductServiceController : ControllerBase
    {
        private readonly IProductServiceItemService _service;

        public ProductServiceController(IProductServiceItemService service)
        {
            _service = service;
        }

        // GET: api/ProductService (Admin: all non-deleted records)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductServiceResponseDto>>> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // GET: api/ProductService/active (Dropdown: only active and non-deleted records)
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<ProductServiceResponseDto>>> GetActive()
        {
            var result = await _service.GetActiveForDropdownAsync();
            return Ok(result);
        }

        // GET: api/ProductService/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ProductServiceResponseDto>> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null)
            {
                return NotFound(new { message = $"Product/Service with ID {id} not found." });
            }

            return Ok(result);
        }

        // POST: api/ProductService
        [HttpPost]
        public async Task<ActionResult<ProductServiceResponseDto>> Create([FromBody] ProductServiceCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.ProductServiceId }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // PUT: api/ProductService/5
        [HttpPut("{id:int}")]
        public async Task<ActionResult<ProductServiceResponseDto>> Update(int id, [FromBody] ProductServiceUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null)
            {
                return NotFound(new { message = $"Product/Service with ID {id} not found." });
            }

            return Ok(updated);
        }

        // DELETE: api/ProductService/5 (Soft Delete)
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, [FromQuery] int? deletedBy = null)
        {
            var success = await _service.DeleteAsync(id, deletedBy);
            if (!success)
            {
                return NotFound(new { message = $"Product/Service with ID {id} not found." });
            }

            return NoContent();
        }
    }
}