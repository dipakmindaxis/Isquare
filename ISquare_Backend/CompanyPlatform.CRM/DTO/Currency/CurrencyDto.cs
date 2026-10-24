using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO
{
    // Response DTO
    public class CurrencyResponseDto
    {
        public int CurrencyId { get; set; }
        public string CurrencyCode { get; set; } = string.Empty;
        public string CurrencyName { get; set; } = string.Empty;
        public string? CurrencyDescription { get; set; }
        public int? CurrencySortOrder { get; set; }
        public bool CurrencyIsActive { get; set; }
        public bool CurrencyIsDeleted { get; set; }
        public DateTime CurrencyCreatedAt { get; set; }
        public DateTime? CurrencyUpdatedAt { get; set; }
    }

    // Create DTO
    public class CurrencyCreateDto
    {
        [Required(ErrorMessage = "Code is required.")]
        [StringLength(30, ErrorMessage = "Code cannot exceed 30 characters.")]
        public string CurrencyCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string CurrencyName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? CurrencyDescription { get; set; }

        public int? CurrencySortOrder { get; set; }

        public bool CurrencyIsActive { get; set; } = true;

    }

    // Update DTO
    public class CurrencyUpdateDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string CurrencyName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? CurrencyDescription { get; set; }

        public int? CurrencySortOrder { get; set; }

        public bool CurrencyIsActive { get; set; }

    }
}