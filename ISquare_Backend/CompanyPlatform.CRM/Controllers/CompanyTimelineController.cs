using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.CompanyTimeline;
using CompanyPlatform.CRM.Services.CompanyTimeline;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/companytimelines")]
    [ApiController]
    [Authorize]
    public class CompanyTimelineController : ControllerBase
    {
        private readonly ICompanyTimelineService _companyTimelineService;
        private readonly ILogger<CompanyTimelineController> _logger;

        public CompanyTimelineController(ICompanyTimelineService companyTimelineService, ILogger<CompanyTimelineController> logger)
        {
            _companyTimelineService = companyTimelineService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("API endpoint called: GetAll Company Timelines");
            var timelines = await _companyTimelineService.GetAllCompanyTimelinesAsync();
            return Ok(timelines);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("API endpoint called: GetById for Company Timeline ID: {TimelineId}", id);
            var timeline = await _companyTimelineService.GetCompanyTimelineByIdAsync(id);

            if (timeline == null)
            {
                _logger.LogWarning("GetById failed. Company timeline with ID {TimelineId} not found or is inactive.", id);
                return NotFound(new { message = $"Company timeline with ID {id} not found or is inactive." });
            }

            return Ok(timeline);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Create([FromBody] CreateCompanyTimelineDto dto)
        {
            _logger.LogInformation("API endpoint called: Create Company Timeline");
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _companyTimelineService.CreateCompanyTimelineAsync(dto);

            return CreatedAtAction(nameof(GetById), new { id = created.TimelineId }, created);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(int id, [FromBody] CompanyTimelineDto dto)
        {
            _logger.LogInformation("API endpoint called: Update Company Timeline for ID: {TimelineId}", id);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _companyTimelineService.UpdateCompanyTimelineAsync(id, dto);
            if (!result)
            {
                _logger.LogWarning("Update failed. Company timeline with ID {TimelineId} not found or is inactive.", id);
                return NotFound(new { message = $"Company timeline with ID {id} not found or is inactive." });
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation("API endpoint called: Delete Company Timeline for ID: {TimelineId}", id);
            var result = await _companyTimelineService.DeleteCompanyTimelineAsync(id);

            if (!result)
            {
                _logger.LogWarning("Delete failed. Company timeline with ID {TimelineId} not found.", id);
                return NotFound(new { message = $"Company timeline with ID {id} not found." });
            }

            return Ok(new { message = $"Company timeline with ID {id} has been deactivated." });
        }
    }
}
