using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.Company
{
    [Table("tbl_History")]
    public class History
    {
        [Key]
        public int HistoryId { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public string RefType { get; set; }

        [Required]
        public int RefId { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public DateTime ActivityDate { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}