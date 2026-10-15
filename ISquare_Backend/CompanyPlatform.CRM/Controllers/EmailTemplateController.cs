using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.CRM.Services;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using CompanyPlatform.CRM.DTO.Meeting;
using CompanyPlatform.CRM.VisitType;
using CompanyPlatform.CRM.DTO.EmailTemplate;
using CompanyPlatform.CRM.Services.EmailTemplate;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/emailtemplates")]
    [ApiController]
    [Authorize]
    public class EmailTemplateController : ControllerBase
    {
        private readonly IEmailTemplateService _emailTemplateService;
        private readonly ILogger<EmailTemplateController> _logger;

        public EmailTemplateController(IEmailTemplateService emailTemplateService, ILogger<EmailTemplateController> logger)
        {
            _emailTemplateService = emailTemplateService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("API endpoint called: GetAll Email Templates");
            var emailTemplates = await _emailTemplateService.GetAllEmailTemplatesAsync();
            return Ok(emailTemplates);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("API endpoint called: GetById for Email Template ID: {EmailTemplateId}", id);
            var emailTemplate = await _emailTemplateService.GetEmailTemplateByIdAsync(id);

            if (emailTemplate == null)
            {
                _logger.LogWarning("GetById failed. Email Template with ID {EmailTemplateId} not found or is inactive.", id);
                return NotFound(new { message = $"Email Template with ID {id} not found or is inactive." });
            }

            return Ok(emailTemplate);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Create([FromBody] EmailTemplateDto emailTemplateDto)
        {
            _logger.LogInformation("API endpoint called: Create Email Template");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdEmailTemplate = await _emailTemplateService.CreateEmailTemplateAsync(emailTemplateDto);

            return CreatedAtAction(nameof(GetById), new { id = createdEmailTemplate.ID }, createdEmailTemplate);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(int id, [FromBody] EmailTemplateDto emailTemplateDto)
        {
            _logger.LogInformation("API endpoint called: Update Email Template for ID: {EmailTemplateId}", id);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _emailTemplateService.UpdateEmailTemplateAsync(id, emailTemplateDto);

            if (!result)
            {
                _logger.LogWarning("Update failed. Email Template with ID {EmailTemplateId} not found or is inactive.", id);
                return NotFound(new { message = $"Email Template with ID {id} not found or is inactive." });
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation("API endpoint called: Delete Email Template for ID: {EmailTemplateId}", id);
            var result = await _emailTemplateService.DeleteEmailTemplateAsync(id);

            if (!result)
            {
                _logger.LogWarning("Delete failed. Email Template with ID {EmailTemplateId} not found.", id);
                return NotFound(new { message = $"Email Template with ID {id} not found." });
            }

            return Ok(new { message = $"Email Template with ID {id} has been deactivated." });
        }
    }
}