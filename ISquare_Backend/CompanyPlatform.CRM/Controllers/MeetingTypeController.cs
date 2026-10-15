using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.DTO;
using CompanyPlatform.Core.Services;
using System.Threading.Tasks;
using CompanyPlatform.Core.Services.MeetingType;

namespace CompanyPlatform.Core.Controllers
{
    [Route("api/meetingtypes")]
    [ApiController]
    [Authorize]
    public class MeetingTypeController : ControllerBase
    {
        private readonly IMeetingTypeService _meetingTypeService;
        private readonly ILogger<MeetingTypeController> _logger;

        public MeetingTypeController(IMeetingTypeService meetingTypeService, ILogger<MeetingTypeController> logger)
        {
            _meetingTypeService = meetingTypeService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("API endpoint called: GetAll Meeting Types");

            var meetingTypes = await _meetingTypeService.GetAllMeetingTypesAsync();
            return Ok(meetingTypes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("API endpoint called: GetById for Meeting Type ID: {MeetingTypeId}", id);

            var meetingType = await _meetingTypeService.GetMeetingTypeByIdAsync(id);

            if (meetingType == null)
            {
                _logger.LogWarning("GetById failed. Meeting Type with ID {MeetingTypeId} not found or is inactive.", id);

                return NotFound(new { message = $"Meeting Type with ID {id} not found or is inactive." });
            }

            return Ok(meetingType);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Create(
            [FromBody] DTO.MeetingType.MeetingTypeDto meetingTypeDto)
        {
            _logger.LogInformation("API endpoint called: Create Meeting Type");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdMeetingType = await _meetingTypeService.CreateMeetingTypeAsync(meetingTypeDto);

            return CreatedAtAction(nameof(GetById), new { id = createdMeetingType.ID }, createdMeetingType);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] DTO.MeetingType.MeetingTypeDto meetingTypeDto)
        {
            _logger.LogInformation("API endpoint called: Update Meeting Type for ID: {MeetingTypeId}", id);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _meetingTypeService.UpdateMeetingTypeAsync(id, meetingTypeDto);

            if (!result)
            {
                _logger.LogWarning("Update failed. Meeting Type with ID {MeetingTypeId} not found or is inactive.", id);

                return NotFound(new { message = $"Meeting Type with ID {id} not found or is inactive." });
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation("API endpoint called: Delete Meeting Type for ID: {MeetingTypeId}", id);
            var result = await _meetingTypeService.DeleteMeetingTypeAsync(id);

            if (!result)
            {
                _logger.LogWarning("Delete failed. Meeting Type with ID {MeetingTypeId} not found.", id);
                return NotFound(new { message = $"Meeting Type with ID {id} not found." });
            }
            return Ok(new { message = $"Meeting Type with ID {id} has been deactivated." });
        }
    }
}
