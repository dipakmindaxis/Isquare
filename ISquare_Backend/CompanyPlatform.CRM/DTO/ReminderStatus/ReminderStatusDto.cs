using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO.Meeting
{
    public class ReminderStatusDto
    {
        public int ID { get; set; }

        [Required(ErrorMessage = "Status name is required.")]
        public string StatusName { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; }
    }
}