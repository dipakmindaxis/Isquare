using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO.ActivityLog;
using CompanyPlatform.CRM.Services.ActivityLog;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/activitylog")]
    [ApiController]
    [Authorize]
    public class ActivityLogController : ControllerBase
    {
        private readonly IActivityLogService _activityLogService;

        public ActivityLogController(IActivityLogService activityLogService)
        {
            _activityLogService = activityLogService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var activityLogs = await _activityLogService.GetAllActivityLogsAsync();
            return Ok(activityLogs);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var activityLog = await _activityLogService.GetActivityLogByIdAsync(id);

            if (activityLog == null)
                return NotFound();

            return Ok(activityLog);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ActivityLogDto activityLogDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _activityLogService.CreateActivityLogAsync(activityLogDto);

            return CreatedAtAction(nameof(GetById),
                new { id = result.ActivityLogId },
                result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ActivityLogDto activityLogDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _activityLogService.UpdateActivityLogAsync(id, activityLogDto);

            if (!updated)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _activityLogService.DeleteActivityLogAsync(id);

            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }
}