using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.Services;
using Microsoft.AspNetCore.Mvc;

namespace CompanyPlatform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalesTerritoryController : ControllerBase
    {
        private readonly ISalesTerritoryService _service;

        public SalesTerritoryController(ISalesTerritoryService service)
        {
            _service = service;
        }

        // GET: api/SalesTerritory (Admin: all non-deleted records)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SalesTerritoryResponseDto>>> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // GET: api/SalesTerritory/active (Dropdown: only active and non-deleted)
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<SalesTerritoryResponseDto>>> GetActive()
        {
            var result = await _service.GetActiveForDropdownAsync();
            return Ok(result);
        }

        // GET: api/SalesTerritory/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<SalesTerritoryResponseDto>> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null)
            {
                return NotFound(new { message = $"Sales Territory with ID {id} not found." });
            }

            return Ok(result);
        }

        // POST: api/SalesTerritory
        [HttpPost]
        public async Task<ActionResult<SalesTerritoryResponseDto>> Create([FromBody] SalesTerritoryCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.SalesTerritoryId }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // PUT: api/SalesTerritory/5
        [HttpPut("{id:int}")]
        public async Task<ActionResult<SalesTerritoryResponseDto>> Update(int id, [FromBody] SalesTerritoryUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null)
            {
                return NotFound(new { message = $"Sales Territory with ID {id} not found." });
            }

            return Ok(updated);
        }

        // DELETE: api/SalesTerritory/5 (Soft Delete)
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, [FromQuery] int? deletedBy = null)
        {
            var success = await _service.DeleteAsync(id, deletedBy);
            if (!success)
            {
                return NotFound(new { message = $"Sales Territory with ID {id} not found." });
            }

            return NoContent();
        }
    }
}