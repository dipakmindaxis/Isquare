using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO
{
    // Response DTO
    public class PlaceOfSupplyResponseDto
    {
        public int PlaceOfSupplyId { get; set; }
        public string PlaceOfSupplyCode { get; set; } = string.Empty;
        public string PlaceOfSupplyName { get; set; } = string.Empty;
        public string? PlaceOfSupplyDescription { get; set; }
        public int? PlaceOfSupplySortOrder { get; set; }
        public bool PlaceOfSupplyIsActive { get; set; }
        public bool PlaceOfSupplyIsDeleted { get; set; }
        public DateTime PlaceOfSupplyCreatedAt { get; set; }
        public DateTime? PlaceOfSupplyUpdatedAt { get; set; }
    }

    // Create DTO
    public class PlaceOfSupplyCreateDto
    {
        [Required(ErrorMessage = "Code is required.")]
        [StringLength(30, ErrorMessage = "Code cannot exceed 30 characters.")]
        public string PlaceOfSupplyCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string PlaceOfSupplyName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? PlaceOfSupplyDescription { get; set; }

        public int? PlaceOfSupplySortOrder { get; set; }

        public bool PlaceOfSupplyIsActive { get; set; } = true;

    }

    // Update DTO
    public class PlaceOfSupplyUpdateDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string PlaceOfSupplyName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? PlaceOfSupplyDescription { get; set; }

        public int? PlaceOfSupplySortOrder { get; set; }

        public bool PlaceOfSupplyIsActive { get; set; }

    }
}