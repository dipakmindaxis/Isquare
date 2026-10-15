using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.CustomerArea
{
    [Table("tbl_CustomerArea")]
    public class CustomerArea
    {
        // Primary Key
        [Key]
        public int CustomerAreaId { get; set; }

        [Required]
        public string AreaName { get; set; }

        [Required]
        public string AreaCode { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}