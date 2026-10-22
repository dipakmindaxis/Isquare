using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CompanyPlatform.Core.Models.CRM;

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

        // BDE assigned to this Sales Coordinator
        public int? BDEUserId { get; set; }

        [ForeignKey(nameof(BDEUserId))]
        public virtual BDEUser? BDEUser { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}