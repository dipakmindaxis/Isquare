using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.Company
{
    [Table("tbl_AccessControls")]
    public class AccessControl
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string RoleId { get; set; } = string.Empty;

        [ForeignKey("RoleId")]
        public virtual IdentityRole? Role { get; set; }

        [Required]
        [MaxLength(100)]
        public string SystemName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FormName { get; set; } = string.Empty;

        public bool CanView { get; set; }

        public bool CanAdd { get; set; }

        public bool CanEdit { get; set; }

        public bool CanDelete { get; set; }

        public bool IsDeleted { get; set; }
    }
}



//using Microsoft.AspNetCore.Identity;
//using System;
//using System.Collections.Generic;
//using System.ComponentModel;
//using System.ComponentModel.DataAnnotations;
//using System.ComponentModel.DataAnnotations.Schema;
//using System.Diagnostics.Metrics;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace CompanyPlatform.Core.Models.CRM.Company
//{


//    public class AccessControl
//    {
//        [Key]
//        public int Id { get; set; }

//        [Required]
//        public string RoleId { get; set; }

//        [ForeignKey("RoleId")]
//        public virtual IdentityRole Role { get; set; }

//        [Required]
//        [MaxLength(100)]
//        public string FormName { get; set; }

//        public bool CanView { get; set; }
//        public bool CanAdd { get; set; }
//        public bool CanEdit { get; set; }
//        public bool CanDelete { get; set; }
//    }
//}
