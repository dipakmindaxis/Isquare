using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO
{
    // Response DTO
    public class EnquiryStatusResponseDto
    {
        public int EnquiryStatusId { get; set; }
        public string EnquiryStatusCode { get; set; } = string.Empty;
        public string EnquiryStatusName { get; set; } = string.Empty;
        public string? EnquiryStatusDescription { get; set; }
        public int? EnquiryStatusSortOrder { get; set; }
        public bool EnquiryStatusIsActive { get; set; }
        public bool EnquiryStatusIsDeleted { get; set; }
        public DateTime EnquiryStatusCreatedAt { get; set; }
        public DateTime? EnquiryStatusUpdatedAt { get; set; }
    }

    // Create DTO
    public class EnquiryStatusCreateDto
    {
        [Required(ErrorMessage = "Code is required.")]
        [StringLength(30, ErrorMessage = "Code cannot exceed 30 characters.")]
        public string EnquiryStatusCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string EnquiryStatusName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? EnquiryStatusDescription { get; set; }

        public int? EnquiryStatusSortOrder { get; set; }

        public bool EnquiryStatusIsActive { get; set; } = true;

    }

    // Update DTO
    public class EnquiryStatusUpdateDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string EnquiryStatusName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? EnquiryStatusDescription { get; set; }

        public int? EnquiryStatusSortOrder { get; set; }

        public bool EnquiryStatusIsActive { get; set; }

    }
}