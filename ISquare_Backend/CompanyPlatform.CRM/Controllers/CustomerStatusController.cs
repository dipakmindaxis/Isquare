using CompanyPlatform.CRM.DTO.CustomerStatus;
using CompanyPlatform.CRM.Services.CustomerStatus;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/customer-status")]
    [ApiController]
    [Authorize]
    public class CustomerStatusController : ControllerBase
    {
        private readonly ICustomerStatusService _customerStatusService;
        private readonly ILogger<CustomerStatusController> _logger;

        public CustomerStatusController(
            ICustomerStatusService customerStatusService,
            ILogger<CustomerStatusController> logger)
        {
            _customerStatusService = customerStatusService;
            _logger = logger;
        }


        // ==========================================
        // GET ALL
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetAllCustomerStatuses()
        {
            _logger.LogInformation(
                "API endpoint called: GetAllCustomerStatuses");

            var statuses =
                await _customerStatusService
                    .GetAllCustomerStatusesAsync();

            return Ok(statuses);
        }


        // ==========================================
        // GET BY ID
        // ==========================================
        [HttpGet("{id}")]
        public async Task<IActionResult>
            GetCustomerStatusById(int id)
        {
            _logger.LogInformation(
                "API endpoint called: GetCustomerStatusById for ID: {Id}",
                id);

            var status =
                await _customerStatusService
                    .GetCustomerStatusByIdAsync(id);

            if (status == null)
            {
                _logger.LogWarning(
                    "Customer Status not found for ID: {Id}",
                    id);

                return NotFound(new
                {
                    message = "Customer Status not found."
                });
            }

            return Ok(status);
        }


        // ==========================================
        // CREATE
        // ==========================================
        [HttpPost]
        public async Task<IActionResult>
            CreateCustomerStatus(
                [FromBody] CustomerStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _logger.LogInformation(
                "API endpoint called: CreateCustomerStatus with Name: {StatusName}",
                dto.StatusName);

            var status =
                await _customerStatusService
                    .CreateCustomerStatusAsync(dto);

            return Ok(new
            {
                message =
                    $"Customer Status '{status.StatusName}' created successfully.",

                status
            });
        }


        // ==========================================
        // UPDATE
        // ==========================================
        [HttpPut("{id}")]
        public async Task<IActionResult>
            UpdateCustomerStatus(
                int id,
                [FromBody] CustomerStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _logger.LogInformation(
                "API endpoint called: UpdateCustomerStatus for ID: {Id}",
                id);

            var result =
                await _customerStatusService
                    .UpdateCustomerStatusAsync(id, dto);

            if (!result)
            {
                return NotFound(new
                {
                    message = "Customer Status not found."
                });
            }

            return Ok(new
            {
                message =
                    "Customer Status updated successfully."
            });
        }


        // ==========================================
        // DELETE
        // ==========================================
        [HttpDelete("{id}")]
        public async Task<IActionResult>
            DeleteCustomerStatus(int id)
        {
            _logger.LogInformation(
                "API endpoint called: DeleteCustomerStatus for ID: {Id}",
                id);

            var result =
                await _customerStatusService
                    .DeleteCustomerStatusAsync(id);

            if (!result)
            {
                return NotFound(new
                {
                    message = "Customer Status not found."
                });
            }

            return Ok(new
            {
                message =
                    "Customer Status deleted successfully."
            });
        }
    }
}