using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.Services;
using Microsoft.AspNetCore.Mvc;

namespace CompanyPlatform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductCategoryController : ControllerBase
    {
        private readonly IProductCategoryService _service;

        public ProductCategoryController(IProductCategoryService service)
        {
            _service = service;
        }

        // GET: api/ProductCategory (Admin: all non-deleted records)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductCategoryResponseDto>>> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // GET: api/ProductCategory/active (Dropdown: only active and non-deleted records)
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<ProductCategoryResponseDto>>> GetActive()
        {
            var result = await _service.GetActiveForDropdownAsync();
            return Ok(result);
        }

        // GET: api/ProductCategory/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ProductCategoryResponseDto>> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null)
            {
                return NotFound(new { message = $"Product Category with ID {id} not found." });
            }

            return Ok(result);
        }

        // POST: api/ProductCategory
        [HttpPost]
        public async Task<ActionResult<ProductCategoryResponseDto>> Create([FromBody] ProductCategoryCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.ProductCategoryId }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // PUT: api/ProductCategory/5
        [HttpPut("{id:int}")]
        public async Task<ActionResult<ProductCategoryResponseDto>> Update(int id, [FromBody] ProductCategoryUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null)
            {
                return NotFound(new { message = $"Product Category with ID {id} not found." });
            }

            return Ok(updated);
        }

        // DELETE: api/ProductCategory/5 (Soft Delete)
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, [FromQuery] int? deletedBy = null)
        {
            var success = await _service.DeleteAsync(id, deletedBy);
            if (!success)
            {
                return NotFound(new { message = $"Product Category with ID {id} not found." });
            }

            return NoContent();
        }
    }
}