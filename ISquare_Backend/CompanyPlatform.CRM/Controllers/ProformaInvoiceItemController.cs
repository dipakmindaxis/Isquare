using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.ProformaInvoice;
using CompanyPlatform.CRM.Services.ProformaInvoice;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProformaInvoiceItemController : ControllerBase
    {
        private readonly IProformaInvoiceItemService _proformaInvoiceItemService;
        private readonly ILogger<ProformaInvoiceItemController> _logger;

        public ProformaInvoiceItemController(
            IProformaInvoiceItemService proformaInvoiceItemService,
            ILogger<ProformaInvoiceItemController> logger)
        {
            _proformaInvoiceItemService = proformaInvoiceItemService;
            _logger = logger;
        }

        // GET: api/ProformaInvoiceItem
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProformaInvoiceItemDto>>> GetAll()
        {
            _logger.LogInformation("API endpoint called: GetAll Proforma Invoice Items");
            var items = await _proformaInvoiceItemService.GetAllProformaInvoiceItemsAsync();
            return Ok(items);
        }

        // GET: api/ProformaInvoiceItem/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProformaInvoiceItemDto>> GetById(int id)
        {
            _logger.LogInformation("API endpoint called: GetById for Proforma Invoice Item ID: {ProformaItemId}", id);
            var item = await _proformaInvoiceItemService.GetProformaInvoiceItemByIdAsync(id);

            if (item == null)
            {
                _logger.LogWarning("Proforma invoice item with ID {ProformaItemId} not found.", id);
                return NotFound(new
                {
                    message = "Proforma Invoice Item not found."
                });
            }

            return Ok(item);
        }

        // GET: api/ProformaInvoiceItem/proforma/5
        [HttpGet("proforma/{proformaId}")]
        public async Task<ActionResult<IEnumerable<ProformaInvoiceItemDto>>> GetByProformaId(int proformaId)
        {
            _logger.LogInformation("API endpoint called: GetByProformaId for Proforma ID: {ProformaId}", proformaId);
            var items = await _proformaInvoiceItemService.GetItemsByProformaIdAsync(proformaId);
            return Ok(items);
        }

        // POST: api/ProformaInvoiceItem
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProformaInvoiceItemDto itemDto)
        {
            _logger.LogInformation("API endpoint called: Create Proforma Invoice Item");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var createdItem = await _proformaInvoiceItemService.CreateProformaInvoiceItemAsync(itemDto);

                return Ok(new
                {
                    message = "Proforma Invoice Item created successfully.",
                    data = createdItem
                });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Create Proforma Invoice Item failed: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/ProformaInvoiceItem/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProformaInvoiceItemDto itemDto)
        {
            _logger.LogInformation("API endpoint called: Update Proforma Invoice Item ID: {ProformaItemId}", id);

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (id != itemDto.ProformaItemId)
            {
                return BadRequest(new
                {
                    message = "Proforma Invoice Item ID mismatch."
                });
            }

            var updated = await _proformaInvoiceItemService.UpdateProformaInvoiceItemAsync(itemDto);

            if (!updated)
            {
                _logger.LogWarning("Update failed. Proforma invoice item with ID {ProformaItemId} not found.", id);
                return NotFound(new
                {
                    message = "Proforma Invoice Item not found."
                });
            }

            return Ok(new
            {
                message = "Proforma Invoice Item updated successfully."
            });
        }

        // DELETE: api/ProformaInvoiceItem/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation("API endpoint called: Delete Proforma Invoice Item ID: {ProformaItemId}", id);

            var deleted = await _proformaInvoiceItemService.DeleteProformaInvoiceItemAsync(id);

            if (!deleted)
            {
                _logger.LogWarning("Delete failed. Proforma invoice item with ID {ProformaItemId} not found.", id);
                return NotFound(new
                {
                    message = "Proforma Invoice Item not found."
                });
            }

            return Ok(new
            {
                message = "Proforma Invoice Item deleted successfully."
            });
        }
    }
}
