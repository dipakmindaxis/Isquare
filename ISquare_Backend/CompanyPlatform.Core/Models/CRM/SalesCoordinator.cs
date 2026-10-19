using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.SalesCoordinator
{
    [Table("tbl_SalesCoordinator")]
    public class SalesCoordinator
    {
        [Key]
        public int SalesCoordinatorId { get; set; }

        [Required]
        public string SalesCoordinatorName { get; set; } = string.Empty;

        [Required]
        public string SalesCoordinatorCode { get; set; } = string.Empty;

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}