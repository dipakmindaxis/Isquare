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
    public class MeetingAttendee
    {
        [Key]
        public int AttendeeId { get; set; }

        public int MeetingId { get; set; }

        public int UserId { get; set; }

        public bool IsPresent { get; set; }

        [ForeignKey(nameof(MeetingId))]
        public virtual Meeting? Meeting { get; set; }

       
    }
}