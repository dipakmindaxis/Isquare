using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO
{
    // Response DTO
    public class ProductServiceResponseDto
    {
        public int ProductServiceId { get; set; }
        public string ProductServiceCode { get; set; } = string.Empty;
        public string ProductServiceName { get; set; } = string.Empty;
        public string? ProductServiceDescription { get; set; }
        public int? ProductServiceSortOrder { get; set; }
        public bool ProductServiceIsActive { get; set; }
        public bool ProductServiceIsDeleted { get; set; }
        public DateTime ProductServiceCreatedAt { get; set; }
        public DateTime? ProductServiceUpdatedAt { get; set; }
    }

    // Create DTO
    public class ProductServiceCreateDto
    {
        [Required(ErrorMessage = "Code is required.")]
        [StringLength(30, ErrorMessage = "Code cannot exceed 30 characters.")]
        public string ProductServiceCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string ProductServiceName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? ProductServiceDescription { get; set; }

        public int? ProductServiceSortOrder { get; set; }

        public bool ProductServiceIsActive { get; set; } = true;

    }

    // Update DTO
    public class ProductServiceUpdateDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string ProductServiceName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? ProductServiceDescription { get; set; }

        public int? ProductServiceSortOrder { get; set; }

        public bool ProductServiceIsActive { get; set; }

    }
}