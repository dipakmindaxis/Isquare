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
    [Table("tbl_State")]
    public class State
    {
        [Key]
        public int StateId { get; set; }

        [ForeignKey("Country")]
        public int CountryId { get; set; }

        [Required]
        public string StateName { get; set; } = string.Empty;

        [Required]
        public string StateCode { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public string? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Country? Country { get; set; }
    }
}