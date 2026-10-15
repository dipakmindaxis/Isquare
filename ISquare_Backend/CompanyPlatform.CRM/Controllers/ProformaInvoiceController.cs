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
    public class ProformaInvoiceController : ControllerBase
    {
        private readonly IProformaInvoiceService _proformaInvoiceService;
        private readonly ILogger<ProformaInvoiceController> _logger;

        public ProformaInvoiceController(
            IProformaInvoiceService proformaInvoiceService,
            ILogger<ProformaInvoiceController> logger)
        {
            _proformaInvoiceService = proformaInvoiceService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("API endpoint called: GetAll Proforma Invoices");
            var proformas = await _proformaInvoiceService.GetAllProformaInvoicesAsync();
            return Ok(proformas);
        }

        [HttpGet("next-number")]
        public async Task<IActionResult> GetNextProformaNumber()
        {
            _logger.LogInformation("API endpoint called: GetNextProformaNumber");
            var nextNumber = await _proformaInvoiceService.GetNextProformaNumberAsync();
            return Ok(new
            {
                proformaNumber = nextNumber
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("API endpoint called: GetById for Proforma Invoice ID: {ProformaId}", id);
            var proforma = await _proformaInvoiceService.GetProformaInvoiceByIdAsync(id);

            if (proforma == null)
            {
                _logger.LogWarning("GetById failed. Proforma invoice with ID {ProformaId} not found or is inactive.", id);
                return NotFound(new { message = $"Proforma invoice with ID {id} not found or is inactive." });
            }

            return Ok(proforma);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProformaInvoiceDto createDto)
        {
            _logger.LogInformation("API endpoint called: Create Proforma Invoice");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var createdProforma = await _proformaInvoiceService.CreateProformaInvoiceAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = createdProforma.ProformaId }, createdProforma);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Create Proforma Invoice failed: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProformaInvoiceDto updateDto)
        {
            _logger.LogInformation("API endpoint called: Update Proforma Invoice for ID: {ProformaId}", id);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _proformaInvoiceService.UpdateProformaInvoiceAsync(id, updateDto);
            if (!result)
            {
                _logger.LogWarning("Update failed. Proforma invoice with ID {ProformaId} not found or invalid company.", id);
                return NotFound(new { message = $"Proforma invoice with ID {id} not found or update failed." });
            }

            return NoContent();
        }

        [AllowAnonymous]
        [HttpPost("public-response")]
        public async Task<IActionResult> PublicResponse([FromBody] PublicProformaResponseDto responseDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var status = responseDto.Status.Trim();
            if (!string.Equals(status, "Accepted", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(status, "Rejected", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Status must be Accepted or Rejected." });
            }

            var proforma = await _proformaInvoiceService.UpdatePublicResponseAsync(responseDto.ProformaNo, status);
            if (proforma == null)
            {
                return NotFound(new { message = "Proforma invoice was not found." });
            }

            return Ok(proforma);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation("API endpoint called: Delete Proforma Invoice for ID: {ProformaId}", id);
            var result = await _proformaInvoiceService.DeleteProformaInvoiceAsync(id);

            if (!result)
            {
                _logger.LogWarning("Delete failed. Proforma invoice with ID {ProformaId} not found.", id);
                return NotFound(new { message = $"Proforma invoice with ID {id} not found." });
            }

            return Ok(new { message = $"Proforma invoice with ID {id} has been deactivated." });
        }
    }
}
