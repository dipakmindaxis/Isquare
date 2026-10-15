using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CompanyPlatform.CRM.DTO;

namespace CompanyPlatform.CRM.DTO.Customer
{
    public class CustomerDto
    {
        // Primary Identifiers
        public int CustomerId { get; set; }
        public int CompanyId { get => CustomerId; set => CustomerId = value; }

        // Section 1: Basic Details
        public string CustomerCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Customer Name is required.")]
        public string CustomerName { get; set; } = string.Empty;

        public string? CustomerShortName { get; set; }
        public string? CompanyName { get; set; }
        public string? CompanyGroup { get; set; }
        public string? PlantCode { get; set; }

        // Section 2: Business Information
        public int? IndustryId { get; set; }
        public string? IndustryName { get; set; }

        public int? CustomerStatusId { get; set; }
        public string? CustomerStatusName { get; set; }

        public int? CustomerSourceId { get; set; }
        public string? CustomerSourceName { get; set; }

        public int? CustomerAreaId { get; set; }
        public string? CustomerAreaName { get; set; }

        public int? PaymentTermsId { get; set; }
        public int? PaymentTermId { get => PaymentTermsId; set => PaymentTermsId = value; }
        public string? PaymentTermName { get; set; }

        // Section 3: Registration & Tax Information
        public string? PAN { get; set; }
        public string? TAN { get; set; }
        public string? GSTIN { get; set; }
        public string? CIN { get; set; }
        public string? MSMENumber { get; set; }

        // Section 4: Sales Assignment
        public int? DirectorId { get; set; }
        public string? DirectorName { get; set; }

        public int? BDEUserId { get; set; }
        public string? BDEUserName { get; set; }

        public int? SalesCoordinatorId { get; set; }
        public string? SalesCoordinatorName { get; set; }

        public int? CustomerOwnerId { get; set; }
        public string? CustomerOwnerName { get; set; }

        // Section 5: Addresses
        public List<CompanyAddressDto> Addresses { get; set; } = new List<CompanyAddressDto>();

        // Section 6: Other Details
        public DateTime? RegistrationDate { get; set; }
        public DateTime? VisitedDate { get; set; }
        public string? Remarks { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;
    }
}
