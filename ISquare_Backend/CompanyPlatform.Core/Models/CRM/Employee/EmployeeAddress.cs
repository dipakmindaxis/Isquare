using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.Employee
{
    [Table("tbl_EmployeeAddress")]
    public class EmployeeAddress
    {
        [Key]
        public int ID { get; set; }
        public int EmployeeID { get; set; }
        public string AddressType { get; set; } // "Current" or "Permanent"

        public string? FlatNo { get; set; }
        public string? PremisesName { get; set; }
        public string? RoadName { get; set; }
        public string? Locality { get; set; }
        public string? TownDistrict { get; set; }
        public string? PinNo { get; set; }
        public string? MobileNo { get; set; }
        public string? AltMobileNo { get; set; }
        public string? Email { get; set; }
        public string? AltEmail { get; set; }


        //[ForeignKey("EmployeeID")]
        //public virtual Employee Employee { get; set; }
    }
}
