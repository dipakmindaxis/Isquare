using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO.SalesActivity;
using CompanyPlatform.CRM.Services.SalesActivity;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SalesActivityController : ControllerBase
    {
        private readonly ISalesActivityService _salesActivityService;

        public SalesActivityController(ISalesActivityService salesActivityService)
        {
            _salesActivityService = salesActivityService;
        }

        // GET: api/SalesActivity
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _salesActivityService.GetAllSalesActivitiesAsync();
            return Ok(data);
        }

        // GET: api/SalesActivity/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _salesActivityService.GetSalesActivityByIdAsync(id);

            if (data == null)
            {
                return NotFound(new { Message = $"Sales Activity with ID {id} not found." });
            }

            return Ok(data);
        }

        // POST: api/SalesActivity
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSalesActivityDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Extract current user id if available
            if (!dto.CreatedBy.HasValue)
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(userIdClaim, out int uid))
                {
                    dto.CreatedBy = uid;
                }
            }

            var result = await _salesActivityService.CreateSalesActivityAsync(dto);

            return CreatedAtAction(nameof(GetById), new { id = result.ActivityId }, result);
        }

        // PUT: api/SalesActivity/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSalesActivityDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!dto.UpdatedBy.HasValue)
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(userIdClaim, out int uid))
                {
                    dto.UpdatedBy = uid;
                }
            }

            var result = await _salesActivityService.UpdateSalesActivityAsync(id, dto);

            if (result == null)
            {
                return NotFound(new { Message = $"Sales Activity with ID {id} not found." });
            }

            return Ok(result);
        }

        // DELETE: api/SalesActivity/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _salesActivityService.DeleteSalesActivityAsync(id);

            if (!success)
            {
                return NotFound(new { Message = $"Sales Activity with ID {id} not found or already deleted." });
            }

            return Ok(new { Message = "Sales Activity deleted successfully." });
        }
    }
}
