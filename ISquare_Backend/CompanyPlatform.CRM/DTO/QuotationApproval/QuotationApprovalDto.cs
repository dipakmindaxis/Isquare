using System;

namespace CompanyPlatform.CRM.DTO.Quotation
{
    public class QuotationApprovalDto
    {
        public int QuotationApprovalId { get; set; }

        public int QuotationId { get; set; }

        public string ApprovalStatus { get; set; } = "Pending";

        public string? ApprovalReason { get; set; }

        public string? RequestedBy { get; set; }

        public DateTime RequestedAt { get; set; }

        public string? ApprovedBy { get; set; }

        public DateTime? ApprovedAt { get; set; }

        public string? ApproverComments { get; set; }
    }
}