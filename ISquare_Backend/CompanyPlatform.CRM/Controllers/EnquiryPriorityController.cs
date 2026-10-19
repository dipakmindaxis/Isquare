using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.Services;
using Microsoft.AspNetCore.Mvc;

namespace CompanyPlatform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnquiryPriorityController : ControllerBase
    {
        private readonly IEnquiryPriorityService _service;

        public EnquiryPriorityController(IEnquiryPriorityService service)
        {
            _service = service;
        }

        // GET: api/EnquiryPriority (Admin: all non-deleted records)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EnquiryPriorityResponseDto>>> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // GET: api/EnquiryPriority/active (Dropdown: only active and non-deleted)
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<EnquiryPriorityResponseDto>>> GetActive()
        {
            var result = await _service.GetActiveForDropdownAsync();
            return Ok(result);
        }

        // GET: api/EnquiryPriority/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<EnquiryPriorityResponseDto>> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null)
            {
                return NotFound(new { message = $"Enquiry Priority with ID {id} not found." });
            }

            return Ok(result);
        }

        // POST: api/EnquiryPriority
        [HttpPost]
        public async Task<ActionResult<EnquiryPriorityResponseDto>> Create([FromBody] EnquiryPriorityCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.EnquiryPriorityId }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // PUT: api/EnquiryPriority/5
        [HttpPut("{id:int}")]
        public async Task<ActionResult<EnquiryPriorityResponseDto>> Update(int id, [FromBody] EnquiryPriorityUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null)
            {
                return NotFound(new { message = $"Enquiry Priority with ID {id} not found." });
            }

            return Ok(updated);
        }

        // DELETE: api/EnquiryPriority/5 (Soft Delete)
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, [FromQuery] int? deletedBy = null)
        {
            var success = await _service.DeleteAsync(id, deletedBy);
            if (!success)
            {
                return NotFound(new { message = $"Enquiry Priority with ID {id} not found." });
            }

            return NoContent();
        }
    }
}