using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.SalesCoordinator;
using CompanyPlatform.CRM.Services.SalesCoordinator;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/sales-coordinator")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class SalesCoordinatorController : ControllerBase
    {
        private readonly ISalesCoordinatorService _service;
        private readonly ILogger<SalesCoordinatorController> _logger;

        public SalesCoordinatorController(
            ISalesCoordinatorService service,
            ILogger<SalesCoordinatorController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation(
                "Fetching all Sales Coordinator records.");

            var coordinators =
                await _service.GetAllSalesCoordinatorsAsync();

            return Ok(coordinators);
        }

        // Used by the Customer Master assignment dropdown.
        [HttpGet("active")]
        [AllowAnonymous]
        public async Task<IActionResult> GetActive()
        {
            var coordinators =
                await _service.GetActiveSalesCoordinatorsAsync();

            return Ok(coordinators);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var coordinator =
                await _service.GetSalesCoordinatorByIdAsync(id);

            if (coordinator == null)
            {
                return NotFound(new
                {
                    Message = "Sales Coordinator not found."
                });
            }

            return Ok(coordinator);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] SalesCoordinatorDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (string.IsNullOrWhiteSpace(dto.SalesCoordinatorName))
            {
                return BadRequest(new
                {
                    Message = "Sales Coordinator name is required."
                });
            }

            var created =
                await _service.CreateSalesCoordinatorAsync(dto);

            return Ok(created);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] SalesCoordinatorDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (string.IsNullOrWhiteSpace(dto.SalesCoordinatorName))
            {
                return BadRequest(new
                {
                    Message = "Sales Coordinator name is required."
                });
            }

            var updated =
                await _service.UpdateSalesCoordinatorAsync(id, dto);

            if (!updated)
            {
                return NotFound(new
                {
                    Message = "Sales Coordinator not found."
                });
            }

            return Ok(new
            {
                Message = "Sales Coordinator updated successfully."
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted =
                await _service.DeleteSalesCoordinatorAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message = "Sales Coordinator not found."
                });
            }

            return Ok(new
            {
                Message = "Sales Coordinator deleted successfully."
            });
        }
    }
}