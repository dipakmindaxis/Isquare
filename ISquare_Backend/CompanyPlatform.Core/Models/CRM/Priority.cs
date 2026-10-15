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
    [Table("tbl_Priority")]
    public class Priority
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string PriorityName { get; set; } = string.Empty;

        [Required]
        public string ColorCode { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
    }
}