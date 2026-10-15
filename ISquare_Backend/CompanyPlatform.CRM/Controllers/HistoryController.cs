using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CompanyPlatform.CRM.DTO.History;
using CompanyPlatform.CRM.Services.History;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/history")]
    [ApiController]
    [Authorize]
    public class HistoryController : ControllerBase
    {
        private readonly IHistoryService _historyService;

        public HistoryController(IHistoryService historyService)
        {
            _historyService = historyService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var history = await _historyService.GetAllHistoryAsync();
            return Ok(history);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var history = await _historyService.GetHistoryByIdAsync(id);

            if (history == null)
                return NotFound();

            return Ok(history);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] HistoryDto historyDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _historyService.CreateHistoryAsync(historyDto);

            return CreatedAtAction(nameof(GetById),
                new { id = result.HistoryId },
                result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] HistoryDto historyDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _historyService.UpdateHistoryAsync(id, historyDto);

            if (!updated)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _historyService.DeleteHistoryAsync(id);

            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }
}