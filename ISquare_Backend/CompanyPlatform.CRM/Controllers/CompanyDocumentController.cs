using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO.CompanyDocument;
using CompanyPlatform.CRM.Services.CompanyDocument;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyDocumentController : ControllerBase
    {
        private readonly ICompanyDocumentService _companyDocumentService;
        private readonly ILogger<CompanyDocumentController> _logger;

        public CompanyDocumentController(
            ICompanyDocumentService companyDocumentService,
            ILogger<CompanyDocumentController> logger)
        {
            _companyDocumentService = companyDocumentService;
            _logger = logger;
        }

        // GET: api/CompanyDocument
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Fetching all company documents.");

            var documents = await _companyDocumentService.GetAllCompanyDocumentsAsync();

            return Ok(documents);
        }

        // GET: api/CompanyDocument/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("Fetching company document with ID: {DocumentId}", id);

            var document = await _companyDocumentService.GetCompanyDocumentByIdAsync(id);

            if (document == null)
            {
                _logger.LogWarning("Company document not found with ID: {DocumentId}", id);
                return NotFound(new
                {
                    Message = "Company document not found."
                });
            }

            return Ok(document);
        }

        // POST: api/CompanyDocument
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] CompanyDocumentDto companyDocumentDto)
        {
            if (companyDocumentDto.File == null || companyDocumentDto.File.Length == 0)
            {
                ModelState.AddModelError("File", "Please select a file.");
            }

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdDocument = await _companyDocumentService.CreateCompanyDocumentAsync(companyDocumentDto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = createdDocument.DocumentId },
                createdDocument);
        }

        // PUT: api/CompanyDocument/5
        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(
            int id,
            [FromForm] CompanyDocumentDto companyDocumentDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _companyDocumentService.UpdateCompanyDocumentAsync(id, companyDocumentDto);

            if (!updated)
            {
                return NotFound(new
                {
                    Message = "Company document not found."
                });
            }

            return Ok(new
            {
                Message = "Company document updated successfully."
            });
        }
        // DELETE: api/CompanyDocument/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _companyDocumentService.DeleteCompanyDocumentAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message = "Company document not found."
                });
            }

            return Ok(new
            {
                Message = "Company document deleted successfully."
            });
        }
    }
}