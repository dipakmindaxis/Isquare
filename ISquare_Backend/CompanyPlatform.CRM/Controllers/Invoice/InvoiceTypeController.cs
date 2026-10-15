using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Invoice;
using CompanyPlatform.CRM.Services.InvoiceType;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Controllers.Invoice
{
    [Route("api/invoicetypes")]
    [ApiController]
    [Authorize]
    public class InvoiceTypeController : ControllerBase
    {
        private readonly IInvoiceTypeService _invoiceTypeService;
        private readonly ILogger<InvoiceTypeController> _logger;

        public InvoiceTypeController(IInvoiceTypeService invoiceTypeService, ILogger<InvoiceTypeController> logger)
        {
            _invoiceTypeService = invoiceTypeService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("API endpoint called: GetAll Invoice Types");
            var invoiceTypes = await _invoiceTypeService.GetAllInvoiceTypesAsync();
            return Ok(invoiceTypes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("API endpoint called: GetById for Invoice Type ID: {InvoiceTypeId}", id);
            var invoiceType = await _invoiceTypeService.GetInvoiceTypeByIdAsync(id);

            if (invoiceType == null)
            {
                _logger.LogWarning("GetById failed. Invoice Type with ID {InvoiceTypeId} not found or is inactive.", id);
                return NotFound(new { message = $"Invoice Type with ID {id} not found or is inactive." });
            }

            return Ok(invoiceType);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Create([FromBody] InvoiceTypeDto invoiceTypeDto)
        {
            _logger.LogInformation("API endpoint called: Create Invoice Type");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdInvoiceType = await _invoiceTypeService.CreateInvoiceTypeAsync(invoiceTypeDto);

            return CreatedAtAction(nameof(GetById), new { id = createdInvoiceType.ID }, createdInvoiceType);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(int id, [FromBody] InvoiceTypeDto invoiceTypeDto)
        {
            _logger.LogInformation("API endpoint called: Update Invoice Type for ID: {InvoiceTypeId}", id);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _invoiceTypeService.UpdateInvoiceTypeAsync(id, invoiceTypeDto);

            if (!result)
            {
                _logger.LogWarning("Update failed. Invoice Type with ID {InvoiceTypeId} not found or is inactive.", id);
                return NotFound(new { message = $"Invoice Type with ID {id} not found or is inactive." });
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation("API endpoint called: Delete Invoice Type for ID: {InvoiceTypeId}", id);
            var result = await _invoiceTypeService.DeleteInvoiceTypeAsync(id);

            if (!result)
            {
                _logger.LogWarning("Delete failed. Invoice Type with ID {InvoiceTypeId} not found.", id);
                return NotFound(new { message = $"Invoice Type with ID {id} not found." });
            }

            return Ok(new { message = $"Invoice Type with ID {id} has been deactivated." });
        }
    }
}