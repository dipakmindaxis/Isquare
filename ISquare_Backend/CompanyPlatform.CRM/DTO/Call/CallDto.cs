using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Call
{
    public class CallDto
    {
        public int CallId { get; set; }

        [Required(ErrorMessage = "Company is required.")]
        public int CompanyId { get; set; }

        [Required(ErrorMessage = "Call Type is required.")]
        public int CallTypeId { get; set; }

        [Required(ErrorMessage = "User is required.")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "Call Date is required.")]
        public DateTime CallDate { get; set; }

        [Required(ErrorMessage = "Duration is required.")]
        public int Duration { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        public string Status { get; set; }

        public string? Remarks { get; set; }

        public DateTime? NextFollowUpDate { get; set; }

        [Required(ErrorMessage = "Created By is required.")]
        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}