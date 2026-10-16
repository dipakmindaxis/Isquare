using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using CompanyPlatform.CRM.DTO.CustomerType;
using CompanyPlatform.CRM.Services.CustomerType;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/customer-type")]
    [ApiController]
    [Authorize]
    public class CustomerTypeController : ControllerBase
    {
        private readonly ICustomerTypeService _customerTypeService;
        private readonly ILogger<CustomerTypeController> _logger;

        public CustomerTypeController(
            ICustomerTypeService customerTypeService,
            ILogger<CustomerTypeController> logger)
        {
            _customerTypeService = customerTypeService;
            _logger = logger;
        }


        // ==========================================
        // GET ALL
        // ==========================================
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllCustomerTypes()
        {
            _logger.LogInformation(
                "API endpoint called: GetAllCustomerTypes");

            var customerTypes =
                await _customerTypeService
                    .GetAllCustomerTypesAsync();

            return Ok(customerTypes);
        }


        // ==========================================
        // GET BY ID
        // ==========================================
        [HttpGet("{id}")]
        public async Task<IActionResult>
            GetCustomerTypeById(int id)
        {
            _logger.LogInformation(
                "API endpoint called: GetCustomerTypeById for ID: {Id}",
                id);

            var customerType =
                await _customerTypeService
                    .GetCustomerTypeByIdAsync(id);

            if (customerType == null)
            {
                _logger.LogWarning(
                    "Customer Type not found for ID: {Id}",
                    id);

                return NotFound(new
                {
                    message = "Customer Type not found."
                });
            }

            return Ok(customerType);
        }


        // ==========================================
        // CREATE
        // ==========================================
        [HttpPost]
        public async Task<IActionResult>
            CreateCustomerType(
                [FromBody] CustomerTypeDto dto)
        {
            _logger.LogInformation(
                "API endpoint called: CreateCustomerType with Name: {CustomerTypeName}",
                dto.CustomerTypeName);

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var customerType =
                await _customerTypeService
                    .CreateCustomerTypeAsync(dto);

            return Ok(new
            {
                message =
                    $"Customer Type '{customerType.CustomerTypeName}' created successfully.",

                customerType
            });
        }


        // ==========================================
        // UPDATE
        // ==========================================
        [HttpPut("{id}")]
        public async Task<IActionResult>
            UpdateCustomerType(
                int id,
                [FromBody] CustomerTypeDto dto)
        {
            _logger.LogInformation(
                "API endpoint called: UpdateCustomerType for ID: {Id}",
                id);

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result =
                await _customerTypeService
                    .UpdateCustomerTypeAsync(id, dto);

            if (!result)
            {
                _logger.LogWarning(
                    "Customer Type not found for ID: {Id}",
                    id);

                return NotFound(new
                {
                    message = "Customer Type not found."
                });
            }

            return Ok(new
            {
                message =
                    "Customer Type updated successfully."
            });
        }


        // ==========================================
        // DELETE
        // ==========================================
        [HttpDelete("{id}")]
        public async Task<IActionResult>
            DeleteCustomerType(int id)
        {
            _logger.LogInformation(
                "API endpoint called: DeleteCustomerType for ID: {Id}",
                id);

            var result =
                await _customerTypeService
                    .DeleteCustomerTypeAsync(id);

            if (!result)
            {
                _logger.LogWarning(
                    "Customer Type not found for ID: {Id}",
                    id);

                return NotFound(new
                {
                    message = "Customer Type not found."
                });
            }

            return Ok(new
            {
                message =
                    "Customer Type deleted successfully."
            });
        }
    }
}