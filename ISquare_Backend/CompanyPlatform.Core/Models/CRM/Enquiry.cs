using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("tbl_Enquiries")]
    public class Enquiry
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EnquiryId { get; set; }

        [Required]
        [MaxLength(50)]
        public string EnquiryNumber { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "date")]
        public DateTime EnquiryDate { get; set; } = DateTime.UtcNow.Date;

        // --- 01. Basic Details References ---
        [Required]
        public int EnquiryTypeId { get; set; }

        [Required]
        public int EnquirySourceId { get; set; }

        [Required]
        public int CustomerId { get; set; }

        // --- 02. Enquiry Contact Details ---
        public int? ContactId { get; set; }

        [MaxLength(150)]
        public string? ContactName { get; set; }

        [MaxLength(100)]
        public string? DepartmentName { get; set; }

        [MaxLength(100)]
        public string? Designation { get; set; }

        [MaxLength(30)]
        public string? ContactMobile { get; set; }

        [MaxLength(150)]
        public string? ContactEmail { get; set; }

        // --- 03. Requirement Details ---
        [Required]
        public int ProductCategoryId { get; set; }

        [Required]
        [MaxLength(250)]
        public string RequirementSubject { get; set; } = string.Empty;

        [Required]
        public string CustomerRequirement { get; set; } = string.Empty;

        public decimal? RequiredQuantity { get; set; }

        public int? UnitOfMeasureId { get; set; }

        [MaxLength(100)]
        public string? DeliveryTimeline { get; set; }

        public int? PlaceOfSupplyId { get; set; }

        public string? TechnicalSpecificationNotes { get; set; }

        // --- 05. Commercial Details ---
        [Column(TypeName = "decimal(18,2)")]
        public decimal? ExpectedOrderValue { get; set; }

        public int? CurrencyId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? CustomerBudget { get; set; }

        [Column(TypeName = "date")]
        public DateTime? ExpectedClosingDate { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? ProbabilityPercentage { get; set; }

        public int? PaymentTermId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? CustomerCreditLimit { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? EstimatedTaxPercent { get; set; }

        // --- 06. Sales Assignment & Pipeline ---
        [Required]
        public int EnquiryStatusId { get; set; }

        [Required]
        public int EnquiryStageId { get; set; }

        [Required]
        public int EnquiryPriorityId { get; set; }

        public int? SalesManagerId { get; set; }

        [MaxLength(150)]
        public string? SalesManagerName { get; set; }

        public int? BDEUserId { get; set; }

        [MaxLength(150)]
        public string? BDEUserName { get; set; }

        public int? DepartmentId { get; set; }

        public int? SalesTerritoryId { get; set; }

        [MaxLength(150)]
        public string? ResponsiblePerson { get; set; }

        // --- 07. Follow-up / Sales Activity ---
        [Column(TypeName = "date")]
        public DateTime? NextFollowUpDate { get; set; }

        public int? ActivityTypeId { get; set; }

        [MaxLength(250)]
        public string? NextAction { get; set; }

        [MaxLength(250)]
        public string? Reminder { get; set; }

        public string? ActivityDiscussionNotes { get; set; }

        // --- 08. Outcome / Lost Reason ---
        public int? LostReasonId { get; set; }

        public string? OutcomeInternalRemarks { get; set; }

        // --- 09. Documents & Terms ---
        [MaxLength(100)]
        public string? DocumentReference { get; set; }

        [MaxLength(200)]
        public string? DocumentName { get; set; }

        [MaxLength(500)]
        public string? DocumentFilePath { get; set; }

        public string? TermsAndConditions { get; set; }

        // --- Audit Fields ---
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public int? UpdatedBy { get; set; }
    }
}