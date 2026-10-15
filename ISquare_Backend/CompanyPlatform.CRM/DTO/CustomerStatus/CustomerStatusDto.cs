using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.CustomerStatus
{
    public class CustomerStatusDto
    {
        public int CustomerStatusId { get; set; }

        [Required]
        public string StatusName { get; set; }

        public string? Description { get; set; }

        public string? StatusCode { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}