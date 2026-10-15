using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.Core.DTO.Companies;
using CompanyPlatform.Core.Services.Companies;

namespace CompanyPlatform.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompaniessController : ControllerBase
    {
        private readonly ICompaniessService _companiesService;

        public CompaniessController(ICompaniessService companiesService)
        {
            _companiesService = companiesService;
        }

        // GET: api/Companies
        [HttpGet]
        public async Task<IActionResult> GetAllCompanies()
        {
            var companies = await _companiesService.GetAllCompaniesAsync();
            return Ok(companies);
        }

        // GET: api/Companies/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCompanyById(int id)
        {
            var company = await _companiesService.GetCompanyByIdAsync(id);

            if (company == null)
            {
                return NotFound(new
                {
                    Status = false,
                    Message = "Company not found."
                });
            }

            return Ok(company);
        }

        // POST: api/Companies
        [HttpPost]
        public async Task<IActionResult> CreateCompany(
            [FromBody] CompaniessDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _companiesService.CreateCompanyAsync(dto);

            return Ok(new
            {
                Status = true,
                Message = "Company created successfully.",
                Data = result
            });
        }

        // PUT: api/Companies/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCompany(
            int id,
            [FromBody] CompaniessDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _companiesService.UpdateCompanyAsync(id, dto);

            if (!updated)
            {
                return NotFound(new
                {
                    Status = false,
                    Message = "Company not found."
                });
            }

            return Ok(new
            {
                Status = true,
                Message = "Company updated successfully."
            });
        }

        // DELETE: api/Companies/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCompany(int id)
        {
            var deleted = await _companiesService.DeleteCompanyAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Status = false,
                    Message = "Company not found."
                });
            }

            return Ok(new
            {
                Status = true,
                Message = "Company deleted successfully."
            });
        }
    }
}