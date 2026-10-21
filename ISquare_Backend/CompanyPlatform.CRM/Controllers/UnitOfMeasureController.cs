using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.Services;
using Microsoft.AspNetCore.Mvc;

namespace CompanyPlatform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UnitOfMeasureController : ControllerBase
    {
        private readonly IUnitOfMeasureService _service;

        public UnitOfMeasureController(IUnitOfMeasureService service)
        {
            _service = service;
        }

        // GET: api/UnitOfMeasure (Admin: all non-deleted records)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UnitOfMeasureResponseDto>>> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // GET: api/UnitOfMeasure/active (Dropdown: only active and non-deleted)
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<UnitOfMeasureResponseDto>>> GetActive()
        {
            var result = await _service.GetActiveForDropdownAsync();
            return Ok(result);
        }

        // GET: api/UnitOfMeasure/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<UnitOfMeasureResponseDto>> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null)
            {
                return NotFound(new { message = $"Unit of Measure with ID {id} not found." });
            }

            return Ok(result);
        }

        // POST: api/UnitOfMeasure
        [HttpPost]
        public async Task<ActionResult<UnitOfMeasureResponseDto>> Create([FromBody] UnitOfMeasureCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.UnitOfMeasureId }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // PUT: api/UnitOfMeasure/5
        [HttpPut("{id:int}")]
        public async Task<ActionResult<UnitOfMeasureResponseDto>> Update(int id, [FromBody] UnitOfMeasureUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null)
            {
                return NotFound(new { message = $"Unit of Measure with ID {id} not found." });
            }

            return Ok(updated);
        }

        // DELETE: api/UnitOfMeasure/5 (Soft Delete)
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, [FromQuery] int? deletedBy = null)
        {
            var success = await _service.DeleteAsync(id, deletedBy);
            if (!success)
            {
                return NotFound(new { message = $"Unit of Measure with ID {id} not found." });
            }

            return NoContent();
        }
    }
}