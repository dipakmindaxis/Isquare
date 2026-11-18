using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_Designation")]
    public class Designation
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public string DesignationName { get; set; } = string.Empty;
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

    }
}
