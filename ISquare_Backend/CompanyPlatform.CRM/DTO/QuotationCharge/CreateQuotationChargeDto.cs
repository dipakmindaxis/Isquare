using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Quotation
{
    public class CreateQuotationChargeDto
    {
        [Required]
        [Range(1, int.MaxValue)]
        public int QuotationId { get; set; }

        [Required]
        [MaxLength(100)]
        public string ChargeName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        [RegularExpression(
            "^(Fixed|Percentage)$",
            ErrorMessage = "ChargeType must be Fixed or Percentage.")]
        public string ChargeType { get; set; } = "Fixed";

        [Range(typeof(decimal), "0", "9999999999999999")]
        public decimal ChargeAmount { get; set; }

        [Range(typeof(decimal), "0", "100")]
        public decimal TaxRate { get; set; }

        public bool IsTaxable { get; set; } = true;
    }
}