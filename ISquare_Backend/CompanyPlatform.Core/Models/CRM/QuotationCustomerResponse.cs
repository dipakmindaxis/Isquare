
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("tbl_QuotationCustomerResponse")]
    public class QuotationCustomerResponse
    {
        [Key]
        public int QuotationCustomerResponseId { get; set; }

        [Required]
        public int QuotationId { get; set; }

        [Required]
        [EmailAddress]
        public string CustomerEmail { get; set; } = string.Empty;

        // Unique ID used in the public email link.
        // Customer does not need to log in.
        public Guid PublicResponseId { get; set; } = Guid.NewGuid();

        public int RevisionNumber { get; set; }

        [Required]
        public string ResponseStatus { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? EmailSentAt { get; set; }

        public DateTime ExpiresAt { get; set; }

        public DateTime? RespondedAt { get; set; }

        [StringLength(2000)]
        public string? CustomerRemarks { get; set; }

        public bool IsRevoked { get; set; } = false;

        [Timestamp]
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    }
}
