using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.CRM.Services.CompanyPhone;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CompanyPhoneController : ControllerBase
    {
        private readonly ICompanyPhoneService _companyPhoneService;

        public CompanyPhoneController(ICompanyPhoneService companyPhoneService)
        {
            _companyPhoneService = companyPhoneService;
        }

        // GET: api/CompanyPhone
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CompanyPhoneDto>>> GetAll()
        {
            var result = await _companyPhoneService.GetAllCompanyPhonesAsync();
            return Ok(result);
        }

        // GET: api/CompanyPhone/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CompanyPhoneDto>> GetById(int id)
        {
            var companyPhone = await _companyPhoneService.GetCompanyPhoneByIdAsync(id);

            if (companyPhone == null)
                return NotFound(new { message = "Company Phone not found." });

            return Ok(companyPhone);
        }

        // POST: api/CompanyPhone
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CompanyPhoneDto companyPhoneDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _companyPhoneService.CreateCompanyPhoneAsync(companyPhoneDto);

            return Ok(new
            {
                message = "Company Phone created successfully.",
                data = created
            });
        }

        // PUT: api/CompanyPhone/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CompanyPhoneDto companyPhoneDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (id != companyPhoneDto.PhoneId)
                return BadRequest(new { message = "Phone ID mismatch." });

            var updated = await _companyPhoneService.UpdateCompanyPhoneAsync(id, companyPhoneDto);

            if (!updated)
                return NotFound(new { message = "Company Phone not found." });

            return Ok(new
            {
                message = "Company Phone updated successfully."
            });
        }

        // DELETE: api/CompanyPhone/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _companyPhoneService.DeleteCompanyPhoneAsync(id);

            if (!deleted)
                return NotFound(new { message = "Company Phone not found." });

            return Ok(new
            {
                message = "Company Phone deleted successfully."
            });
        }
    }
}