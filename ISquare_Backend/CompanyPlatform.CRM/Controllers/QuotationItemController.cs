using CompanyPlatform.CRM.DTO.Quotation;
using CompanyPlatform.CRM.Services.Quotation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/quotation-item")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class QuotationItemController : ControllerBase
    {
        private readonly IQuotationItemService _service;
        private readonly ILogger<QuotationItemController> _logger;

        public QuotationItemController(
            IQuotationItemService service,
            ILogger<QuotationItemController> logger)
        {
            _service = service;
            _logger = logger;
        }

        // GET: api/quotation-item
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _service.GetAllAsync();
            return Ok(items);
        }

        // GET: api/quotation-item/by-quotation/1
        [HttpGet("by-quotation/{quotationId}")]
        public async Task<IActionResult> GetByQuotationId(int quotationId)
        {
            if (quotationId <= 0)
                return BadRequest(new { Message = "Invalid quotation ID." });

            var items = await _service.GetByQuotationIdAsync(quotationId);
            return Ok(items);
        }

        // GET: api/quotation-item/1
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _service.GetByIdAsync(id);

            if (item == null)
                return NotFound(new { Message = "Quotation item not found." });

            return Ok(item);
        }

        // POST: api/quotation-item
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] QuotationItemDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = await _service.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = created.QuotationItemId },
                    created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // PUT: api/quotation-item/1
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id, [FromBody] QuotationItemDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _service.UpdateAsync(id, dto);

                if (!updated)
                    return NotFound(new { Message = "Quotation item not found." });

                return Ok(new { Message = "Quotation item updated successfully." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // DELETE: api/quotation-item/1
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _service.DeleteAsync(id);

                if (!deleted)
                    return NotFound(new { Message = "Quotation item not found." });

                return Ok(new { Message = "Quotation item deleted successfully." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}