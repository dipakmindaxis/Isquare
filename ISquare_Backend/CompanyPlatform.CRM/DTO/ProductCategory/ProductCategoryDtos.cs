using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO
{
    // Response DTO
    public class ProductCategoryResponseDto
    {
        public int ProductCategoryId { get; set; }
        public string ProductCategoryCode { get; set; } = string.Empty;
        public string ProductCategoryName { get; set; } = string.Empty;
        public string? ProductCategoryDescription { get; set; }
        public int? ProductCategorySortOrder { get; set; }
        public bool ProductCategoryIsActive { get; set; }
        public bool ProductCategoryIsDeleted { get; set; }
        public DateTime ProductCategoryCreatedAt { get; set; }
        public DateTime? ProductCategoryUpdatedAt { get; set; }
    }

    // Create DTO
    public class ProductCategoryCreateDto
    {
        [Required(ErrorMessage = "Code is required.")]
        [StringLength(30, ErrorMessage = "Code cannot exceed 30 characters.")]
        public string ProductCategoryCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string ProductCategoryName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? ProductCategoryDescription { get; set; }

        public int? ProductCategorySortOrder { get; set; }

        public bool ProductCategoryIsActive { get; set; } = true;

    }

    // Update DTO
    public class ProductCategoryUpdateDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string ProductCategoryName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? ProductCategoryDescription { get; set; }

        public int? ProductCategorySortOrder { get; set; }

        public bool ProductCategoryIsActive { get; set; }

    }
}