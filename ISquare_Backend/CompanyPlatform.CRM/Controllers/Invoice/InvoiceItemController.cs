using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO.Invoice;
using CompanyPlatform.CRM.Services.InvoiceItem;

namespace CompanyPlatform.CRM.Controllers.Invoice
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InvoiceItemController : ControllerBase
    {
        private readonly IInvoiceItemService _invoiceItemService;

        public InvoiceItemController(IInvoiceItemService invoiceItemService)
        {
            _invoiceItemService = invoiceItemService;
        }

        // GET: api/InvoiceItem
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InvoiceItemDto>>> GetAll()
        {
            var items = await _invoiceItemService.GetAllInvoiceItemsAsync();
            return Ok(items);
        }

        // GET: api/InvoiceItem/5
        [HttpGet("{id}")]
        public async Task<ActionResult<InvoiceItemDto>> GetById(int id)
        {
            var item = await _invoiceItemService.GetInvoiceItemByIdAsync(id);

            if (item == null)
            {
                return NotFound(new
                {
                    message = "Invoice Item not found."
                });
            }

            return Ok(item);
        }

        // POST: api/InvoiceItem
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] InvoiceItemDto invoiceItemDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdItem = await _invoiceItemService.CreateInvoiceItemAsync(invoiceItemDto);

            return Ok(new
            {
                message = "Invoice Item created successfully.",
                data = createdItem
            });
        }

        // PUT: api/InvoiceItem/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] InvoiceItemDto invoiceItemDto)
        {
            if (id != invoiceItemDto.InvoiceItemId)
            {
                return BadRequest(new
                {
                    message = "Invoice Item ID mismatch."
                });
            }

            var updated = await _invoiceItemService.UpdateInvoiceItemAsync(invoiceItemDto);

            if (!updated)
            {
                return NotFound(new
                {
                    message = "Invoice Item not found."
                });
            }

            return Ok(new
            {
                message = "Invoice Item updated successfully."
            });
        }

        // DELETE: api/InvoiceItem/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _invoiceItemService.DeleteInvoiceItemAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Invoice Item not found."
                });
            }

            return Ok(new
            {
                message = "Invoice Item deleted successfully."
            });
        }
    }
}