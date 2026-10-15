using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.CompanyCategory
{
    public class CustomerCategoryDto
    {
        public int CustomerCategoryId { get; set; }

        [Required]
        public string CategoryName { get; set; } = string.Empty;

        public string CategoryCode { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}