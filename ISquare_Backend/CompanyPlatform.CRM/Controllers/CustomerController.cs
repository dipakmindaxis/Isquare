using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO.Customer;
using CompanyPlatform.CRM.Services.Customer;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerService;
        private readonly ILogger<CustomerController> _logger;

        public CustomerController(ICustomerService customerService, ILogger<CustomerController> logger)
        {
            _customerService = customerService;
            _logger = logger;
        }

        [HttpGet("next-code")]
        public async Task<IActionResult> GetNextCustomerCode()
        {
            _logger.LogInformation("Generating next available Customer Code.");
            var nextCode = await _customerService.GetNextCustomerCodeAsync();
            return Ok(new { customerCode = nextCode });
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Fetching all Customer records.");

            var customers = await _customerService.GetAllCustomersAsync();

            return Ok(customers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("Fetching Customer with ID: {Id}", id);

            var customer = await _customerService.GetCustomerByIdAsync(id);

            if (customer == null)
            {
                return NotFound(new
                {
                    Message = "Customer not found."
                });
            }

            return Ok(customer);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CustomerCreateDto customerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdCustomer = await _customerService.CreateCustomerAsync(customerDto);

            return Ok(createdCustomer);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CustomerUpdateDto customerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _customerService.UpdateCustomerAsync(id, customerDto);

                if (!updated)
                {
                    return NotFound(new
                    {
                        Message = "Customer not found."
                    });
                }

                return Ok(new
                {
                    Message = "Customer updated successfully."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _customerService.DeleteCustomerAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message = "Customer not found."
                });
            }

            return Ok(new
            {
                Message = "Customer deleted successfully."
            });
        }

        [HttpGet("{id}/addresses")]
        public async Task<IActionResult> GetCustomerAddresses(int id)
        {
            var addresses = await _customerService.GetCustomerAddressesAsync(id);
            return Ok(addresses);
        }

        [HttpGet("{id}/validate-address/{addressId}")]
        [HttpPost("{id}/validate-address/{addressId}")]
        public async Task<IActionResult> ValidateAddress(int id, int addressId)
        {
            var isValid = await _customerService.ValidateAddressOwnershipAsync(id, addressId);

            if (!isValid)
            {
                return BadRequest(new
                {
                    IsValid = false,
                    Message = $"Address {addressId} does not belong to Customer {id}.",
                    CustomerId = id,
                    AddressId = addressId
                });
            }

            return Ok(new
            {
                IsValid = true,
                Message = $"Address {addressId} belongs to Customer {id}.",
                CustomerId = id,
                AddressId = addressId
            });
        }
    }
}
