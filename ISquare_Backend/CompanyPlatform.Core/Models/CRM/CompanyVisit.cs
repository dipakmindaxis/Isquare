using CompanyPlatform.Core.Models.CRM.Company;
using CompanyPlatform.Core.Models.CRM.Employee;
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
    [Table("tbl_CompanyVisit")]
    public class CompanyVisit
    {
        [Key]
        public int VisitId { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        public int VisitTypeId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public DateTime VisitDate { get; set; }

        public TimeSpan? CheckInTime { get; set; }

        public TimeSpan? CheckOutTime { get; set; }

        public string? Location { get; set; }

        public decimal? Latitude { get; set; }

        public decimal? Longitude { get; set; }

        public string? Remarks { get; set; }

        public DateTime CreatedDate { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

        // Navigation Properties

        [ForeignKey("CompanyId")]
        public virtual Company? Company { get; set; }

        [ForeignKey("VisitTypeId")]
        public virtual VisitType? VisitType { get; set; }

        [ForeignKey("UserId")]
        public virtual Employee? User { get; set; }
    }
}
