using System.Collections.Generic;

namespace CompanyPlatform.CRM.DTO.Customer
{
    public class MatchedCustomerSummaryDto
    {
        public int CustomerId { get; set; }
        public string CustomerCode { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string? CompanyName { get; set; }
        public string? GSTIN { get; set; }
        public string? PlantCode { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? Pincode { get; set; }
        public string? OwnerName { get; set; }
        public int ExistingAddressCount { get; set; }
    }

    public class CustomerDuplicateCheckResultDto
    {
        public bool IsDuplicate { get; set; }
        public bool IsExactMatch { get; set; }
        public bool IsPossibleMatch { get; set; }
        public string MatchType { get; set; } = "None"; // "ExactGstinMatch" | "PossibleNamePinMatch" | "None"
        public string Message { get; set; } = string.Empty;
        public List<MatchedCustomerSummaryDto> MatchedCustomers { get; set; } = new List<MatchedCustomerSummaryDto>();
    }
}

