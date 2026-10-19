using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Director;
using CompanyPlatform.CRM.Services.Director;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/director")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class DirectorController : ControllerBase
    {
        private readonly IDirectorService _directorService;
        private readonly ILogger<DirectorController> _logger;

        public DirectorController(
            IDirectorService directorService,
            ILogger<DirectorController> logger)
        {
            _directorService = directorService;
            _logger = logger;
        }

                [HttpGet("active")]
        [AllowAnonymous]
        public async Task<IActionResult> GetActive()
        {
            var directors = (await _directorService.GetAllDirectorsAsync())
                .Where(d => d.IsActive && !d.IsDeleted);

            return Ok(directors);
        }
[HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Fetching all Director records.");

            var directors =
                await _directorService.GetAllDirectorsAsync();

            return Ok(directors);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var director =
                await _directorService.GetDirectorByIdAsync(id);

            if (director == null)
            {
                return NotFound(new
                {
                    Message = "Director not found."
                });
            }

            return Ok(director);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] DirectorDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (string.IsNullOrWhiteSpace(dto.DirectorName))
            {
                return BadRequest(new
                {
                    Message = "Director name is required."
                });
            }

            var createdDirector =
                await _directorService.CreateDirectorAsync(dto);

            return Ok(createdDirector);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] DirectorDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (string.IsNullOrWhiteSpace(dto.DirectorName))
            {
                return BadRequest(new
                {
                    Message = "Director name is required."
                });
            }

            var updated =
                await _directorService.UpdateDirectorAsync(id, dto);

            if (!updated)
            {
                return NotFound(new
                {
                    Message = "Director not found."
                });
            }

            return Ok(new
            {
                Message = "Director updated successfully."
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted =
                await _directorService.DeleteDirectorAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message = "Director not found."
                });
            }

            return Ok(new
            {
                Message = "Director deleted successfully."
            });
        }
    }
}
