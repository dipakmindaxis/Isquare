using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Quotation
{
    public class CreateSalesOrderDto
    {
        public int? QuotationId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int CustomerId { get; set; }

        public DateTime? ExpectedDeliveryDate { get; set; }

        [MaxLength(100)]
        public string? PaymentTerms { get; set; }

        [MaxLength(200)]
        public string? DeliveryAddress { get; set; }

        [MaxLength(1000)]
        public string? Remarks { get; set; }
    }
}