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

        private sealed class AuditCandidateRow
        {
            public int AuditLogId { get; init; }
            public string TableName { get; init; } = string.Empty;
            public int RecordId { get; init; }
            public int CompanyId { get; init; }
            public DateTime AuditDate { get; init; }
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

            // Determine distinct (TableName, RecordId) pairs for non-CREATE entries to batch-fetch previous and creation audit logs
            var nonCreateItems = items
                .Where(x => !string.Equals(x.Log.Action, "CREATE", StringComparison.OrdinalIgnoreCase))
                .ToList();

            var creatorDict = new Dictionary<(string TableName, int RecordId), string>();
            var candidateLogs = new List<AuditCandidateRow>();

            if (nonCreateItems.Count > 0)
            {
                var targetTableNames = nonCreateItems.Select(x => x.Log.TableName.ToLowerInvariant()).Distinct().ToList();
                var targetRecordIds = nonCreateItems.Select(x => x.Log.RecordId).Distinct().ToList();

                var auditHistory = await (
                    from a in _dbContext.AuditLogs.AsNoTracking()
                    join e in _dbContext.Tbl_Employee.AsNoTracking() on a.UserId equals e.ID into ej
                    from e in ej.DefaultIfEmpty()
                    where targetTableNames.Contains(a.TableName.ToLower())
                       && targetRecordIds.Contains(a.RecordId)
                       && !a.IsDeleted
                    orderby a.AuditDate ascending, a.AuditLogId ascending
                    select new
                    {
                        a.AuditLogId,
                        TableName = a.TableName.ToLower(),
                        a.RecordId,
                        a.CompanyId,
                        a.Action,
                        a.AuditDate,
                        EmployeeName = e != null ? (e.FirstName + " " + e.LastName).Trim() : null,
                        a.UserId
                    }
                ).ToListAsync();

                // Group by TableName and RecordId for earliest CREATE entry
                foreach (var group in auditHistory.Where(x => x.Action.ToUpper() == "CREATE").GroupBy(x => (x.TableName, x.RecordId)))
                {
                    var earliest = group.First();
                    var name = !string.IsNullOrWhiteSpace(earliest.EmployeeName)
                        ? earliest.EmployeeName
                        : (earliest.UserId > 0 ? $"User #{earliest.UserId}" : "System");
                    creatorDict[group.Key] = name;
                }

                // Preserve candidate entries for chronological previous-action lookups
                candidateLogs = auditHistory.Select(x => new AuditCandidateRow
                {
                    AuditLogId = x.AuditLogId,
                    TableName = x.TableName,
                    RecordId = x.RecordId,
                    CompanyId = x.CompanyId,
                    AuditDate = x.AuditDate,
                    EmployeeName = !string.IsNullOrWhiteSpace(x.EmployeeName)
                        ? x.EmployeeName
                        : (x.UserId > 0 ? $"User #{x.UserId}" : "System")
                }).ToList();
            }

            var dtoList = new List<AuditLogDto>(items.Count);
            foreach (var item in items)
            {
                string creatorName;
                string previousActionByName;

                if (string.Equals(item.Log.Action, "CREATE", StringComparison.OrdinalIgnoreCase))
                {
                    creatorName = item.EmployeeName;
                    previousActionByName = item.EmployeeName;
                }
                else
                {
                    var tableKey = item.Log.TableName.ToLowerInvariant();
                    var targetRecordId = item.Log.RecordId;

                    if (creatorDict.TryGetValue((tableKey, targetRecordId), out var foundCreator))
                    {
                        creatorName = foundCreator;
                    }
                    else
                    {
                        creatorName = "Not Available";
                    }

                    // Select the latest audit entry that occurred BEFORE the current entry
                    var prev = candidateLogs
                        .Where(c => c.TableName == tableKey
                                 && c.RecordId == targetRecordId
                                 && (c.AuditDate < item.Log.AuditDate || (c.AuditDate == item.Log.AuditDate && c.AuditLogId < item.Log.AuditLogId)))
                        .OrderByDescending(c => c.AuditDate)
                        .ThenByDescending(c => c.AuditLogId)
                        .FirstOrDefault();

                    if (prev != null)
                    {
                        previousActionByName = prev.EmployeeName;
                    }
                    else
                    {
                        previousActionByName = creatorName != "Not Available" ? creatorName : "Not Available";
                    }
                }

                dtoList.Add(MapToDto(item.Log, item.EmployeeName, creatorName, previousActionByName));
            }

            return new PaginatedResult<AuditLogDto>
            {
                Items = dtoList,
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

            var creatorName = await ResolveOriginalCreatorAsync(result.Log, result.EmployeeName);
            var previousActionByName = await ResolvePreviousActionEmployeeAsync(result.Log, result.EmployeeName);

            return MapToDto(result.Log, result.EmployeeName, creatorName, previousActionByName);
        }

        private async Task<string> ResolvePreviousActionEmployeeAsync(AuditLogEntity log, string currentEmployeeName)
        {
            // If current log is a CREATE action, current employee is the action employee
            if (string.Equals(log.Action, "CREATE", StringComparison.OrdinalIgnoreCase))
            {
                return string.IsNullOrWhiteSpace(currentEmployeeName) ? "System" : currentEmployeeName;
            }

            // 1. Select the latest audit entry that occurred BEFORE the current audit entry for same record
            var prevLog = await (
                from a in _dbContext.AuditLogs.AsNoTracking()
                join e in _dbContext.Tbl_Employee.AsNoTracking() on a.UserId equals e.ID into ej
                from e in ej.DefaultIfEmpty()
                where a.TableName.ToLower() == log.TableName.ToLower()
                   && a.RecordId == log.RecordId
                   && (a.CompanyId == log.CompanyId || a.CompanyId == 0 || log.CompanyId == 0)
                   && !a.IsDeleted
                   && (a.AuditDate < log.AuditDate || (a.AuditDate == log.AuditDate && a.AuditLogId < log.AuditLogId))
                orderby a.AuditDate descending, a.AuditLogId descending
                select new
                {
                    EmployeeName = e != null ? (e.FirstName + " " + e.LastName).Trim() : null,
                    UserId = a.UserId
                }
            ).FirstOrDefaultAsync();

            if (prevLog != null)
            {
                if (!string.IsNullOrWhiteSpace(prevLog.EmployeeName))
                    return prevLog.EmployeeName;
                if (prevLog.UserId > 0)
                    return $"User #{prevLog.UserId}";
                return "System";
            }

            // 2. If no preceding audit log in tbl_AuditLog, fallback to creator if accessible
            var fallbackCreator = await ResolveOriginalCreatorAsync(log, currentEmployeeName);
            return fallbackCreator != "Not Available" ? fallbackCreator : "Not Available";
        }

        private async Task<string> ResolveOriginalCreatorAsync(AuditLogEntity log, string currentEmployeeName)
        {
            // If current log is a CREATE action, current employee is the creator
            if (string.Equals(log.Action, "CREATE", StringComparison.OrdinalIgnoreCase))
            {
                return string.IsNullOrWhiteSpace(currentEmployeeName) ? "System" : currentEmployeeName;
            }

            // 1. Look up earliest CREATE audit log for this table and record
            var creatorLog = await (
                from a in _dbContext.AuditLogs.AsNoTracking()
                join e in _dbContext.Tbl_Employee.AsNoTracking() on a.UserId equals e.ID into ej
                from e in ej.DefaultIfEmpty()
                where a.TableName.ToLower() == log.TableName.ToLower()
                   && a.RecordId == log.RecordId
                   && (a.CompanyId == log.CompanyId || log.CompanyId == 0 || a.CompanyId == 0)
                   && a.Action.ToUpper() == "CREATE"
                   && !a.IsDeleted
                orderby a.AuditDate ascending, a.AuditLogId ascending
                select new
                {
                    EmployeeName = e != null ? (e.FirstName + " " + e.LastName).Trim() : null,
                    UserId = a.UserId
                }
            ).FirstOrDefaultAsync();

            if (creatorLog != null)
            {
                if (!string.IsNullOrWhiteSpace(creatorLog.EmployeeName))
                    return creatorLog.EmployeeName;
                if (creatorLog.UserId > 0)
                    return $"User #{creatorLog.UserId}";
            }

            // 2. Fallback: check underlying table if accessible
            var normalizedTable = log.TableName.ToLowerInvariant();
            try
            {
                if (normalizedTable is "tbl_quotation" or "quotation" or "quotations")
                {
                    var q = await _dbContext.Quotations.AsNoTracking()
                        .Where(x => x.QuotationId == log.RecordId)
                        .Select(x => x.CreatedBy)
                        .FirstOrDefaultAsync();
                    if (!string.IsNullOrWhiteSpace(q))
                    {
                        if (int.TryParse(q, out var empId))
                        {
                            var emp = await _dbContext.Tbl_Employee.AsNoTracking()
                                .Where(e => e.ID == empId)
                                .Select(e => (e.FirstName + " " + e.LastName).Trim())
                                .FirstOrDefaultAsync();
                            if (!string.IsNullOrWhiteSpace(emp)) return emp;
                        }
                        return q;
                    }
                }
                else if (normalizedTable is "tbl_company" or "company" or "companies" or "customer" or "customers")
                {
                    var c = await _dbContext.Companies.AsNoTracking()
                        .Where(x => x.CompanyId == log.RecordId)
                        .Select(x => x.CreatedByEmployee != null
                            ? (x.CreatedByEmployee.FirstName + " " + x.CreatedByEmployee.LastName).Trim()
                            : null)
                        .FirstOrDefaultAsync();
                    if (!string.IsNullOrWhiteSpace(c))
                        return c;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error attempting fallback creator lookup for {TableName} ID {RecordId}", log.TableName, log.RecordId);
            }

            // 3. Fallback: if not found, return "Not Available"
            return "Not Available";
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

        private static AuditLogDto MapToDto(
            AuditLogEntity log,
            string employeeName,
            string? createdByEmployeeName = null,
            string? previousActionByEmployeeName = null)
        {
            var resolvedEmployeeName = string.IsNullOrWhiteSpace(employeeName) ? "System" : employeeName;
            var entityName = DeriveEntityName(log.TableName);

            var resolvedCreator = createdByEmployeeName;
            if (string.IsNullOrWhiteSpace(resolvedCreator))
            {
                resolvedCreator = string.Equals(log.Action, "CREATE", StringComparison.OrdinalIgnoreCase)
                    ? resolvedEmployeeName
                    : "Not Available";
            }

            var resolvedPrevious = previousActionByEmployeeName;
            if (string.IsNullOrWhiteSpace(resolvedPrevious))
            {
                resolvedPrevious = string.Equals(log.Action, "CREATE", StringComparison.OrdinalIgnoreCase)
                    ? resolvedEmployeeName
                    : "Not Available";
            }

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
                CreatedByEmployeeName = resolvedCreator,
                PreviousActionByEmployeeName = resolvedPrevious,
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
