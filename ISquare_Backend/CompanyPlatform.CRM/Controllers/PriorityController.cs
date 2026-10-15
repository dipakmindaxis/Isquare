using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.Core.Services;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using CompanyPlatform.Core.DTO.PriorityMaster;

namespace CompanyPlatform.Core.Controllers
{

    [Route("api/priority")]
    [ApiController]
    [Authorize]
    public class PriorityController : ControllerBase
    {
        private readonly IPriorityService _priorityService;
        private readonly ILogger<PriorityController> _logger;
        public PriorityController(IPriorityService priorityService, ILogger<PriorityController> logger)
        {
            _priorityService = priorityService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPriorities()
        {
            _logger.LogInformation("API endpoint called: GetAllPriorities");

            var priorities = await _priorityService.GetAllPrioritiesAsync();
            return Ok(priorities);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPriorityById(int id)
        {
            _logger.LogInformation("API endpoint called: GetPriorityById for ID: {Id}", id);

            var priority = await _priorityService.GetPriorityByIdAsync(id);

            if (priority == null)
            {
                _logger.LogWarning("Priority not found for ID: {Id}", id);

                return NotFound(new
                {
                    message = "Priority not found."
                });
            }
            return Ok(priority);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePriority([FromBody] PriorityDto dto)
        {
            _logger.LogInformation("API endpoint called: CreatePriority with Name: {PriorityName}", dto.PriorityName);

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var priority = await _priorityService.CreatePriorityAsync(dto);

            return Ok(new
            {
                message = $"Priority '{priority.PriorityName}' created successfully.",
                priority
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePriority(int id, [FromBody] PriorityDto dto)
        {
            _logger.LogInformation("API endpoint called: UpdatePriority for ID: {Id}", id);

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _priorityService.UpdatePriorityAsync(id, dto);

            if (!result)
            {
                _logger.LogWarning("Priority not found for ID: {Id}", id);

                return NotFound(new
                {
                    message = "Priority not found."
                });
            }
            return Ok(new
            {
                message = "Priority updated successfully."
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePriority(int id)
        {
            _logger.LogInformation("API endpoint called: DeletePriority for ID: {Id}", id);

            var result = await _priorityService.DeletePriorityAsync(id);

            if (!result)
            {
                _logger.LogWarning("Priority not found for ID: {Id}", id);

                return NotFound(new
                {
                    message = "Priority not found."
                });
            }
            return Ok(new
            {
                message = "Priority deleted successfully."
            });
        }
    }
}
