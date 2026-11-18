using System.ComponentModel;

namespace CompanyPlatform.CRM.DTO
{
    public class CompanyProfileDTO
    {
        public int ID { get; set; }
        public string CompanyName { get; set; } = string.Empty; 
        public string Address { get; set; } = string.Empty; 
        public string PAN { get; set; } = string.Empty; 
        public string TAN { get; set; } = string.Empty; 
        public string CittdsAddress { get; set; } = string.Empty; 

        // Add fields for authorized signatory
        public string SignatoryName { get; set; } = string.Empty; 
        public string SignatoryDesignation { get; set; } = string.Empty;

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
