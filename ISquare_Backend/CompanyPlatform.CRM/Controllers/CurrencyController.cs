using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.Services;
using Microsoft.AspNetCore.Mvc;

namespace CompanyPlatform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CurrencyController : ControllerBase
    {
        private readonly ICurrencyService _service;

        public CurrencyController(ICurrencyService service)
        {
            _service = service;
        }

        // GET: api/Currency (Admin: all non-deleted records)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CurrencyResponseDto>>> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // GET: api/Currency/active (Dropdown: only active and non-deleted)
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<CurrencyResponseDto>>> GetActive()
        {
            var result = await _service.GetActiveForDropdownAsync();
            return Ok(result);
        }

        // GET: api/Currency/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<CurrencyResponseDto>> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null)
            {
                return NotFound(new { message = $"Currency with ID {id} not found." });
            }

            return Ok(result);
        }

        // POST: api/Currency
        [HttpPost]
        public async Task<ActionResult<CurrencyResponseDto>> Create([FromBody] CurrencyCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.CurrencyId }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // PUT: api/Currency/5
        [HttpPut("{id:int}")]
        public async Task<ActionResult<CurrencyResponseDto>> Update(int id, [FromBody] CurrencyUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null)
            {
                return NotFound(new { message = $"Currency with ID {id} not found." });
            }

            return Ok(updated);
        }

        // DELETE: api/Currency/5 (Soft Delete)
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, [FromQuery] int? deletedBy = null)
        {
            var success = await _service.DeleteAsync(id, deletedBy);
            if (!success)
            {
                return NotFound(new { message = $"Currency with ID {id} not found." });
            }

            return NoContent();
        }
    }
}