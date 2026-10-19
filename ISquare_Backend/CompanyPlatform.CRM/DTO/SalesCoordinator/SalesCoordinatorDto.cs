using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.SalesCoordinator
{
    public class SalesCoordinatorDto
    {
        public int SalesCoordinatorId { get; set; }

        [Required]
        public string SalesCoordinatorName { get; set; } = string.Empty;

        public string SalesCoordinatorCode { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; }
    }
}