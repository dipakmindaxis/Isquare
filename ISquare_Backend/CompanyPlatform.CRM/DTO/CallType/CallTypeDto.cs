using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.CallType
{
    public class CallTypeDto
    {
        public int ID { get; set; }

        [Required]
        public string CallTypeName { get; set; } = string.Empty;

        public bool IsActive { get; set; }
    }
}