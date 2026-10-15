//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using CompanyPlatform.CRM.DTO.NotificationLogs;
////using MindAxis.Services.Company;

//namespace MindAxis.Controllers
//{
//    [Route("api/company")]
//    [ApiController]
//    [Authorize(Roles = "Admin")]
//    public class CompanyController : ControllerBase
//    {
//        private readonly ICompanyService _companyService;
//        private readonly ILogger<CompanyController> _logger;

//        public CompanyController(ICompanyService companyService, ILogger<CompanyController> logger)
//        {
//            _companyService = companyService;
//            _logger = logger;
//        }

//        [HttpGet]
//        public async Task<IActionResult> GetAll()
//        {
//            _logger.LogInformation("Fetching all Company records.");

//            var companies = await _companyService.GetAllCompaniesAsync();

//            return Ok(companies);
//        }

//        [HttpGet("{id}")]
//        public async Task<IActionResult> GetById(int id)
//        {
//            _logger.LogInformation("Fetching Company with ID: {Id}", id);

//            var company = await _companyService.GetCompanyByIdAsync(id);

//            if (company == null)
//            {
//                return NotFound(new
//                {
//                    Message = "Company not found."
//                });
//            }

//            return Ok(company);
//        }

//        [HttpPost]
//        public async Task<IActionResult> Create([FromBody] CompanyDto companyDto)
//        {
//            if (!ModelState.IsValid)
//                return BadRequest(ModelState);

//            var createdCompany = await _companyService.CreateCompanyAsync(companyDto);

//            return Ok(createdCompany);
//        }

//        [HttpPut("{id}")]
//        public async Task<IActionResult> Update(int id, [FromBody] CompanyDto companyDto)
//            {
//            if (!ModelState.IsValid)
//                return BadRequest(ModelState);
                
//            var updated = await _companyService.UpdateCompanyAsync(id, companyDto);

//            if (!updated)
//            {
//                return NotFound(new
//                {
//                    Message = "Company not found."
//                });
//            }

//            return Ok(new
//            {
//                Message = "Company updated successfully."
//            });
//        }

//        [HttpDelete("{id}")]
//        public async Task<IActionResult> Delete(int id)
//        {
//            var deleted = await _companyService.DeleteCompanyAsync(id);

//            if (!deleted)
//            {
//                return NotFound(new
//                {
//                    Message = "Company not found."
//                });
//            }

//            return Ok(new
//            {
//                Message = "Company deleted successfully."
//            });
//        }
//    }
//}