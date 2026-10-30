using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CompanyPlatform.Core.Models.CRM.Company;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("bde_user")]
    public class BDEUser
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public string Value { get; set; } = string.Empty;

        [Required]
        public string Code { get; set; } = string.Empty;

        [DefaultValue(true)]
        public bool IsActive { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

        // Employee ID of the Director or other reporting role
        public int? DirectorEmployeeId { get; set; }

        // References tbl_Employee
        [ForeignKey(nameof(DirectorEmployeeId))]
        public virtual CompanyPlatform.Core.Models.CRM.Company.Employee? DirectorEmployee { get; set; }
    }
}


