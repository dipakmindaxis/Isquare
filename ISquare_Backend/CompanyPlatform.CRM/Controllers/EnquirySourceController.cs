using CompanyPlatform.Core.Models.CRM;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.Services;

namespace CompanyPlatform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnquirySourceController : ControllerBase
    {
        private readonly IEnquirySourceService _service;

        public EnquirySourceController(IEnquirySourceService service)
        {
            _service = service;
        }

        // GET: api/EnquirySource (Admin: returns all including inactive)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EnquirySourceResponseDto>>> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // GET: api/EnquirySource/active (Dropdown: returns only active records for new enquiries)
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<EnquirySourceResponseDto>>> GetActiveDropdown()
        {
            var result = await _service.GetActiveForDropdownAsync();
            return Ok(result);
        }

        // GET: api/EnquirySource/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<EnquirySourceResponseDto>> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null)
            {
                return NotFound(new { message = $"Enquiry Source with ID {id} not found." });
            }

            return Ok(result);
        }

        // POST: api/EnquirySource
        [HttpPost]
        public async Task<ActionResult<EnquirySourceResponseDto>> Create([FromBody] EnquirySourceCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.EnquirySourceId }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // PUT: api/EnquirySource/5
        [HttpPut("{id:int}")]
        public async Task<ActionResult<EnquirySourceResponseDto>> Update(int id, [FromBody] EnquirySourceUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null)
            {
                return NotFound(new { message = $"Enquiry Source with ID {id} not found." });
            }

            return Ok(updated);
        }

        // DELETE: api/EnquirySource/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success)
            {
                return NotFound(new { message = $"Enquiry Source with ID {id} not found." });
            }

            return NoContent();
        }
    }
}