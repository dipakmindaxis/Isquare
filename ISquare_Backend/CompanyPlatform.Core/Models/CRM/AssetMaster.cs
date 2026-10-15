using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.Company
{
    [Table("tbl_AssetMaster")]
    public class AssetMaster
    {
        [Key]
        public int AssetID { get; set; }

        [Required]
        [MaxLength(50)]
        public string AssetCode { get; set; }

        [Required]
        [MaxLength(200)]
        public string AssetName { get; set; }

        [Required]
        [MaxLength(100)]
        public string Category { get; set; }
      
        [MaxLength(100)]
        public string? Brand { get; set; }

        [MaxLength(100)]
        public string? Model { get; set; }

        [MaxLength(100)]
        public string? SerialNumber { get; set; }

        public DateTime? PurchaseDate { get; set; }

        public DateTime? WarrantyExpiryDate { get; set; }

        [Required]
        [MaxLength(30)]
        public string AssetStatus { get; set; } = "Available";
        /*
            Available
            Allocated
            Returned
            Under Repair
            Scrap
        */

        [Column(TypeName = "nvarchar(max)")]
        public string? Remarks { get; set; }

        public bool IsActive { get; set; } = true;

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public DateTime? UpdatedDate { get; set; }
    }
}
