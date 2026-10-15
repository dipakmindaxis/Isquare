//using CompanyPlatform.Core.Models.CRM.Employee;
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
//    [Table("tbl_Company")]
//    public class Company
//    {
//        // Primary Key
//        [Key]
//        public int CompanyId { get; set; }

//        public int? CompanyTypeId { get; set; }

//        [Required]
//        public string CompanyCode { get; set; }

//        [Required]
//        public string CompanyName { get; set; }

//        public string? OwnerName { get; set; }

//        public string? Email { get; set; }

//        public string? AlternateEmail { get; set; }

//        public string? Mobile { get; set; }

//        public string? AlternateMobile { get; set; }

//        public string? GSTNumber { get; set; }

//        public string? Website { get; set; }

//        // Foreign Keys
//        public int? IndustryId { get; set; }

//        public int? CompanyCategoryId { get; set; }

//        public int? ClientTypeId { get; set; }

//        public int? CompanyStatusId { get; set; }

//        public int? SalesManagerId { get; set; }

//        public int? BDEUserId { get; set; }

//        public string? Address { get; set; }

//        public int? CountryId { get; set; }

//        public int? StateId { get; set; }

//        public int? CityId { get; set; }

//        public string? Pincode { get; set; }

//        public DateTime? RegistrationDate { get; set; }

//        public DateTime? VisitedDate { get; set; }

//        public string? Remarks { get; set; }

//        [DefaultValue(true)]
//        public bool IsActive { get; set; }

//        public int? CreatedBy { get; set; }

//        public DateTime? CreatedDate { get; set; }

//        public int? UpdatedBy { get; set; }

//        public DateTime? UpdatedDate { get; set; }

//        // Navigation Properties

//        [ForeignKey(nameof(IndustryId))]
//        public virtual Industry? Industry { get; set; }

//        [ForeignKey(nameof(CompanyCategoryId))]
//        public virtual CompanyCategory? CompanyCategory { get; set; }

//        [ForeignKey(nameof(ClientTypeId))]
//        public virtual ClientType? ClientType { get; set; }

//        [ForeignKey(nameof(CompanyStatusId))]
//        public virtual CompanyStatus? CompanyStatus { get; set; }

//        [ForeignKey(nameof(CountryId))]
//        public virtual Country? Country { get; set; }

//        [ForeignKey(nameof(StateId))]
//        public virtual State? State { get; set; }

//        [ForeignKey(nameof(CityId))]
//        public virtual City? City { get; set; }

//        [ForeignKey(nameof(SalesManagerId))]
//        public virtual Employees? SalesManager { get; set; }

//        [ForeignKey(nameof(BDEUserId))]
//        public virtual Employees? BDEUser { get; set; }

//        [ForeignKey(nameof(CreatedBy))]
//        public virtual Employees? CreatedByEmployee { get; set; }

//        [ForeignKey(nameof(UpdatedBy))]
//        public virtual Employees? UpdatedByEmployee { get; set; }

//        public bool IsDeleted { get; set; } = false;
//    }
//}