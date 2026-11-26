using System.Runtime.CompilerServices;
using System.Security.Claims;
using CompanyPlatform.Core.Models.CRM;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.Core.Data.Interceptors
{
    /// <summary>
    /// Automatically captures CREATE, UPDATE, and DELETE (including soft-delete) changes into <see cref="AuditLog"/>.
    /// </summary>
    public class AuditSaveChangesInterceptor : SaveChangesInterceptor
    {
        private static readonly HashSet<string> SensitivePropertyNames = new(StringComparer.OrdinalIgnoreCase)
        {
            "PasswordHash",
            "SecurityStamp",
            "ConcurrencyStamp",
            "Password",
            "ConfirmPassword",
            "OldPassword",
            "NewPassword",
            "Token",
            "RefreshToken",
            "AccessToken",
            "ResetToken",
            "Secret",
            "ApiKey",
            "Salt"
        };

        private sealed class PendingAuditState
        {
            public List<AuditEntry> Entries { get; } = [];
            public bool IsSavingAuditLogs { get; set; }
        }

        private readonly ConditionalWeakTable<DbContext, PendingAuditState> _pendingStates = new();
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<AuditSaveChangesInterceptor> _logger;

        public AuditSaveChangesInterceptor(
            IHttpContextAccessor httpContextAccessor,
            ILogger<AuditSaveChangesInterceptor> logger)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public override InterceptionResult<int> SavingChanges(
            DbContextEventData eventData,
            InterceptionResult<int> result)
        {
            PrepareAuditEntries(eventData.Context);
            return base.SavingChanges(eventData, result);
        }

        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            PrepareAuditEntries(eventData.Context);
            return base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        public override int SavedChanges(SaveChangesCompletedEventData eventData, int result)
        {
            PersistAuditEntries(eventData.Context);
            return base.SavedChanges(eventData, result);
        }

        public override async ValueTask<int> SavedChangesAsync(
            SaveChangesCompletedEventData eventData,
            int result,
            CancellationToken cancellationToken = default)
        {
            await PersistAuditEntriesAsync(eventData.Context, cancellationToken);
            return await base.SavedChangesAsync(eventData, result, cancellationToken);
        }

        public override void SaveChangesFailed(DbContextErrorEventData eventData)
        {
            ClearPendingEntries(eventData.Context);
            base.SaveChangesFailed(eventData);
        }

        public override Task SaveChangesFailedAsync(
            DbContextErrorEventData eventData,
            CancellationToken cancellationToken = default)
        {
            ClearPendingEntries(eventData.Context);
            return base.SaveChangesFailedAsync(eventData, cancellationToken);
        }

        private void PrepareAuditEntries(DbContext? context)
        {
            if (context == null)
                return;

            var state = _pendingStates.GetOrCreateValue(context);
            if (state.IsSavingAuditLogs)
                return;

            state.Entries.Clear();
            context.ChangeTracker.DetectChanges();

            var userId = ResolveCurrentUserId();
            var auditTimestamp = DateTime.UtcNow;

            foreach (var entry in context.ChangeTracker.Entries())
            {
                if (entry.Entity is AuditLog ||
                    entry.State is EntityState.Detached or EntityState.Unchanged)
                {
                    continue;
                }

                var auditEntry = BuildAuditEntry(entry, userId, auditTimestamp);
                if (auditEntry != null)
                {
                    state.Entries.Add(auditEntry);
                }
            }
        }

        private void PersistAuditEntries(DbContext? context)
        {
            var auditLogs = FinalizePendingAuditLogs(context, out var state);
            if (context == null || state == null || auditLogs.Count == 0)
                return;

            state.IsSavingAuditLogs = true;
            try
            {
                context.Set<AuditLog>().AddRange(auditLogs);
                context.SaveChanges();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to persist {Count} audit log entries.", auditLogs.Count);
            }
            finally
            {
                state.IsSavingAuditLogs = false;
            }
        }

        private async Task PersistAuditEntriesAsync(DbContext? context, CancellationToken cancellationToken)
        {
            var auditLogs = FinalizePendingAuditLogs(context, out var state);
            if (context == null || state == null || auditLogs.Count == 0)
                return;

            state.IsSavingAuditLogs = true;
            try
            {
                await context.Set<AuditLog>().AddRangeAsync(auditLogs, cancellationToken);
                await context.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to persist {Count} audit log entries.", auditLogs.Count);
            }
            finally
            {
                state.IsSavingAuditLogs = false;
            }
        }

        private List<AuditLog> FinalizePendingAuditLogs(DbContext? context, out PendingAuditState? state)
        {
            state = null;
            if (context == null || !_pendingStates.TryGetValue(context, out state) || state.IsSavingAuditLogs)
                return [];

            if (state.Entries.Count == 0)
                return [];

            var pending = state.Entries.ToList();
            state.Entries.Clear();

            var auditLogs = new List<AuditLog>(pending.Count);
            foreach (var entry in pending)
            {
                foreach (var tempProp in entry.TemporaryProperties)
                {
                    var propName = tempProp.Metadata.Name;
                    if (tempProp.Metadata.IsPrimaryKey())
                    {
                        entry.KeyProperties[propName] = tempProp.CurrentValue;
                    }

                    if (!IsSensitiveProperty(propName) && entry.Action == "CREATE")
                    {
                        entry.NewValues[propName] = tempProp.CurrentValue;
                    }
                }

                if (entry.CompanyIdProperty != null)
                {
                    entry.CompanyId = ConvertToIntOrZero(entry.CompanyIdProperty.CurrentValue);
                }

                auditLogs.Add(entry.ToAuditLog());
            }

            return auditLogs;
        }

        private void ClearPendingEntries(DbContext? context)
        {
            if (context != null && _pendingStates.TryGetValue(context, out var state))
            {
                state.Entries.Clear();
                state.IsSavingAuditLogs = false;
            }
        }

        private static AuditEntry? BuildAuditEntry(EntityEntry entry, int userId, DateTime auditTimestamp)
        {
            var auditEntry = new AuditEntry(entry)
            {
                UserId = userId,
                TableName = entry.Metadata.GetTableName() ?? entry.Metadata.ClrType.Name,
                AuditDate = auditTimestamp
            };

            ResolveCompanyId(entry, auditEntry);

            switch (entry.State)
            {
                case EntityState.Added:
                    auditEntry.Action = "CREATE";
                    PopulateAddedValues(entry, auditEntry);
                    return auditEntry;

                case EntityState.Deleted:
                    auditEntry.Action = "DELETE";
                    PopulateDeletedValues(entry, auditEntry);
                    return auditEntry;

                case EntityState.Modified:
                    if (IsSoftDelete(entry))
                    {
                        auditEntry.Action = "DELETE";
                        PopulateDeletedValues(entry, auditEntry);
                        return auditEntry;
                    }

                    auditEntry.Action = "UPDATE";
                    PopulateModifiedValues(entry, auditEntry);
                    return auditEntry.OldValues.Count == 0 && auditEntry.NewValues.Count == 0
                        ? null
                        : auditEntry;

                default:
                    return null;
            }
        }

        private static void PopulateAddedValues(EntityEntry entry, AuditEntry auditEntry)
        {
            foreach (var property in entry.Properties)
            {
                var propName = property.Metadata.Name;
                if (property.IsTemporary)
                {
                    auditEntry.TemporaryProperties.Add(property);
                    continue;
                }

                if (property.Metadata.IsPrimaryKey())
                {
                    auditEntry.KeyProperties[propName] = property.CurrentValue;
                }

                if (!IsSensitiveProperty(propName))
                {
                    auditEntry.NewValues[propName] = property.CurrentValue;
                }
            }
        }

        private static void PopulateDeletedValues(EntityEntry entry, AuditEntry auditEntry)
        {
            foreach (var property in entry.Properties)
            {
                var propName = property.Metadata.Name;
                if (property.Metadata.IsPrimaryKey())
                {
                    auditEntry.KeyProperties[propName] = property.OriginalValue;
                }

                if (!IsSensitiveProperty(propName))
                {
                    auditEntry.OldValues[propName] = property.OriginalValue;
                }
            }
        }

        private static void PopulateModifiedValues(EntityEntry entry, AuditEntry auditEntry)
        {
            foreach (var property in entry.Properties)
            {
                var propName = property.Metadata.Name;
                if (property.Metadata.IsPrimaryKey())
                {
                    auditEntry.KeyProperties[propName] = property.CurrentValue ?? property.OriginalValue;
                }

                if (IsSensitiveProperty(propName))
                    continue;

                if (!Equals(property.OriginalValue, property.CurrentValue))
                {
                    auditEntry.OldValues[propName] = property.OriginalValue;
                    auditEntry.NewValues[propName] = property.CurrentValue;
                }
            }
        }

        private static bool IsSoftDelete(EntityEntry entry)
        {
            foreach (var property in entry.Properties)
            {
                var propName = property.Metadata.Name;
                if (!propName.Equals("IsDeleted", StringComparison.OrdinalIgnoreCase) &&
                    !propName.EndsWith("IsDeleted", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                if (property.OriginalValue is null or false && property.CurrentValue is true)
                    return true;
            }

            return false;
        }

        private static void ResolveCompanyId(EntityEntry entry, AuditEntry auditEntry)
        {
            var companyProp = entry.Properties.FirstOrDefault(p =>
                p.Metadata.Name.Equals("CompanyId", StringComparison.OrdinalIgnoreCase))
                ?? entry.Properties.FirstOrDefault(p =>
                    p.Metadata.Name.Equals("CustomerId", StringComparison.OrdinalIgnoreCase));

            if (companyProp == null)
                return;

            if (entry.State == EntityState.Added && companyProp.IsTemporary)
            {
                auditEntry.CompanyIdProperty = companyProp;
                return;
            }

            var value = entry.State == EntityState.Deleted
                ? companyProp.OriginalValue
                : companyProp.CurrentValue ?? companyProp.OriginalValue;

            auditEntry.CompanyId = ConvertToIntOrZero(value);
        }

        private int ResolveCurrentUserId()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user == null)
                return 0;

            var employeeIdClaim = user.FindFirst("EmployeeId")?.Value
                ?? user.FindFirst("UserId")?.Value
                ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return int.TryParse(employeeIdClaim, out var userId) && userId > 0
                ? userId
                : 0;
        }

        private static bool IsSensitiveProperty(string propertyName)
        {
            if (SensitivePropertyNames.Contains(propertyName))
                return true;

            return propertyName.Contains("Password", StringComparison.OrdinalIgnoreCase) ||
                   propertyName.Contains("Secret", StringComparison.OrdinalIgnoreCase);
        }

        private static int ConvertToIntOrZero(object? value)
        {
            return value switch
            {
                int i => i,
                long l when l is >= int.MinValue and <= int.MaxValue => (int)l,
                short s => s,
                byte b => b,
                _ when value != null && int.TryParse(value.ToString(), out var parsed) => parsed,
                _ => 0
            };
        }
    }
}
