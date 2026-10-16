using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using CompanyPlatform.CRM.DTO.CompanyCategory;
using CompanyPlatform.CRM.Services.CustomerCategory;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/customer-category")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class CustomerCategoryController : ControllerBase
    {
        private readonly ICustomerCategoryService
            _customerCategoryService;

        private readonly ILogger<CustomerCategoryController>
            _logger;

        public CustomerCategoryController(
            ICustomerCategoryService customerCategoryService,
            ILogger<CustomerCategoryController> logger)
        {
            _customerCategoryService =
                customerCategoryService;

            _logger = logger;
        }


        // GET: api/customer-category
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation(
                "Fetching all Customer Category records.");

            var categories =
                await _customerCategoryService
                    .GetAllCustomerCategoriesAsync();

            return Ok(categories);
        }


        // GET: api/customer-category/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation(
                "Fetching Customer Category with ID: {Id}",
                id);

            var category =
                await _customerCategoryService
                    .GetCustomerCategoryByIdAsync(id);

            if (category == null)
            {
                return NotFound(new
                {
                    Message =
                        "Customer Category not found."
                });
            }

            return Ok(category);
        }


        // POST: api/customer-category
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CustomerCategoryDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created =
                await _customerCategoryService
                    .CreateCustomerCategoryAsync(dto);

            return Ok(created);
        }


        // PUT: api/customer-category/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] CustomerCategoryDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated =
                await _customerCategoryService
                    .UpdateCustomerCategoryAsync(
                        id,
                        dto);

            if (!updated)
            {
                return NotFound(new
                {
                    Message =
                        "Customer Category not found."
                });
            }

            return Ok(new
            {
                Message =
                    "Customer Category updated successfully."
            });
        }


        // DELETE: api/customer-category/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted =
                await _customerCategoryService
                    .DeleteCustomerCategoryAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message =
                        "Customer Category not found."
                });
            }

            return Ok(new
            {
                Message =
                    "Customer Category deleted successfully."
            });
        }
    }
}