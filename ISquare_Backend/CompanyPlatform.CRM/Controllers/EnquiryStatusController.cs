using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.Services;
using Microsoft.AspNetCore.Mvc;

namespace CompanyPlatform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnquiryStatusController : ControllerBase
    {
        private readonly IEnquiryStatusService _service;

        public EnquiryStatusController(IEnquiryStatusService service)
        {
            _service = service;
        }

        // GET: api/EnquiryStatus (Admin: all non-deleted records)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EnquiryStatusResponseDto>>> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // GET: api/EnquiryStatus/active (Dropdown: only active and non-deleted records)
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<EnquiryStatusResponseDto>>> GetActive()
        {
            var result = await _service.GetActiveForDropdownAsync();
            return Ok(result);
        }

        // GET: api/EnquiryStatus/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<EnquiryStatusResponseDto>> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null)
            {
                return NotFound(new { message = $"Enquiry Status with ID {id} not found." });
            }

            return Ok(result);
        }

        // POST: api/EnquiryStatus
        [HttpPost]
        public async Task<ActionResult<EnquiryStatusResponseDto>> Create([FromBody] EnquiryStatusCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.EnquiryStatusId }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // PUT: api/EnquiryStatus/5
        [HttpPut("{id:int}")]
        public async Task<ActionResult<EnquiryStatusResponseDto>> Update(int id, [FromBody] EnquiryStatusUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null)
            {
                return NotFound(new { message = $"Enquiry Status with ID {id} not found." });
            }

            return Ok(updated);
        }

        // DELETE: api/EnquiryStatus/5 (Soft Delete)
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, [FromQuery] int? deletedBy = null)
        {
            var success = await _service.DeleteAsync(id, deletedBy);
            if (!success)
            {
                return NotFound(new { message = $"Enquiry Status with ID {id} not found." });
            }

            return NoContent();
        }
    }
}