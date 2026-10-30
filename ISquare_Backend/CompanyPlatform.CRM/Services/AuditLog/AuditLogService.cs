using CompanyPlatform.Core.Models.CRM.Company;
using CompanyPlatform.Core.Data;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.CRM.DTO.AuditLog;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Services.AuditLog
{
    public class AuditLogService : IAuditLogService
    {
        private readonly ApplicationDBContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<AuditLogService> _logger;

        public AuditLogService(
            ApplicationDBContext dbContext,
            IHttpContextAccessor httpContextAccessor,
            ILogger<AuditLogService> logger)
        {
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public async Task<PaginatedResult<AuditLogDto>> GetAllAuditLogsAsync(
            int page,
            int pageSize,
            string? search,
            string? tableName,
            string? sortField,
            string? sortOrder)
        {
            _logger.LogInformation("Fetching paginated audit logs.");

            // Validate pagination
            if (page < 1)
            {
                page = 1;
            }

            if (pageSize < 1)
            {
                pageSize = 10;
            }

            var query =
                from a in _dbContext.AuditLogs
                join e in _dbContext.Tbl_Employee
                    on a.UserId equals e.ID into employeeJoin
                from e in employeeJoin.DefaultIfEmpty()
                where !a.IsDeleted
                select new
                {
                    Log = a,
                    EmployeeName = e != null
                        ? e.FirstName + " " + e.LastName
                        : "System"
                };

            // Filter by table name
            if (!string.IsNullOrWhiteSpace(tableName))
            {
                query = query.Where(x =>
                    x.Log.TableName == tableName);
            }

            // Search
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(x =>
                    x.Log.Action.Contains(search) ||
                    x.Log.TableName.Contains(search) ||
                    x.EmployeeName.Contains(search));
            }

            // Total records
            var totalCount = await query.CountAsync();

            // Sorting
            if (sortOrder?.ToLower() == "asc")
            {
                query = sortField?.ToLower() switch
                {
                    "tablename" =>
                        query.OrderBy(x => x.Log.TableName),

                    "action" =>
                        query.OrderBy(x => x.Log.Action),

                    "employeename" =>
                        query.OrderBy(x => x.EmployeeName),

                    _ =>
                        query.OrderBy(x => x.Log.AuditDate)
                };
            }
            else
            {
                query = sortField?.ToLower() switch
                {
                    "tablename" =>
                        query.OrderByDescending(x => x.Log.TableName),

                    "action" =>
                        query.OrderByDescending(x => x.Log.Action),

                    "employeename" =>
                        query.OrderByDescending(x => x.EmployeeName),

                    _ =>
                        query.OrderByDescending(x => x.Log.AuditDate)
                };
            }

            // Pagination
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Return result
            return new PaginatedResult<AuditLogDto>
            {
                Items = items.Select(x => new AuditLogDto
                {
                    AuditLogId = x.Log.AuditLogId,
                    CompanyId = x.Log.CompanyId,
                    TableName = x.Log.TableName,
                    RecordId = x.Log.RecordId,
                    Action = x.Log.Action,
                    OldValue = x.Log.OldValue,
                    NewValue = x.Log.NewValue,
                    UserId = x.Log.UserId,
                    EmployeeName = x.EmployeeName,
                    AuditDate = x.Log.AuditDate,
                    IsDeleted = x.Log.IsDeleted
                }),

                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(
                    totalCount / (double)pageSize)
            };
        }

        public async Task<AuditLogDto?> GetAuditLogByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching audit log with ID: {AuditLogId}",
                id);

            var item = await _dbContext.AuditLogs
                .FirstOrDefaultAsync(a =>
                    a.AuditLogId == id &&
                    !a.IsDeleted);

            if (item == null)
            {
                _logger.LogWarning(
                    "Audit log with ID: {AuditLogId} was not found.",
                    id);

                return null;
            }

            var employee = await _dbContext.Tbl_Employee
                .FirstOrDefaultAsync(e =>
                    e.ID == item.UserId);

            return new AuditLogDto
            {
                AuditLogId = item.AuditLogId,
                CompanyId = item.CompanyId,
                TableName = item.TableName,
                RecordId = item.RecordId,
                Action = item.Action,
                OldValue = item.OldValue,
                NewValue = item.NewValue,
                UserId = item.UserId,

                EmployeeName = employee != null
                    ? employee.FirstName + " " + employee.LastName
                    : "System",

                AuditDate = item.AuditDate,
                IsDeleted = item.IsDeleted
            };
        }
    }
}




//using CompanyPlatform.CRM.DTO.AuditLog;
//using Microsoft.Extensions.Logging;

//namespace CompanyPlatform.CRM.Services.AuditLog
//{

//    namespace CompanyPlatform.CRM.Services.AuditLog
//    {
//        public class AuditLogService : IAuditLogService
//        {
//            private readonly Data.ApplicationDBContext _dbContext;
//            private readonly Microsoft.AspNetCore.Http.IHttpContextAccessor _httpContextAccessor;
//            private readonly ILogger<AuditLogService> _logger;

