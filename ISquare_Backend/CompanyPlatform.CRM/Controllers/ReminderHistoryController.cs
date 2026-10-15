using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.Core.DTO;
using CompanyPlatform.Core.Services;
using CompanyPlatform.Core.DTO.Meeting;
using CompanyPlatform.CRM.Services;

namespace CompanyPlatform.Core.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReminderHistoryController : ControllerBase
    {
        private readonly IReminderHistoryService _service;

        public ReminderHistoryController(IReminderHistoryService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(ReminderHistoryDto dto)
        {
            var result = await _service.CreateAsync(dto);

            return result ? Ok("Reminder History Created Successfully")
                          : BadRequest();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ReminderHistoryDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);

            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);

            return result ? Ok("Reminder History Deleted Successfully")
                          : NotFound();
        }
    }
}