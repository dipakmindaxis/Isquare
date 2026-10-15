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
    [Table("tbl_EmailTemplate")]
    public class EmailTemplate
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public string TemplateName { get; set; }

        [Required]
        public string Subject { get; set; }

        [Required]
        public string Body { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}