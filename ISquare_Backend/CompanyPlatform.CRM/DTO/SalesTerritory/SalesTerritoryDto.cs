using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO
{
    // Response DTO
    public class SalesTerritoryResponseDto
    {
        public int SalesTerritoryId { get; set; }
        public string SalesTerritoryCode { get; set; } = string.Empty;
        public string SalesTerritoryName { get; set; } = string.Empty;
        public string? SalesTerritoryDescription { get; set; }
        public int? SalesTerritorySortOrder { get; set; }
        public bool SalesTerritoryIsActive { get; set; }
        public bool SalesTerritoryIsDeleted { get; set; }
        public DateTime SalesTerritoryCreatedAt { get; set; }
        public DateTime? SalesTerritoryUpdatedAt { get; set; }
    }

    // Create DTO
    public class SalesTerritoryCreateDto
    {
        [Required(ErrorMessage = "Code is required.")]
        [StringLength(30, ErrorMessage = "Code cannot exceed 30 characters.")]
        public string SalesTerritoryCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string SalesTerritoryName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? SalesTerritoryDescription { get; set; }

        public int? SalesTerritorySortOrder { get; set; }

        public bool SalesTerritoryIsActive { get; set; } = true;

    }

    // Update DTO
    public class SalesTerritoryUpdateDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string SalesTerritoryName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? SalesTerritoryDescription { get; set; }

        public int? SalesTerritorySortOrder { get; set; }

        public bool SalesTerritoryIsActive { get; set; }

    }
}