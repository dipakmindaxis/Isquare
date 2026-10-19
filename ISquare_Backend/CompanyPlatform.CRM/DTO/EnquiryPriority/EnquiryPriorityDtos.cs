using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO
{
    // Response DTO
    public class EnquiryPriorityResponseDto
    {
        public int EnquiryPriorityId { get; set; }
        public string EnquiryPriorityCode { get; set; } = string.Empty;
        public string EnquiryPriorityName { get; set; } = string.Empty;
        public string? EnquiryPriorityDescription { get; set; }
        public int? EnquiryPrioritySortOrder { get; set; }
        public bool EnquiryPriorityIsActive { get; set; }
        public bool EnquiryPriorityIsDeleted { get; set; }
        public DateTime EnquiryPriorityCreatedAt { get; set; }
        public DateTime? EnquiryPriorityUpdatedAt { get; set; }
    }

    // Create DTO
    public class EnquiryPriorityCreateDto
    {
        [Required(ErrorMessage = "Code is required.")]
        [StringLength(30, ErrorMessage = "Code cannot exceed 30 characters.")]
        public string EnquiryPriorityCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string EnquiryPriorityName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? EnquiryPriorityDescription { get; set; }

        public int? EnquiryPrioritySortOrder { get; set; }

        public bool EnquiryPriorityIsActive { get; set; } = true;

    }

    // Update DTO
    public class EnquiryPriorityUpdateDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string EnquiryPriorityName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? EnquiryPriorityDescription { get; set; }

        public int? EnquiryPrioritySortOrder { get; set; }

        public bool EnquiryPriorityIsActive { get; set; }

    }
}