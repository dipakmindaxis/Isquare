using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.FollowUp
{
    public class FollowUpDto
    {
        public int FollowUpId { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public DateTime FollowUpDate { get; set; }

        public string? Remarks { get; set; }

        [Required]
        public int StatusId { get; set; }

        [Required]
        public int PriorityId { get; set; }

        public DateTime? NextFollowUpDate { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}