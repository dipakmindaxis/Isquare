using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.Services;
using Microsoft.AspNetCore.Mvc;

namespace CompanyPlatform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnquiryTypeController : ControllerBase
    {
        private readonly IEnquiryTypeService _service;

        public EnquiryTypeController(IEnquiryTypeService service)
        {
            _service = service;
        }

        // GET: api/EnquiryType (Admin: all records)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EnquiryTypeResponseDto>>> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // GET: api/EnquiryType/active (Dropdown: only active values)
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<EnquiryTypeResponseDto>>> GetActive()
        {
            var result = await _service.GetActiveForDropdownAsync();
            return Ok(result);
        }

        // GET: api/EnquiryType/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<EnquiryTypeResponseDto>> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null)
            {
                return NotFound(new { message = $"Enquiry Type with ID {id} not found." });
            }

            return Ok(result);
        }

        // POST: api/EnquiryType
        [HttpPost]
        public async Task<ActionResult<EnquiryTypeResponseDto>> Create([FromBody] EnquiryTypeCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.EnquiryTypeId }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // PUT: api/EnquiryType/5
        [HttpPut("{id:int}")]
        public async Task<ActionResult<EnquiryTypeResponseDto>> Update(int id, [FromBody] EnquiryTypeUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null)
            {
                return NotFound(new { message = $"Enquiry Type with ID {id} not found." });
            }

            return Ok(updated);
        }

        // DELETE: api/EnquiryType/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success)
            {
                return NotFound(new { message = $"Enquiry Type with ID {id} not found." });
            }

            return NoContent();
        }
    }
}