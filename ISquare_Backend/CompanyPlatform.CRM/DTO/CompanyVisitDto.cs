using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO
{
    public class CompanyVisitDto
    {
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

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}