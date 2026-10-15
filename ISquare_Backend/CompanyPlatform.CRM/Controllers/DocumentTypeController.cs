using CompanyPlatform.CRM.DTO.DocumentType;
using CompanyPlatform.CRM.Services.DocumentType;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/documenttype")]
    [ApiController]
    [Authorize]
    public class DocumentTypeController : ControllerBase
    {
        private readonly IDocumentTypeService _documentTypeService;
        private readonly ILogger<DocumentTypeController> _logger;

        public DocumentTypeController(
            IDocumentTypeService documentTypeService,
            ILogger<DocumentTypeController> logger)
        {
            _documentTypeService = documentTypeService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var documentTypes =
                    await _documentTypeService.GetAllDocumentTypesAsync();

                return Ok(documentTypes);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while fetching document types.");

                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var documentType =
                    await _documentTypeService.GetDocumentTypeByIdAsync(id);

                if (documentType == null)
                    return NotFound();

                return Ok(documentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while fetching document type with ID {Id}",
                    id);

                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create(DocumentTypeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var documentType =
                    await _documentTypeService.CreateDocumentTypeAsync(dto);

                return Ok(documentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while creating document type.");

                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            DocumentTypeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result =
                    await _documentTypeService
                        .UpdateDocumentTypeAsync(id, dto);

                if (!result)
                    return NotFound();

                return Ok(new
                {
                    message = "Document Type updated successfully."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while updating document type with ID {Id}",
                    id);

                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result =
                    await _documentTypeService
                        .DeleteDocumentTypeAsync(id);

                if (!result)
                    return NotFound();

                return Ok(new
                {
                    message = "Document Type deleted successfully."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while deleting document type with ID {Id}",
                    id);

                return StatusCode(500, "Internal server error.");
            }
        }
    }
}