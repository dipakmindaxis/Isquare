using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.CRM.Services.CompanyVisit;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CompanyVisitController : ControllerBase
    {
        private readonly ICompanyVisitService _companyVisitService;

        public CompanyVisitController(ICompanyVisitService companyVisitService)
        {
            _companyVisitService = companyVisitService;
        }

        // GET: api/CompanyVisit
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CompanyVisitDto>>> GetAll()
        {
            var visits = await _companyVisitService.GetAllCompanyVisitsAsync();
            return Ok(visits);
        }

        // GET: api/CompanyVisit/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CompanyVisitDto>> GetById(int id)
        {
            var visit = await _companyVisitService.GetCompanyVisitByIdAsync(id);

            if (visit == null)
                return NotFound(new { message = "Company Visit not found." });

            return Ok(visit);
        }

        // POST: api/CompanyVisit
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CompanyVisitDto companyVisitDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdVisit = await _companyVisitService.CreateCompanyVisitAsync(companyVisitDto);

            return Ok(new
            {
                message = "Company Visit created successfully.",
                data = createdVisit
            });
        }

        // PUT: api/CompanyVisit/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CompanyVisitDto companyVisitDto)
        {
            if (id != companyVisitDto.VisitId)
                return BadRequest(new { message = "Company Visit ID mismatch." });

            var updated = await _companyVisitService.UpdateCompanyVisitAsync(id, companyVisitDto);

            if (!updated)
                return NotFound(new { message = "Company Visit not found." });

            return Ok(new
            {
                message = "Company Visit updated successfully."
            });
        }

        // DELETE: api/CompanyVisit/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _companyVisitService.DeleteCompanyVisitAsync(id);

            if (!deleted)
                return NotFound(new { message = "Company Visit not found." });

            return Ok(new
            {
                message = "Company Visit deleted successfully."
            });
        }
    }
}