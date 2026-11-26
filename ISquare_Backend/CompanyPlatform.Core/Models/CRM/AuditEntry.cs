using System.Text.Json;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace CompanyPlatform.Core.Models.CRM
{
    public class AuditEntry(EntityEntry entry)
    {
        public EntityEntry Entry { get; } = entry;
        public int UserId { get; set; }
        public int CompanyId { get; set; }
        public string TableName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public DateTime AuditDate { get; set; } = DateTime.UtcNow;
        public Dictionary<string, object?> KeyProperties { get; } = [];
        public Dictionary<string, object?> OldValues { get; } = [];
        public Dictionary<string, object?> NewValues { get; } = [];
        public List<PropertyEntry> TemporaryProperties { get; } = [];
        public PropertyEntry? CompanyIdProperty { get; set; }

        public bool HasTemporaryProperties => TemporaryProperties.Count > 0;

        /// <summary>
        /// Converts this tracked change entry into a persisted <see cref="AuditLog"/> entity.
        /// </summary>
        public AuditLog ToAuditLog()
        {
            return new AuditLog
            {
                UserId = UserId,
                CompanyId = CompanyId,
                TableName = TableName,
                Action = Action,
                RecordId = ExtractRecordId(),
                OldValue = OldValues.Count == 0 ? null : JsonSerializer.Serialize(OldValues),
                NewValue = NewValues.Count == 0 ? null : JsonSerializer.Serialize(NewValues),
                AuditDate = AuditDate,
                IsDeleted = false
            };
        }

        private int ExtractRecordId()
        {
            foreach (var value in KeyProperties.Values)
            {
                if (value is int intId)
                    return intId;

                if (value is long longId && longId is >= int.MinValue and <= int.MaxValue)
                    return (int)longId;

                if (value is short shortId)
                    return shortId;

                if (value is byte byteId)
                    return byteId;

                if (value != null && int.TryParse(value.ToString(), out var parsed))
                    return parsed;
            }

            return 0;
        }
    }
}
