using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.History
{
    public class HistoryDto
    {
        public int HistoryId { get; set; }

        [Required(ErrorMessage = "Company is required.")]
        public int CompanyId { get; set; }

        [Required(ErrorMessage = "User is required.")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "Reference Type is required.")]
        public string RefType { get; set; }

        [Required(ErrorMessage = "Reference Id is required.")]
        public int RefId { get; set; }

        [Required(ErrorMessage = "Description is required.")]
        public string Description { get; set; }

        public DateTime ActivityDate { get; set; }
    }
}