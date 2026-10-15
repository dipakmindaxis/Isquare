using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO.Companies
{
    public class CompaniessDto
    {
        public int CompanyId { get; set; }

        [Required]
        [StringLength(250)]
        public string CompanyName { get; set; } = string.Empty;

        public string? Status { get; set; }

        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}