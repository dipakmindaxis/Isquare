using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.CompanyEmail;
using CompanyPlatform.CRM.Services.CompanyEmail;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CompanyEmailController : ControllerBase
    {
        private readonly ICompanyEmailService _companyEmailService;
        private readonly ILogger<CompanyEmailController> _logger;

        public CompanyEmailController(
            ICompanyEmailService companyEmailService,
            ILogger<CompanyEmailController> logger)
        {
            _companyEmailService = companyEmailService;
            _logger = logger;
        }

        // GET: api/CompanyEmail
        [HttpGet]
        public async Task<IActionResult> GetAllCompanyEmails()
        {
            _logger.LogInformation("API endpoint called: GetAll Company Emails");

            var companyEmails = await _companyEmailService.GetAllCompanyEmailsAsync();

            return Ok(companyEmails);
        }

        // GET: api/CompanyEmail/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCompanyEmailById(int id)
        {
            _logger.LogInformation("API endpoint called: GetCompanyEmailById for ID: {EmailId}", id);

            var companyEmail = await _companyEmailService.GetCompanyEmailByIdAsync(id);

            if (companyEmail == null)
            {
                _logger.LogWarning("GetById failed. CompanyEmail with ID {EmailId} not found or is inactive.", id);

                return NotFound(new
                {
                    message = $"CompanyEmail with ID {id} not found or is inactive."
                });
            }

            return Ok(companyEmail);
        }

        // POST: api/CompanyEmail
        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> CreateCompanyEmail([FromBody] CompanyEmailDto companyEmailDto)
        {
            _logger.LogInformation("API endpoint called: Create CompanyEmail");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdCompanyEmail = await _companyEmailService.CreateCompanyEmailAsync(companyEmailDto);

            return CreatedAtAction(
                nameof(GetCompanyEmailById),
                new { id = createdCompanyEmail.EmailId },
                createdCompanyEmail);
        }

        // PUT: api/CompanyEmail/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> UpdateCompanyEmail(int id, [FromBody] CompanyEmailDto companyEmailDto)
        {
            _logger.LogInformation("API endpoint called: Update CompanyEmail for ID: {EmailId}", id);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _companyEmailService.UpdateCompanyEmailAsync(id, companyEmailDto);

            if (!result)
            {
                _logger.LogWarning("Update failed. CompanyEmail with ID {EmailId} not found or is inactive.", id);

                return NotFound(new
                {
                    message = $"CompanyEmail with ID {id} not found or is inactive."
                });
            }

            return NoContent();
        }

        // DELETE: api/CompanyEmail/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCompanyEmail(int id)
        {
            _logger.LogInformation("API endpoint called: Delete CompanyEmail for ID: {EmailId}", id);

            var result = await _companyEmailService.DeleteCompanyEmailAsync(id);

            if (!result)
            {
                _logger.LogWarning("Delete failed. CompanyEmail with ID {EmailId} not found.", id);

                return NotFound(new
                {
                    message = $"CompanyEmail with ID {id} not found."
                });
            }

            return Ok(new
            {
                message = $"CompanyEmail with ID {id} has been deactivated."
            });
        }
    }
}