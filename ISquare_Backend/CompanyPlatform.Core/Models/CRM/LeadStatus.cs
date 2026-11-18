using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("tbl_LeadStatus")]
    public class LeadStatus
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public string StatusName { get; set; } = string.Empty;

        public string ColorCode { get; set; } = string.Empty;

        public int SortOrder { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; }
    }
}