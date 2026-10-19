using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO
{
    // Response DTO
    public class EnquiryTypeResponseDto
    {
        public int EnquiryTypeId { get; set; }
        public string EnquiryTypeCode { get; set; } = string.Empty;
        public string EnquiryTypeName { get; set; } = string.Empty;
        public string? EnquiryTypeDescription { get; set; }
        public int? EnquiryTypeSortOrder { get; set; }
        public bool EnquiryTypeIsActive { get; set; }
        public DateTime EnquiryTypeCreatedAt { get; set; }
        public DateTime? EnquiryTypeUpdatedAt { get; set; }
    }

    // Create DTO
    public class EnquiryTypeCreateDto
    {
        [Required(ErrorMessage = "Code is required.")]
        [StringLength(30, ErrorMessage = "Code cannot exceed 30 characters.")]
        public string EnquiryTypeCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string EnquiryTypeName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? EnquiryTypeDescription { get; set; }

        public int? EnquiryTypeSortOrder { get; set; }

        public bool EnquiryTypeIsActive { get; set; } = true;

    }

    // Update DTO
    public class EnquiryTypeUpdateDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string EnquiryTypeName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? EnquiryTypeDescription { get; set; }

        public int? EnquiryTypeSortOrder { get; set; }

        public bool EnquiryTypeIsActive { get; set; }

    }
}