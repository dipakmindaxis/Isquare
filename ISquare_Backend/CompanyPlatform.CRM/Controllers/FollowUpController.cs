using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.CRM.Services;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using CompanyPlatform.CRM.DTO.Meeting;
using CompanyPlatform.CRM.VisitType;
using CompanyPlatform.CRM.DTO.FollowUp;
using CompanyPlatform.CRM.Services.FollowUp;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FollowUpController : ControllerBase
    {
        private readonly IFollowUpService _followUpService;

        public FollowUpController(IFollowUpService followUpService)
        {
            _followUpService = followUpService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var followUps = await _followUpService.GetAllFollowUpsAsync();
            return Ok(followUps);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var followUp = await _followUpService.GetFollowUpByIdAsync(id);

            if (followUp == null)
                return NotFound();

            return Ok(followUp);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FollowUpDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _followUpService.CreateFollowUpAsync(dto);

            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] FollowUpDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _followUpService.UpdateFollowUpAsync(id, dto);

            if (!updated)
                return NotFound();

            return Ok("FollowUp updated successfully.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _followUpService.DeleteFollowUpAsync(id);

            if (!deleted)
                return NotFound();

            return Ok("FollowUp deleted successfully.");
        }
    }
}