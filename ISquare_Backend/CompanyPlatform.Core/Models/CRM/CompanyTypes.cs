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
    [Table("tbl_CompanyType")]
    public class CompanyTypes
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string CompanyTypeName { get; set; }

        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;
    }
}