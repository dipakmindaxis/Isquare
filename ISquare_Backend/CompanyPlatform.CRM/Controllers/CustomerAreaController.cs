using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.CustomerArea;
using CompanyPlatform.CRM.Services.CustomerArea;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/customer-area")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class CustomerAreaController : ControllerBase
    {
        private readonly ICustomerAreaService _customerAreaService;
        private readonly ILogger<CustomerAreaController> _logger;

        public CustomerAreaController(ICustomerAreaService customerAreaService,ILogger<CustomerAreaController> logger)
        {
            _customerAreaService = customerAreaService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Fetching all Customer Area records.");

            var customerAreas =await _customerAreaService.GetAllCustomerAreasAsync();

            return Ok(customerAreas);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("Fetching Customer Area with ID: {Id}",id);

            var customerArea =await _customerAreaService.GetCustomerAreaByIdAsync(id);

            if (customerArea == null)
            {
                return NotFound(new
                {
                    Message = "Customer Area not found."
                });
            }

            return Ok(customerArea);
        }

        [HttpPost]public async Task<IActionResult> Create([FromBody] CustomerAreaDto customerAreaDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdCustomerArea =await _customerAreaService.CreateCustomerAreaAsync(customerAreaDto);

            return Ok(createdCustomerArea);
        }

        [HttpPut("{id}")]public async Task<IActionResult> Update(int id,[FromBody] CustomerAreaDto customerAreaDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated =await _customerAreaService.UpdateCustomerAreaAsync(id, customerAreaDto);

            if (!updated)
            {
                return NotFound(new
                {
                    Message = "Customer Area not found."
                });
            }

            return Ok(new
            {
                Message = "Customer Area updated successfully."
            });
        }

        [HttpDelete("{id}")]public async Task<IActionResult> Delete(int id)
        {
            var deleted =await _customerAreaService.DeleteCustomerAreaAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message = "Customer Area not found."
                });
            }

            return Ok(new
            {
                Message = "Customer Area deleted successfully."
            });
        }
    }
}