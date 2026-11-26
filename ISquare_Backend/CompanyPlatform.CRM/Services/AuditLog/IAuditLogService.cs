using CompanyPlatform.CRM.DTO;
using CompanyPlatform.CRM.DTO.AuditLog;

namespace CompanyPlatform.CRM.Services.AuditLog
{
    public interface IAuditLogService
    {
        Task<PaginatedResult<AuditLogDto>> GetAllAuditLogsAsync(
            int page,
            int pageSize,
            string? search,
            string? tableName,
            string? action,
            int? userId,
            int? recordId,
            DateTime? fromDate,
            DateTime? toDate,
            string? sortField,
            string? sortOrder);

        Task<AuditLogSummaryDto> GetAuditLogSummaryAsync(
            string? search,
            string? tableName,
            string? action,
            int? userId,
            int? recordId,
            DateTime? fromDate,
            DateTime? toDate);

        Task<AuditLogDto?> GetAuditLogByIdAsync(int id);
    }
}
