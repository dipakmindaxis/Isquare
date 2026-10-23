using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Employee;
using CompanyPlatform.CRM.Services.Employee;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [Route("api/employees")]
    [ApiController]
    public class EmployeeController : ControllerBase
    {
        private readonly ICRMEmployeeService _employeeService;
        private readonly ILogger<EmployeeController> _logger;

        public EmployeeController(
            ICRMEmployeeService employeeService,
            ILogger<EmployeeController> logger)
        {
            _employeeService = employeeService;
            _logger = logger;
        }

        // GET: api/employee/next-code
        [HttpGet("next-code")]
        public async Task<IActionResult> GetNextEmployeeCode()
        {
            _logger.LogInformation("Generating next available Employee Code.");
            var nextCode = await _employeeService.GetNextEmployeeCodeAsync();
            return Ok(new { employeeCode = nextCode });
        }

        // GET: api/employee
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? role = null, [FromQuery] string? designation = null)
        {
            _logger.LogInformation("Fetching all Employee records.");
            var employees = await _employeeService.GetAllAsync();
            if (!string.IsNullOrWhiteSpace(role))
            {
                employees = employees.Where(e => e.DesignationName != null && e.DesignationName.Contains(role, StringComparison.OrdinalIgnoreCase));
            }
            if (!string.IsNullOrWhiteSpace(designation))
            {
                employees = employees.Where(e => e.DesignationName != null && e.DesignationName.Contains(designation, StringComparison.OrdinalIgnoreCase));
            }
            return Ok(employees);
        }

        // GET: api/employee/active
        [HttpGet("active")]
        public async Task<IActionResult> GetActive([FromQuery] string? role = null, [FromQuery] string? designation = null)
        {
            _logger.LogInformation("Fetching active Employee records for dropdown/selection.");
            var employees = await _employeeService.GetActiveAsync();
            if (!string.IsNullOrWhiteSpace(role))
            {
                employees = employees.Where(e => e.DesignationName != null && e.DesignationName.Contains(role, StringComparison.OrdinalIgnoreCase));
            }
            if (!string.IsNullOrWhiteSpace(designation))
            {
                employees = employees.Where(e => e.DesignationName != null && e.DesignationName.Contains(designation, StringComparison.OrdinalIgnoreCase));
            }
            return Ok(employees);
        }

        // GET: api/employee/by-designation/{designation}
        [HttpGet("by-designation/{designation}")]
        public async Task<IActionResult> GetByDesignation(string designation)
        {
            _logger.LogInformation("Fetching active Employee records with designation: {Designation}", designation);
            var employees = (await _employeeService.GetActiveAsync())
                .Where(e => e.DesignationName != null && e.DesignationName.Contains(designation, StringComparison.OrdinalIgnoreCase));
            return Ok(employees);
        }

        // GET: api/employee/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("Fetching Employee with ID: {Id}", id);
            var employee = await _employeeService.GetByIdAsync(id);

            if (employee == null)
            {
                return NotFound(new { message = $"Employee with ID {id} not found." });
            }

            return Ok(employee);
        }

        // GET: api/employee/by-code/EMP001
        [HttpGet("by-code/{code}")]
        public async Task<IActionResult> GetByCode(string code)
        {
            _logger.LogInformation("Fetching Employee with Code: {Code}", code);
            var employee = await _employeeService.GetByCodeAsync(code);

            if (employee == null)
            {
                return NotFound(new { message = $"Employee with code '{code}' not found." });
            }

            return Ok(employee);
        }

        // POST: api/employee
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEmployeeDto dto)
        {
            _logger.LogInformation("Creating new Employee.");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var created = await _employeeService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.ID }, created);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Validation failure while creating Employee.");
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while creating Employee.");
                var errorMsg = ex.InnerException != null ? $"{ex.Message} -> {ex.InnerException.Message}" : ex.Message;
                return StatusCode(500, new { message = errorMsg });
            }
        }

        // PUT: api/employee/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeDto dto)
        {
            _logger.LogInformation("Updating Employee with ID: {Id}", id);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var updated = await _employeeService.UpdateAsync(id, dto);

                if (!updated)
                {
                    return NotFound(new { message = $"Employee with ID {id} not found." });
                }

                return Ok(new { message = "Employee updated successfully." });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Validation failure while updating Employee.");
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while updating Employee.");
                var errorMsg = ex.InnerException != null ? $"{ex.Message} -> {ex.InnerException.Message}" : ex.Message;
                return StatusCode(500, new { message = errorMsg });
            }
        }

        // DELETE: api/employee/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation("Deleting Employee with ID: {Id}", id);

            var deleted = await _employeeService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new { message = $"Employee with ID {id} not found." });
            }

            return Ok(new { message = $"Employee with ID {id} has been deactivated successfully." });
        }
    }
}
