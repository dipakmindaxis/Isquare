using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.Services;
using Microsoft.AspNetCore.Mvc;

namespace CompanyPlatform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnquiryStageController : ControllerBase
    {
        private readonly IEnquiryStageService _service;

        public EnquiryStageController(IEnquiryStageService service)
        {
            _service = service;
        }

        // GET: api/EnquiryStage (Admin: all non-deleted records)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EnquiryStageResponseDto>>> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // GET: api/EnquiryStage/active (Dropdown: only active and non-deleted records)
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<EnquiryStageResponseDto>>> GetActive()
        {
            var result = await _service.GetActiveForDropdownAsync();
            return Ok(result);
        }

        // GET: api/EnquiryStage/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<EnquiryStageResponseDto>> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null)
            {
                return NotFound(new { message = $"Enquiry Stage with ID {id} not found." });
            }

            return Ok(result);
        }

        // POST: api/EnquiryStage
        [HttpPost]
        public async Task<ActionResult<EnquiryStageResponseDto>> Create([FromBody] EnquiryStageCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.EnquiryStageId }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // PUT: api/EnquiryStage/5
        [HttpPut("{id:int}")]
        public async Task<ActionResult<EnquiryStageResponseDto>> Update(int id, [FromBody] EnquiryStageUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null)
            {
                return NotFound(new { message = $"Enquiry Stage with ID {id} not found." });
            }

            return Ok(updated);
        }

        // DELETE: api/EnquiryStage/5 (Soft Delete)
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, [FromQuery] int? deletedBy = null)
        {
            var success = await _service.DeleteAsync(id, deletedBy);
            if (!success)
            {
                return NotFound(new { message = $"Enquiry Stage with ID {id} not found." });
            }

            return NoContent();
        }
    }
}