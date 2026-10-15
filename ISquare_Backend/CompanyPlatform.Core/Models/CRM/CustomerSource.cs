using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.CustomerSource
{
    [Table("tbl_CustomerSource")]
    public class CustomerSource
    {
        // Primary Key
        [Key]
        public int CustomerSourceId { get; set; }

        [Required]
        public string SourceName { get; set; }

        [Required]
        public string SourceCode { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}