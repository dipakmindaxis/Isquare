using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.CRM.Services.CompanyAddress;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CompanyAddressController : ControllerBase
    {
        private readonly ICompanyAddressService _companyAddressService;

        public CompanyAddressController(ICompanyAddressService companyAddressService)
        {
            _companyAddressService = companyAddressService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _companyAddressService.GetAllCompanyAddressesAsync();
            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _companyAddressService.GetCompanyAddressByIdAsync(id);

            if (data == null)
                return NotFound();

            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CompanyAddressDto companyAddressDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _companyAddressService.CreateCompanyAddressAsync(companyAddressDto);

            return CreatedAtAction(nameof(GetById), new { id = result.AddressId }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CompanyAddressDto companyAddressDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _companyAddressService.UpdateCompanyAddressAsync(id, companyAddressDto);

            if (!result)
                return NotFound();

            return Ok(new
            {
                Message = "Company Address updated successfully."
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _companyAddressService.DeleteCompanyAddressAsync(id);

            if (!result)
                return NotFound();

            return Ok(new
            {
                Message = "Company Address deleted successfully."
            });
        }
    }
}