using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.CompanyNote;
using CompanyPlatform.CRM.Services.CompanyNote;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/companynotes")]
    [ApiController]
    [Authorize]
    public class CompanyNoteController : ControllerBase
    {
        private readonly ICompanyNoteService _companyNoteService;
        private readonly ILogger<CompanyNoteController> _logger;

        public CompanyNoteController(
            ICompanyNoteService companyNoteService,
            ILogger<CompanyNoteController> logger)
        {
            _companyNoteService = companyNoteService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("API endpoint called: GetAll Company Notes");

            var companyNotes = await _companyNoteService.GetAllCompanyNotesAsync();

            return Ok(companyNotes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("API endpoint called: GetById for Company Note ID: {NoteId}", id);

            var companyNote = await _companyNoteService.GetCompanyNoteByIdAsync(id);

            if (companyNote == null)
            {
                _logger.LogWarning("GetById failed. Company Note with ID {NoteId} not found or is inactive.", id);

                return NotFound(new
                {
                    message = $"Company Note with ID {id} not found or is inactive."
                });
            }

            return Ok(companyNote);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Create([FromBody] CompanyNoteDto companyNoteDto)
        {
            _logger.LogInformation("API endpoint called: Create Company Note");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdCompanyNote = await _companyNoteService.CreateCompanyNoteAsync(companyNoteDto);

            return CreatedAtAction(nameof(GetById),
                new { id = createdCompanyNote.NoteId },
                createdCompanyNote);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(int id, [FromBody] CompanyNoteDto companyNoteDto)
        {
            _logger.LogInformation("API endpoint called: Update Company Note for ID: {NoteId}", id);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _companyNoteService.UpdateCompanyNoteAsync(id, companyNoteDto);

            if (!result)
            {
                _logger.LogWarning("Update failed. Company Note with ID {NoteId} not found or is inactive.", id);

                return NotFound(new
                {
                    message = $"Company Note with ID {id} not found or is inactive."
                });
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation("API endpoint called: Delete Company Note for ID: {NoteId}", id);

            var result = await _companyNoteService.DeleteCompanyNoteAsync(id);

            if (!result)
            {
                _logger.LogWarning("Delete failed. Company Note with ID {NoteId} not found.", id);

                return NotFound(new
                {
                    message = $"Company Note with ID {id} not found."
                });
            }

            return Ok(new
            {
                message = $"Company Note with ID {id} has been deactivated."
            });
        }
    }
}