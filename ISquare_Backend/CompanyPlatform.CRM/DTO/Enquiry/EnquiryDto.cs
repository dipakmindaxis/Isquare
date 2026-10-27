using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Enquiry
{
    public class EnquiryDto
    {
        public int EnquiryId { get; set; }
        public string EnquiryNumber { get; set; } = string.Empty;
        public DateTime EnquiryDate { get; set; }

        public int EnquiryTypeId { get; set; }
        public string? EnquiryTypeName { get; set; }

        public int EnquirySourceId { get; set; }
        public string? EnquirySourceName { get; set; }

        public int CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerCode { get; set; }

        // Contact
        public int? ContactId { get; set; }
        public string? ContactName { get; set; }
        public string? DepartmentName { get; set; }
        public string? Designation { get; set; }
        public string? ContactMobile { get; set; }
        public string? ContactEmail { get; set; }

        // Requirement
        public int ProductCategoryId { get; set; }
        public string? ProductCategoryName { get; set; }
        public string RequirementSubject { get; set; } = string.Empty;
        public string CustomerRequirement { get; set; } = string.Empty;
        public decimal? RequiredQuantity { get; set; }
        public int? UnitOfMeasureId { get; set; }
        public string? UnitOfMeasureName { get; set; }
        public string? DeliveryTimeline { get; set; }
        public int? PlaceOfSupplyId { get; set; }
        public string? PlaceOfSupplyName { get; set; }
        public string? TechnicalSpecificationNotes { get; set; }

        // Commercial
        public decimal? ExpectedOrderValue { get; set; }
        public int? CurrencyId { get; set; }
        public string? CurrencyCode { get; set; }
        public decimal? CustomerBudget { get; set; }
        public DateTime? ExpectedClosingDate { get; set; }
        public decimal? ProbabilityPercentage { get; set; }
        public int? PaymentTermId { get; set; }
        public string? PaymentTermName { get; set; }
        public decimal? CustomerCreditLimit { get; set; }
        public decimal? EstimatedTaxPercent { get; set; }

        // Sales Assignment & Pipeline
        public int EnquiryStatusId { get; set; }
        public string? EnquiryStatusName { get; set; }
        public int EnquiryStageId { get; set; }
        public string? EnquiryStageName { get; set; }
        public int EnquiryPriorityId { get; set; }
        public string? EnquiryPriorityName { get; set; }

        public int? SalesManagerId { get; set; }
        public string? SalesManagerName { get; set; }
        public int? BDEUserId { get; set; }
        public string? BDEUserName { get; set; }
        public int? DepartmentId { get; set; }
        public string? DepartmentMasterName { get; set; }
        public int? SalesTerritoryId { get; set; }
        public string? SalesTerritoryName { get; set; }
        public string? ResponsiblePerson { get; set; }

        // Follow-up
        public DateTime? NextFollowUpDate { get; set; }
        public int? ActivityTypeId { get; set; }
        public string? ActivityTypeName { get; set; }
        public string? NextAction { get; set; }
        public string? Reminder { get; set; }
        public string? ActivityDiscussionNotes { get; set; }

        // Outcome
        public int? LostReasonId { get; set; }
        public string? LostReasonName { get; set; }
        public string? OutcomeInternalRemarks { get; set; }

        // Document & Terms
        public string? DocumentReference { get; set; }
        public string? DocumentName { get; set; }
        public string? DocumentFilePath { get; set; }
        public string? TermsAndConditions { get; set; }

        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class EnquiryCreateDto
    {
        public string? EnquiryNumber { get; set; }

        [Required]
        public DateTime EnquiryDate { get; set; } = DateTime.UtcNow.Date;

        [Required]
        public int EnquiryTypeId { get; set; }

        [Required]
        public int EnquirySourceId { get; set; }

        [Required]
        public int CustomerId { get; set; }

        public int? ContactId { get; set; }
        public string? ContactName { get; set; }
        public string? DepartmentName { get; set; }
        public string? Designation { get; set; }
        public string? ContactMobile { get; set; }
        public string? ContactEmail { get; set; }

        [Required]
        public int ProductCategoryId { get; set; }

        [Required]
        [MaxLength(250)]
        public string RequirementSubject { get; set; } = string.Empty;

        [Required]
        public string CustomerRequirement { get; set; } = string.Empty;

        public decimal? RequiredQuantity { get; set; }
        public int? UnitOfMeasureId { get; set; }
        public string? DeliveryTimeline { get; set; }
        public int? PlaceOfSupplyId { get; set; }
        public string? TechnicalSpecificationNotes { get; set; }

        public decimal? ExpectedOrderValue { get; set; }
        public int? CurrencyId { get; set; }
        public decimal? CustomerBudget { get; set; }
        public DateTime? ExpectedClosingDate { get; set; }
        public decimal? ProbabilityPercentage { get; set; }
        public int? PaymentTermId { get; set; }
        public decimal? CustomerCreditLimit { get; set; }
        public decimal? EstimatedTaxPercent { get; set; }

        [Required]
        public int EnquiryStatusId { get; set; }

        [Required]
        public int EnquiryStageId { get; set; }

        [Required]
        public int EnquiryPriorityId { get; set; }

        public int? SalesManagerId { get; set; }
        public string? SalesManagerName { get; set; }
        public int? BDEUserId { get; set; }
        public string? BDEUserName { get; set; }
        public int? DepartmentId { get; set; }
        public int? SalesTerritoryId { get; set; }
        public string? ResponsiblePerson { get; set; }

        public DateTime? NextFollowUpDate { get; set; }
        public int? ActivityTypeId { get; set; }
        public string? NextAction { get; set; }
        public string? Reminder { get; set; }
        public string? ActivityDiscussionNotes { get; set; }

        public int? LostReasonId { get; set; }
        public string? OutcomeInternalRemarks { get; set; }

        public string? DocumentReference { get; set; }
        public string? DocumentName { get; set; }
        public string? DocumentFilePath { get; set; }
        public string? TermsAndConditions { get; set; }
        public int? CreatedBy { get; set; }
    }

    public class EnquiryUpdateDto : EnquiryCreateDto
    {
        [Required]
        public int EnquiryId { get; set; }
        public int? UpdatedBy { get; set; }
    }
}