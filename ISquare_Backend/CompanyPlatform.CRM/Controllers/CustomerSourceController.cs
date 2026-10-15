using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.CustomerSource;
using CompanyPlatform.CRM.Services.CustomerSource;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/customer-source")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class CustomerSourceController : ControllerBase
    {
        private readonly ICustomerSourceService _customerSourceService;
        private readonly ILogger<CustomerSourceController> _logger;

        public CustomerSourceController(ICustomerSourceService customerSourceService,ILogger<CustomerSourceController> logger)
        {
            _customerSourceService = customerSourceService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Fetching all Customer Source records.");

            var customerSources =await _customerSourceService.GetAllCustomerSourcesAsync();

            return Ok(customerSources);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("Fetching Customer Source with ID: {Id}",id);

            var customerSource =await _customerSourceService.GetCustomerSourceByIdAsync(id);

            if (customerSource == null)
            {
                return NotFound(new
                {
                    Message = "Customer Source not found."
                });
            }

            return Ok(customerSource);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CustomerSourceDto customerSourceDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdCustomerSource =await _customerSourceService.CreateCustomerSourceAsync(customerSourceDto);

            return Ok(createdCustomerSource);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id,[FromBody] CustomerSourceDto customerSourceDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated =await _customerSourceService.UpdateCustomerSourceAsync(id, customerSourceDto);

            if (!updated)
            {
                return NotFound(new
                {
                    Message = "Customer Source not found."
                });
            }

            return Ok(new
            {
                Message = "Customer Source updated successfully."
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted =await _customerSourceService.DeleteCustomerSourceAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message = "Customer Source not found."
                });
            }

            return Ok(new
            {
                Message = "Customer Source deleted successfully."
            });
        }
    }
}