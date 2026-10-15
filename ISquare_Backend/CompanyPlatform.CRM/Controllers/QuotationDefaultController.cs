using CompanyPlatform.CRM.DTO.Quotation;
using CompanyPlatform.CRM.Services.Quotation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/quotation-default")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class QuotationDefaultController : ControllerBase
    {
        private readonly IQuotationDefaultService _service;
        private readonly ILogger<QuotationDefaultController> _logger;

        public QuotationDefaultController(
            IQuotationDefaultService service,
            ILogger<QuotationDefaultController> logger)
        {
            _service = service;
            _logger = logger;
        }

        // GET: api/quotation-default
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _service.GetAllAsync();
            return Ok(items);
        }

        // GET: api/quotation-default/1
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _service.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound(new
                {
                    Message = "Quotation defaults not found."
                });
            }

            return Ok(item);
        }

        // POST: api/quotation-default
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] QuotationDefaultDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = await _service.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = created.QuotationDefaultId },
                    created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { Message = ex.Message });
            }
        }

        // PUT: api/quotation-default/1
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id, [FromBody] QuotationDefaultDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _service.UpdateAsync(id, dto);

                if (!updated)
                {
                    return NotFound(new
                    {
                        Message = "Quotation defaults not found."
                    });
                }

                return Ok(new
                {
                    Message = "Quotation defaults updated successfully."
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // DELETE: api/quotation-default/1
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message = "Quotation defaults not found."
                });
            }

            return Ok(new
            {
                Message = "Quotation defaults deleted successfully."
            });
        }
    }
}