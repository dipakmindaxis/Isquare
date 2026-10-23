using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.LevelMaster;
using CompanyPlatform.CRM.Services.LevelMaster;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [Route("api/levels")]
    [Route("api/level-master")]
    [ApiController]
    public class LevelMasterController : ControllerBase
    {
        private readonly ILevelMasterService _service;
        private readonly ILogger<LevelMasterController> _logger;

        public LevelMasterController(
            ILevelMasterService service,
            ILogger<LevelMasterController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var levels = await _service.GetAllAsync();
                return Ok(levels);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while fetching levels.");
                return StatusCode(500, new { message = "An error occurred while fetching levels." });
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var level = await _service.GetByIdAsync(id);
                if (level == null)
                    return NotFound(new { message = $"Level with ID {id} not found." });

                return Ok(level);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching level with ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while fetching level." });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateLevelMasterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.ID }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating level.");
                return StatusCode(500, new { message = "An error occurred while creating level." });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateLevelMasterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _service.UpdateAsync(id, dto);
                if (!updated)
                    return NotFound(new { message = $"Level with ID {id} not found." });

                return Ok(new { message = "Level updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating level with ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while updating level." });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _service.DeleteAsync(id);
                if (!deleted)
                    return NotFound(new { message = $"Level with ID {id} not found." });

                return Ok(new { message = "Level deleted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting level with ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while deleting level." });
            }
        }
    }
}
