using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.Company
{
    [Table("tbl_CustomerCategory")]
    public class CustomerCategory
    {
        [Key]
        public int CustomerCategoryId { get; set; }

        [Required]
        public string CategoryName { get; set; } = string.Empty;

        [Required]
        public string CategoryCode { get; set; } = string.Empty;

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}

//        [Key]
//        public int CustomerCategoryId { get; set; }

//        [Required]
//        public string CategoryName { get; set; }

//        [Required]
//        public string CategoryCode { get; set; }

//        [DefaultValue(true)]
//        public bool IsActive { get; set; } = true;

//        public bool IsDeleted { get; set; } = false;
//    }
//}




//        [Key]
//        public int ID { get; set; }

//        [Required]
//        public string CompanyCategoryName { get; set; }

//        [DefaultValue(true)]
//        public bool IsActive { get; set; }

//        [DefaultValue(false)]
//        public bool IsDeleted { get; set; }
//    }
//}