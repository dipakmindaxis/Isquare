using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.CRM.Services.CompanyContact;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/companycontacts")]
    [ApiController]
    [Authorize]
    public class CompanyContactController : ControllerBase
    {
        private readonly ICompanyContactService _companyContactService;
        private readonly ILogger<CompanyContactController> _logger;

        public CompanyContactController(
            ICompanyContactService companyContactService,
            ILogger<CompanyContactController> logger)
        {
            _companyContactService = companyContactService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("API endpoint called: GetAll Company Contacts");

            var companyContacts = await _companyContactService.GetAllCompanyContactsAsync();

            return Ok(companyContacts);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("API endpoint called: GetById for Company Contact ID: {ContactId}", id);

            var companyContact = await _companyContactService.GetCompanyContactByIdAsync(id);

            if (companyContact == null)
            {
                _logger.LogWarning("GetById failed. Company Contact with ID {ContactId} not found.", id);

                return NotFound(new
                {
                    message = $"Company Contact with ID {id} not found."
                });
            }

            return Ok(companyContact);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Create(
            [FromBody] CompanyContactDto companyContactDto)
        {
            _logger.LogInformation("API endpoint called: Create Company Contact");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdCompanyContact =
                await _companyContactService.CreateCompanyContactAsync(companyContactDto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = createdCompanyContact.ContactId },
                createdCompanyContact);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] CompanyContactDto companyContactDto)
        {
            _logger.LogInformation("API endpoint called: Update Company Contact for ID: {ContactId}", id);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _companyContactService.UpdateCompanyContactAsync(id, companyContactDto);

            if (!result)
            {
                _logger.LogWarning("Update failed. Company Contact with ID {ContactId} not found.", id);

                return NotFound(new
                {
                    message = $"Company Contact with ID {id} not found."
                });
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation("API endpoint called: Delete Company Contact for ID: {ContactId}", id);

            var result = await _companyContactService.DeleteCompanyContactAsync(id);

            if (!result)
            {
                _logger.LogWarning("Delete failed. Company Contact with ID {ContactId} not found.", id);

                return NotFound(new
                {
                    message = $"Company Contact with ID {id} not found."
                });
            }

            return Ok(new
            {
                message = $"Company Contact with ID {id} has been deleted."
            });
        }
    }
}