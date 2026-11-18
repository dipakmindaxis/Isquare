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
    [Table("tbl_CompanyTimeline")]
    public class CompanyTimeline
    {
        [Key]
        public int TimelineId { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        public int ActivityTypeId { get; set; }

        public int? ReferenceId { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
