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
        public Dictionary<string, object> KeyProperties { get; } = [];
        public Dictionary<string, object> OldValues { get; } = [];
        public Dictionary<string, object> NewValues { get; } = [];
        public List<PropertyEntry> TemporaryProperties { get; } = [];
    }
}
