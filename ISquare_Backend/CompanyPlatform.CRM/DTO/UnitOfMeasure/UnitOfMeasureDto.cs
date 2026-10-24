using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO
{
    // Response DTO
    public class UnitOfMeasureResponseDto
    {
        public int UnitOfMeasureId { get; set; }
        public string UnitOfMeasureCode { get; set; } = string.Empty;
        public string UnitOfMeasureName { get; set; } = string.Empty;
        public string? UnitOfMeasureDescription { get; set; }
        public int? UnitOfMeasureSortOrder { get; set; }
        public bool UnitOfMeasureIsActive { get; set; }
        public bool UnitOfMeasureIsDeleted { get; set; }
        public DateTime UnitOfMeasureCreatedAt { get; set; }
        public DateTime? UnitOfMeasureUpdatedAt { get; set; }
    }

    // Create DTO
    public class UnitOfMeasureCreateDto
    {
        [Required(ErrorMessage = "Code is required.")]
        [StringLength(30, ErrorMessage = "Code cannot exceed 30 characters.")]
        public string UnitOfMeasureCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string UnitOfMeasureName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? UnitOfMeasureDescription { get; set; }

        public int? UnitOfMeasureSortOrder { get; set; }

        public bool UnitOfMeasureIsActive { get; set; } = true;

    }

    // Update DTO
    public class UnitOfMeasureUpdateDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string UnitOfMeasureName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? UnitOfMeasureDescription { get; set; }

        public int? UnitOfMeasureSortOrder { get; set; }

        public bool UnitOfMeasureIsActive { get; set; }

    }
}