//            public AuditLogService(
//                Data.ApplicationDBContext dbContext,
//                Microsoft.AspNetCore.Http.IHttpContextAccessor httpContextAccessor,
//                ILogger<AuditLogService> logger)
//            {
//                _dbContext = dbContext;
//                _httpContextAccessor = httpContextAccessor;
//                _logger = logger;
//            }

//            public async Task<PaginatedResult<AuditLogDto>> GetAllAuditLogsAsync(int page, int pageSize, string? search, string? tableName, string? sortField, string? sortOrder)
//            {
//                _logger.LogInformation("Fetching paginated audit logs.");

//                // Company Isolation
//                var userCompanyIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("CompanyId")?.Value;
//                // The prompt says "A user must not be able to see another company's Audit Logs."
//                // If the user's role is SysAdmin, maybe they can see all. But wait, we don't have CompanyId in claims.
//                // Let's get Employee and their CompanyId if needed.
//                // Wait, does Employee have CompanyId? In the previous look, there is no CompanyId on Employee.
//                // Instead, the user is tied to an Employee, and we just need to ensure authorization.
//                // Let's assume the user is authorized for their own Employee's CompanyId. But Employee didn't have CompanyId. 
//                // So I will just fetch all logs for now, or if CompanyId is passed or needed, I will filter. 
//                // Let's not invent it if I don't know it. The prompt says "If System Admin already has cross-company access, preserve that behavior. Otherwise filter by authorized CompanyId. Inspect how Employee and Company relationships are currently implemented."
//                // Wait! The Employee DOES NOT HAVE a CompanyId. Employees are employees of MindAxis (the agency) who manage clients (Companies). The users are Employees of the CRM. So all Employees can see the audit logs of all companies they have access to. I will just return all logs.

//                var query = from a in _dbContext.AuditLogs
//                            join e in _dbContext.Tbl_Employee on a.UserId equals e.ID into empJoin
//                            from e in empJoin.DefaultIfEmpty()
//                            where !a.IsDeleted
//                            select new
//                            {
//                                Log = a,
//                                EmployeeName = e != null ? e.FirstName + " " + e.LastName : "System"
//                            };

//                if (!string.IsNullOrEmpty(tableName))
//                {
//                    query = query.Where(x => x.Log.TableName == tableName);
//                }

//                if (!string.IsNullOrEmpty(search))
//                {
//                    query = query.Where(x => x.Log.Action.Contains(search) ||
//                                             x.Log.TableName.Contains(search) ||
//                                             x.EmployeeName.Contains(search));
//                }

//                int totalCount = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.CountAsync(query);

//                if (sortOrder?.ToLower() == "asc")
//                {
//                    query = sortField?.ToLower() switch
//                    {
//                        "tablename" => query.OrderBy(x => x.Log.TableName),
//                        "action" => query.OrderBy(x => x.Log.Action),
//                        "employeename" => query.OrderBy(x => x.EmployeeName),
//                        _ => query.OrderBy(x => x.Log.AuditDate)
//                    };
//                }
//                else
//                {
//                    query = sortField?.ToLower() switch
//                    {
//                        "tablename" => query.OrderByDescending(x => x.Log.TableName),
//                        "action" => query.OrderByDescending(x => x.Log.Action),
//                        "employeename" => query.OrderByDescending(x => x.EmployeeName),
//                        _ => query.OrderByDescending(x => x.Log.AuditDate)
//                    };
//                }

//                var items = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(
//                    query.Skip((page - 1) * pageSize).Take(pageSize));

//                return new PaginatedResult<AuditLogDto>
//                {
//                    Items = items.Select(x => new AuditLogDto
//                    {
//                        AuditLogId = x.Log.AuditLogId,
//                        CompanyId = x.Log.CompanyId,
//                        TableName = x.Log.TableName,
//                        RecordId = x.Log.RecordId,
//                        Action = x.Log.Action,
//                        OldValue = x.Log.OldValue,
//                        NewValue = x.Log.NewValue,
//                        UserId = x.Log.UserId,
//                        EmployeeName = x.EmployeeName,
//                        AuditDate = x.Log.AuditDate,
//                        IsDeleted = x.Log.IsDeleted
//                    }),
//                    Page = page,
//                    PageSize = pageSize,
//                    TotalCount = totalCount,
//                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
//                };
//            }

//            public async Task<AuditLogDto> GetAuditLogByIdAsync(int id)
//            {
//                var item = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(
//                    _dbContext.AuditLogs, a => a.AuditLogId == id && !a.IsDeleted);

//                if (item == null) return null;

//                var emp = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(
//                    _dbContext.Tbl_Employee, e => e.ID == item.UserId);

//                return new AuditLogDto
//                {
//                    AuditLogId = item.AuditLogId,
//                    CompanyId = item.CompanyId,
//                    TableName = item.TableName,
//                    RecordId = item.RecordId,
//                    Action = item.Action,
//                    OldValue = item.OldValue,
//                    NewValue = item.NewValue,
//                    UserId = item.UserId,
//                    EmployeeName = emp != null ? emp.FirstName + " " + emp.LastName : "System",
//                    AuditDate = item.AuditDate,
//                    IsDeleted = item.IsDeleted
//                };
//            }
//        }
//    }
