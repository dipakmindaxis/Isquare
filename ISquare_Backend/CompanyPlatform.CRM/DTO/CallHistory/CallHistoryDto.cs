using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.CallHistory
{
    public class CallHistoryDto
    {
        public int HistoryId { get; set; }

        [Required(ErrorMessage = "Call is required.")]
        public int CallId { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        public string Status { get; set; }

        public string? Remarks { get; set; }

        public DateTime CreatedDate { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}