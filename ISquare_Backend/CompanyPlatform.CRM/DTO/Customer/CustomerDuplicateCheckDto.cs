using System;

namespace CompanyPlatform.CRM.DTO.Customer
{
    public class CustomerDuplicateCheckDto
    {
        public string? GSTIN { get; set; }
        public string? CompanyName { get; set; }
        public string? CustomerName { get; set; }
        public string? Pincode { get; set; }
        public int? ExcludeCustomerId { get; set; }
    }
}

