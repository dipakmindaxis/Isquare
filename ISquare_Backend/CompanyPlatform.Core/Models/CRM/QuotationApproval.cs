using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.Company
{
    [Table("tbl_QuotationApproval")]
    public class QuotationApproval
    {
        [Key]
        public int QuotationApprovalId { get; set; }

        [Required]
        public int QuotationId { get; set; }

        [Required]
        [MaxLength(50)]
        public string ApprovalStatus { get; set; } = "Pending";

        [MaxLength(500)]
        public string? ApprovalReason { get; set; }

        [MaxLength(100)]
        public string? RequestedBy { get; set; }

        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? ApprovedBy { get; set; }

        public DateTime? ApprovedAt { get; set; }

        [MaxLength(1000)]
        public string? ApproverComments { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}