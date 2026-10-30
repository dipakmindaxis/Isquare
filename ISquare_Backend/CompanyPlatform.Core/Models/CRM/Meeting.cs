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
    [Table("tbl_Meeting")]
    public class Meeting
    {
        [Key]
        public int MeetingId { get; set; }

        // Foreign Key -> Company
        public int CompanyId { get; set; }

        // Foreign Key -> MeetingType
        public int MeetingTypeId { get; set; }

        // Foreign Key -> Employee/User
        public int UserId { get; set; }

        public DateTime MeetingDate { get; set; }

        public TimeSpan MeetingTime { get; set; }

        // Duration in minutes
        public int Duration { get; set; }

        [StringLength(250)]
        public string? Location { get; set; }

        public string? Agenda { get; set; }

        public string? Outcome { get; set; }

        public DateTime? NextMeetingDate { get; set; }

        [StringLength(100)]
        public string? Status { get; set; }

        // Audit Fields
        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;

        // Navigation Properties

        [ForeignKey(nameof(CompanyId))]
        public virtual Company? Company { get; set; }

        [ForeignKey(nameof(MeetingTypeId))]
        public virtual MeetingType? MeetingType { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual Employee? User { get; set; }

        [ForeignKey(nameof(CreatedBy))]
        public virtual Employee? CreatedByEmployee { get; set; }

        [ForeignKey(nameof(UpdatedBy))]
        public virtual Employee? UpdatedByEmployee { get; set; }
    }
}
