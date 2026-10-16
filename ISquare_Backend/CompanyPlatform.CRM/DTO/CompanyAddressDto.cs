using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO
{
    public class CompanyAddressDto
    {
        public int AddressId { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        [StringLength(30)]
        public string AddressType { get; set; }

        [Required]
        [StringLength(500)]
        public string Address { get; set; }

        [Required]
        public int CountryId { get; set; }

        [Required]
        public int StateId { get; set; }

        [Required]
        public int CityId { get; set; }

        [StringLength(10)]
        public string? Pincode { get; set; } = "000000";

        public bool IsPrimary { get; set; }

        public bool IsActive { get; set; }

        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }
    }
}