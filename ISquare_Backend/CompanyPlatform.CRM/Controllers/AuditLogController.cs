using CompanyPlatform.CRM.Services.AuditLog;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/auditlog")]
    [ApiController]
    [Authorize(Roles = "Admin,Administrator,SuperAdmin")]
    public class AuditLogController : ControllerBase
    {
        private static readonly HashSet<string> AllowedSortFields = new(StringComparer.OrdinalIgnoreCase)
        {
            "auditdate",
            "tablename",
            "action",
            "employeename",
            "recordid",
            "userid",
            "companyid"
        };

        private readonly IAuditLogService _auditLogService;
        private readonly ILogger<AuditLogController> _logger;

        public AuditLogController(
            IAuditLogService auditLogService,
            ILogger<AuditLogController> logger)
        {
            _auditLogService = auditLogService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] string? tableName = null,
            [FromQuery] string? action = null,
            [FromQuery] int? userId = null,
            [FromQuery] int? recordId = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] string? sortField = "auditDate",
            [FromQuery] string? sortOrder = "desc")
        {
            var validationError = ValidateFilterParameters(userId, recordId, fromDate, toDate, sortField, sortOrder);
            if (validationError != null)
                return BadRequest(new { message = validationError });

            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            try
            {
                var result = await _auditLogService.GetAllAuditLogsAsync(
                    page, pageSize, search, tableName, action, userId, recordId, fromDate, toDate, sortField, sortOrder);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching audit logs.");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while fetching audit logs." });
            }
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary(
            [FromQuery] string? search = null,
            [FromQuery] string? tableName = null,
            [FromQuery] string? action = null,
            [FromQuery] int? userId = null,
            [FromQuery] int? recordId = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var validationError = ValidateFilterParameters(userId, recordId, fromDate, toDate, null, null);
            if (validationError != null)
                return BadRequest(new { message = validationError });

            try
            {
                var summary = await _auditLogService.GetAuditLogSummaryAsync(
                    search, tableName, action, userId, recordId, fromDate, toDate);
                return Ok(summary);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching audit log summary.");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while fetching audit log summary." });
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            if (id <= 0)
                return BadRequest(new { message = "Invalid audit log ID." });

            try
            {
                var auditLog = await _auditLogService.GetAuditLogByIdAsync(id);
                if (auditLog == null)
                    return NotFound(new { message = $"Audit log with ID {id} not found." });

                return Ok(auditLog);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching audit log with ID {AuditLogId}.", id);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while fetching audit log details." });
            }
        }

        private static string? ValidateFilterParameters(
            int? userId,
            int? recordId,
            DateTime? fromDate,
            DateTime? toDate,
            string? sortField,
            string? sortOrder)
        {
            if (userId.HasValue && userId.Value < 0)
                return "userId must be a non-negative integer.";

            if (recordId.HasValue && recordId.Value < 0)
                return "recordId must be a non-negative integer.";

            if (fromDate.HasValue && toDate.HasValue && fromDate.Value > toDate.Value)
                return "fromDate cannot be greater than toDate.";

            if (!string.IsNullOrWhiteSpace(sortField) && !AllowedSortFields.Contains(sortField.Trim()))
                return $"Invalid sortField '{sortField}'. Allowed values: {string.Join(", ", AllowedSortFields)}.";

            if (!string.IsNullOrWhiteSpace(sortOrder) &&
                !string.Equals(sortOrder.Trim(), "asc", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(sortOrder.Trim(), "desc", StringComparison.OrdinalIgnoreCase))
            {
                return "sortOrder must be 'asc' or 'desc'.";
            }

            return null;
        }
    }
}
