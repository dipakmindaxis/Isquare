using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace CompanyPlatform.Core.Models.CRM
{
    public class AuditEntry
    {
        public AuditEntry(EntityEntry entry)
        {
            Entry = entry;
        }

        public EntityEntry Entry { get; }
        public int UserId { get; set; }
        public int CompanyId { get; set; }
        public string TableName { get; set; }
        public string Action { get; set; }
        public Dictionary<string, object> KeyProperties { get; } = new Dictionary<string, object>();
        public Dictionary<string, object> OldValues { get; } = new Dictionary<string, object>();
        public Dictionary<string, object> NewValues { get; } = new Dictionary<string, object>();
        public List<PropertyEntry> TemporaryProperties { get; } = new List<PropertyEntry>();
    }
}
