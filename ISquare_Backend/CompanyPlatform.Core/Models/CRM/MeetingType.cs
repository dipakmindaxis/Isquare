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
    [Table("tbl_MeetingType")]
    public class MeetingType
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public string MeetingTypeName { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; }
    }
}
