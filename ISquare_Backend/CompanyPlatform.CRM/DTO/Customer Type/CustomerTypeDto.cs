using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.CustomerType
{
    public class CustomerTypeDto
    {
        public int Id { get; set; }

        [Required]
        public string CustomerTypeName { get; set; }

        public string? Description { get; set; }

        public bool IsActive { get; set; }
    }
}