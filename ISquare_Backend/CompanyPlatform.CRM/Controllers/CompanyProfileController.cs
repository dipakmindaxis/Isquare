using CompanyPlatform.CRM.DTO.CompanyProfile;
using CompanyPlatform.CRM.Services.CompanyProfile;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/company-profile")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class CompanyProfileController : ControllerBase
    {
        private readonly ICompanyProfileService _service;
        private readonly ILogger<CompanyProfileController> _logger;

        public CompanyProfileController(
            ICompanyProfileService service,
            ILogger<CompanyProfileController> logger)
        {
            _service = service;
            _logger = logger;
        }

        // GET: api/company-profile
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var profiles = await _service.GetAllAsync();
            return Ok(profiles);
        }

        // GET: api/company-profile/1
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var profile = await _service.GetByIdAsync(id);

            if (profile == null)
            {
                return NotFound(new
                {
                    Message = "Company profile not found."
                });
            }

            return Ok(profile);
        }

        // POST: api/company-profile
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CompanyProfileDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = await _service.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = created.CompanyProfileId },
                    created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { Message = ex.Message });
            }
        }

        // PUT: api/company-profile/1
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id, [FromBody] CompanyProfileDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _service.UpdateAsync(id, dto);

                if (!updated)
                {
                    return NotFound(new
                    {
                        Message = "Company profile not found."
                    });
                }

                return Ok(new
                {
                    Message = "Company profile updated successfully."
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { Message = ex.Message });
            }
        }

        // DELETE: api/company-profile/1
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _service.DeleteAsync(id);

                if (!deleted)
                {
                    return NotFound(new
                    {
                        Message = "Company profile not found."
                    });
                }

                return Ok(new
                {
                    Message = "Company profile deleted successfully."
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { Message = ex.Message });
            }
        }
    }
}