using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Director
{
    public class DirectorDto
    {
        public int DirectorId { get; set; }

        [Required]
        public string DirectorName { get; set; } = string.Empty;

        public string DirectorCode { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; }
    }
}