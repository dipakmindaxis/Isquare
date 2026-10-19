using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO
{
    // Response DTO
    public class LostReasonResponseDto
    {
        public int LostReasonId { get; set; }
        public string LostReasonCode { get; set; } = string.Empty;
        public string LostReasonName { get; set; } = string.Empty;
        public string? LostReasonDescription { get; set; }
        public int? LostReasonSortOrder { get; set; }
        public bool LostReasonIsActive { get; set; }
        public bool LostReasonIsDeleted { get; set; }
        public DateTime LostReasonCreatedAt { get; set; }
        public int LostReasonCreatedBy { get; set; }
        public DateTime? LostReasonUpdatedAt { get; set; }
        public int? LostReasonUpdatedBy { get; set; }
    }

    // Create DTO
    public class LostReasonCreateDto
    {
        [Required(ErrorMessage = "Code is required.")]
        [StringLength(30, ErrorMessage = "Code cannot exceed 30 characters.")]
        public string LostReasonCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string LostReasonName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? LostReasonDescription { get; set; }

        public int? LostReasonSortOrder { get; set; }

        public bool LostReasonIsActive { get; set; } = true;

        [Required(ErrorMessage = "CreatedBy is required.")]
        public int LostReasonCreatedBy { get; set; }
    }

    // Update DTO
    public class LostReasonUpdateDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string LostReasonName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? LostReasonDescription { get; set; }

        public int? LostReasonSortOrder { get; set; }

        public bool LostReasonIsActive { get; set; }

        [Required(ErrorMessage = "UpdatedBy is required.")]
        public int LostReasonUpdatedBy { get; set; }
    }
}