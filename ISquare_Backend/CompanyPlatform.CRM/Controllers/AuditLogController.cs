using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO.AuditLog;
using CompanyPlatform.CRM.Services.AuditLog;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/auditlog")]
    [ApiController]
    [Authorize]
    public class AuditLogController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;

        public AuditLogController(IAuditLogService auditLogService)
        {
            _auditLogService = auditLogService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] string? tableName = null,
            [FromQuery] string? sortField = "auditDate",
            [FromQuery] string? sortOrder = "desc")
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            var result = await _auditLogService.GetAllAuditLogsAsync(page, pageSize, search, tableName, sortField, sortOrder);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var auditLog = await _auditLogService.GetAuditLogByIdAsync(id);

            if (auditLog == null)
                return NotFound();

            return Ok(auditLog);
        }
    }
}