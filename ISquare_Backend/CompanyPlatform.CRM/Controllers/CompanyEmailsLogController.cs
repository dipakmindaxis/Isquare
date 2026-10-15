using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.CompanyEmailsLog;
using CompanyPlatform.CRM.Services.CompanyEmailsLog;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/companyemailslogs")]
    [ApiController]
    [Authorize]
    public class CompanyEmailsLogController : ControllerBase
    {
        private readonly ICompanyEmailsLogService _companyEmailsLogService;
        private readonly ILogger<CompanyEmailsLogController> _logger;

        public CompanyEmailsLogController(ICompanyEmailsLogService companyEmailsLogService, ILogger<CompanyEmailsLogController> logger)
        {
            _companyEmailsLogService = companyEmailsLogService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("API endpoint called: GetAll Company Email Logs");
            var logs = await _companyEmailsLogService.GetAllCompanyEmailsLogsAsync();
            return Ok(logs);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("API endpoint called: GetById for Company Email Log ID: {EmailLogId}", id);
            var log = await _companyEmailsLogService.GetCompanyEmailsLogByIdAsync(id);

            if (log == null)
            {
                _logger.LogWarning("GetById failed. Company email log with ID {EmailLogId} not found or is inactive.", id);
                return NotFound(new { message = $"Company email log with ID {id} not found or is inactive." });
            }

            return Ok(log);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CompanyEmailsLogDto dto)
        {
            _logger.LogInformation("API endpoint called: Create Company Email Log");
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _companyEmailsLogService.CreateCompanyEmailsLogAsync(dto);

            return CreatedAtAction(nameof(GetById), new { id = created.EmailLogId }, created);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] CompanyEmailsLogDto dto)
        {
            _logger.LogInformation("API endpoint called: Update Company Email Log for ID: {EmailLogId}", id);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _companyEmailsLogService.UpdateCompanyEmailsLogAsync(id, dto);
            if (!result)
            {
                _logger.LogWarning("Update failed. Company email log with ID {EmailLogId} not found or is inactive.", id);
                return NotFound(new { message = $"Company email log with ID {id} not found or is inactive." });
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation("API endpoint called: Delete Company Email Log for ID: {EmailLogId}", id);
            var result = await _companyEmailsLogService.DeleteCompanyEmailsLogAsync(id);

            if (!result)
            {
                _logger.LogWarning("Delete failed. Company email log with ID {EmailLogId} not found.", id);
                return NotFound(new { message = $"Company email log with ID {id} not found." });
            }

            return Ok(new { message = $"Company email log with ID {id} has been deactivated." });
        }
    }
}
