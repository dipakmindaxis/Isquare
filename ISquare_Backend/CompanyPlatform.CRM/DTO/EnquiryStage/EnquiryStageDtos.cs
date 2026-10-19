using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO
{
    // Response DTO
    public class EnquiryStageResponseDto
    {
        public int EnquiryStageId { get; set; }
        public string EnquiryStageCode { get; set; } = string.Empty;
        public string EnquiryStageName { get; set; } = string.Empty;
        public string? EnquiryStageDescription { get; set; }
        public int? EnquiryStageSortOrder { get; set; }
        public bool EnquiryStageIsActive { get; set; }
        public bool EnquiryStageIsDeleted { get; set; }
        public DateTime EnquiryStageCreatedAt { get; set; }
        public int EnquiryStageCreatedBy { get; set; }
        public DateTime? EnquiryStageUpdatedAt { get; set; }
        public int? EnquiryStageUpdatedBy { get; set; }
    }

    // Create DTO
    public class EnquiryStageCreateDto
    {
        [Required(ErrorMessage = "Code is required.")]
        [StringLength(30, ErrorMessage = "Code cannot exceed 30 characters.")]
        public string EnquiryStageCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string EnquiryStageName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? EnquiryStageDescription { get; set; }

        public int? EnquiryStageSortOrder { get; set; }

        public bool EnquiryStageIsActive { get; set; } = true;

        [Required(ErrorMessage = "CreatedBy is required.")]
        public int EnquiryStageCreatedBy { get; set; }
    }

    // Update DTO
    public class EnquiryStageUpdateDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string EnquiryStageName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? EnquiryStageDescription { get; set; }

        public int? EnquiryStageSortOrder { get; set; }

        public bool EnquiryStageIsActive { get; set; }

        [Required(ErrorMessage = "UpdatedBy is required.")]
        public int EnquiryStageUpdatedBy { get; set; }
    }
}