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
            string? sortField,
            string? sortOrder);

        Task<AuditLogDto?> GetAuditLogByIdAsync(int id);
    }
}

//using CompanyPlatform.CRM.DTO.AuditLog;
//using CompanyPlatform.CRM.DTO;
//using CompanyPlatform.CRM.DTO.AuditLog;

//namespace CompanyPlatform.CRM.Services.AuditLog
//{
//    public interface IAuditLogService
//    {
//        Task<PaginatedResult<AuditLogDto>> GetAllAuditLogsAsync(int page, int pageSize, string? search, string? tableName, string? sortField, string? sortOrder);
//        Task<AuditLogDto> GetAuditLogByIdAsync(int id);
//    }
//}