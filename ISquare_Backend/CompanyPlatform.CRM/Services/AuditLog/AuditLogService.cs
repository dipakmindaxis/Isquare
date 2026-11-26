using CompanyPlatform.Core.Data;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.CRM.DTO.AuditLog;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using AuditLogEntity = CompanyPlatform.Core.Models.CRM.AuditLog;

namespace CompanyPlatform.CRM.Services.AuditLog
{
    public class AuditLogService : IAuditLogService
    {
        private readonly ApplicationDBContext _dbContext;
        private readonly ILogger<AuditLogService> _logger;

        private sealed class AuditLogJoinedRow
        {
            public AuditLogEntity Log { get; init; } = null!;
            public string EmployeeName { get; init; } = "System";
        }

        public AuditLogService(
            ApplicationDBContext dbContext,
            ILogger<AuditLogService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<PaginatedResult<AuditLogDto>> GetAllAuditLogsAsync(
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
            string? sortOrder)
        {
            ValidateDateRange(fromDate, toDate);

            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            _logger.LogInformation(
                "Fetching paginated audit logs. Page={Page}, PageSize={PageSize}, TableName={TableName}, Action={Action}",
                page, pageSize, tableName, action);

            var query = BuildFilteredQuery(search, tableName, action, userId, recordId, fromDate, toDate);

            var totalCount = await query.CountAsync();

            query = ApplySorting(query, sortField, sortOrder);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PaginatedResult<AuditLogDto>
            {
                Items = items.Select(x => MapToDto(x.Log, x.EmployeeName)).ToList(),
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }

        public async Task<AuditLogSummaryDto> GetAuditLogSummaryAsync(
            string? search,
            string? tableName,
            string? action,
            int? userId,
            int? recordId,
            DateTime? fromDate,
            DateTime? toDate)
        {
            ValidateDateRange(fromDate, toDate);

            _logger.LogInformation("Fetching audit log activity summary.");

            var query = BuildFilteredQuery(search, tableName, action, userId, recordId, fromDate, toDate);

            var summary = await query
                .GroupBy(_ => 1)
                .Select(g => new AuditLogSummaryDto
                {
                    TotalActivities = g.Count(),
                    CreateActivities = g.Count(x => x.Log.Action.ToUpper() == "CREATE"),
                    UpdateActivities = g.Count(x => x.Log.Action.ToUpper() == "UPDATE"),
                    DeleteActivities = g.Count(x => x.Log.Action.ToUpper() == "DELETE")
                })
                .FirstOrDefaultAsync();

            return summary ?? new AuditLogSummaryDto();
        }

        public async Task<AuditLogDto?> GetAuditLogByIdAsync(int id)
        {
            if (id <= 0)
                return null;

            _logger.LogInformation("Fetching audit log with ID: {AuditLogId}", id);

            var result = await (
                from a in _dbContext.AuditLogs.AsNoTracking()
                join e in _dbContext.Tbl_Employee.AsNoTracking()
                    on a.UserId equals e.ID into employeeJoin
                from e in employeeJoin.DefaultIfEmpty()
                where a.AuditLogId == id && !a.IsDeleted
                select new AuditLogJoinedRow
                {
                    Log = a,
                    EmployeeName = e != null
                        ? (e.FirstName + " " + e.LastName).Trim()
                        : "System"
                })
                .FirstOrDefaultAsync();

            if (result == null)
            {
                _logger.LogWarning("Audit log with ID: {AuditLogId} was not found.", id);
                return null;
            }

            return MapToDto(result.Log, result.EmployeeName);
        }

        private IQueryable<AuditLogJoinedRow> BuildFilteredQuery(
            string? search,
            string? tableName,
            string? action,
            int? userId,
            int? recordId,
            DateTime? fromDate,
            DateTime? toDate)
        {
            var query =
                from a in _dbContext.AuditLogs.AsNoTracking()
                join e in _dbContext.Tbl_Employee.AsNoTracking()
                    on a.UserId equals e.ID into employeeJoin
                from e in employeeJoin.DefaultIfEmpty()
                where !a.IsDeleted
                select new AuditLogJoinedRow
                {
                    Log = a,
                    EmployeeName = e != null
                        ? (e.FirstName + " " + e.LastName).Trim()
                        : "System"
                };

            if (!string.IsNullOrWhiteSpace(tableName))
            {
                var normalizedTable = tableName.Trim().ToLower();
                query = query.Where(x => x.Log.TableName.ToLower() == normalizedTable);
            }

            if (!string.IsNullOrWhiteSpace(action))
            {
                var normalizedAction = action.Trim().ToLower();
                query = query.Where(x => x.Log.Action.ToLower() == normalizedAction);
            }

            if (userId.HasValue)
            {
                query = query.Where(x => x.Log.UserId == userId.Value);
            }

            if (recordId.HasValue)
            {
                query = query.Where(x => x.Log.RecordId == recordId.Value);
            }

            if (fromDate.HasValue)
            {
                var start = fromDate.Value;
                query = query.Where(x => x.Log.AuditDate >= start);
            }

            if (toDate.HasValue)
            {
                if (toDate.Value.TimeOfDay == TimeSpan.Zero)
                {
                    var exclusiveEnd = toDate.Value.Date.AddDays(1);
                    query = query.Where(x => x.Log.AuditDate < exclusiveEnd);
                }
                else
                {
                    var inclusiveEnd = toDate.Value;
                    query = query.Where(x => x.Log.AuditDate <= inclusiveEnd);
                }
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(x =>
                    x.Log.Action.Contains(term) ||
                    x.Log.TableName.Contains(term) ||
                    x.EmployeeName.Contains(term) ||
                    x.Log.RecordId.ToString().Contains(term));
            }

            return query;
        }

        private static IQueryable<AuditLogJoinedRow> ApplySorting(
            IQueryable<AuditLogJoinedRow> query,
            string? sortField,
            string? sortOrder)
        {
            var isAscending = string.Equals(sortOrder?.Trim(), "asc", StringComparison.OrdinalIgnoreCase);
            var normalizedField = sortField?.Trim().ToLowerInvariant();

            return (normalizedField, isAscending) switch
            {
                ("tablename", true) => query.OrderBy(x => x.Log.TableName).ThenBy(x => x.Log.AuditLogId),
                ("tablename", false) => query.OrderByDescending(x => x.Log.TableName).ThenByDescending(x => x.Log.AuditLogId),

                ("action", true) => query.OrderBy(x => x.Log.Action).ThenBy(x => x.Log.AuditLogId),
                ("action", false) => query.OrderByDescending(x => x.Log.Action).ThenByDescending(x => x.Log.AuditLogId),

                ("employeename", true) => query.OrderBy(x => x.EmployeeName).ThenBy(x => x.Log.AuditLogId),
                ("employeename", false) => query.OrderByDescending(x => x.EmployeeName).ThenByDescending(x => x.Log.AuditLogId),

                ("recordid", true) => query.OrderBy(x => x.Log.RecordId).ThenBy(x => x.Log.AuditLogId),
                ("recordid", false) => query.OrderByDescending(x => x.Log.RecordId).ThenByDescending(x => x.Log.AuditLogId),

                ("userid", true) => query.OrderBy(x => x.Log.UserId).ThenBy(x => x.Log.AuditLogId),
                ("userid", false) => query.OrderByDescending(x => x.Log.UserId).ThenByDescending(x => x.Log.AuditLogId),

                ("companyid", true) => query.OrderBy(x => x.Log.CompanyId).ThenBy(x => x.Log.AuditLogId),
                ("companyid", false) => query.OrderByDescending(x => x.Log.CompanyId).ThenByDescending(x => x.Log.AuditLogId),

                (_, true) => query.OrderBy(x => x.Log.AuditDate).ThenBy(x => x.Log.AuditLogId),
                (_, false) => query.OrderByDescending(x => x.Log.AuditDate).ThenByDescending(x => x.Log.AuditLogId)
            };
        }

        private static AuditLogDto MapToDto(AuditLogEntity log, string employeeName)
        {
            var resolvedEmployeeName = string.IsNullOrWhiteSpace(employeeName) ? "System" : employeeName;
            var entityName = DeriveEntityName(log.TableName);

            return new AuditLogDto
            {
                AuditLogId = log.AuditLogId,
                CompanyId = log.CompanyId,
                TableName = log.TableName,
                EntityName = entityName,
                RecordId = log.RecordId,
                Action = log.Action,
                Description = $"{resolvedEmployeeName} performed {log.Action} on {entityName} (Record ID: {log.RecordId})",
                OldValue = log.OldValue,
                NewValue = log.NewValue,
                UserId = log.UserId,
                EmployeeName = resolvedEmployeeName,
                AuditDate = log.AuditDate,
                IsDeleted = log.IsDeleted
            };
        }

        private static string DeriveEntityName(string tableName)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                return string.Empty;

            if (tableName.StartsWith("tbl_", StringComparison.OrdinalIgnoreCase))
                return tableName[4..];

            if (tableName.StartsWith("tb_", StringComparison.OrdinalIgnoreCase))
                return tableName[3..];

            return tableName;
        }

        private static void ValidateDateRange(DateTime? fromDate, DateTime? toDate)
        {
            if (fromDate.HasValue && toDate.HasValue && fromDate.Value > toDate.Value)
                throw new ArgumentException("fromDate cannot be greater than toDate.");
        }
    }
}
