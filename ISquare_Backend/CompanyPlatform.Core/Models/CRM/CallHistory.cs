using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.Call
{
    [Table("tbl_CallHistory")]
    public class CallHistory
    {
        [Key]
        public int HistoryId { get; set; }

        [Required]
        public int CallId { get; set; }
        [ForeignKey("CallId")]
        public virtual Call Call { get; set; }

        [Required]
        public string Status { get; set; }

        public string? Remarks { get; set; }

        [Required]
        public DateTime CreatedDate { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}