using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CompanyPlatform.Core.Models.CRM.CustomerArea;
using CompanyPlatform.Core.Models.CRM.CustomerSource;
using CompanyPlatform.Core.Models.CRM.PaymentTerm;

namespace CompanyPlatform.Core.Models.CRM.Company
{
    [Table("tbl_Company")]
    public class Company
    {
        // Primary Key
        [Key]
        public int CompanyId { get; set; }

        public int? CompanyTypeId { get; set; }
        [Required]
        [MaxLength(50)]
        public string CompanyCode { get; set; }

        [Required]
        public string CompanyName { get; set; }

        // Customer Basic Details
        public string? CustomerName { get; set; }

        public string? CustomerShortName { get; set; }

        public string? CompanyGroup { get; set; }

        public string? PlantCode { get; set; }

        public string? VendorSupplierCode { get; set; }

        public string? OwnerName { get; set; }

        public string? Email { get; set; }

        public string? AlternateEmail { get; set; }

        public string? Mobile { get; set; }

        public string? AlternateMobile { get; set; }

        public string? GSTNumber { get; set; }

        public string? Website { get; set; }

        // Registration & Tax Information
        public string? PAN { get; set; }

        public string? TAN { get; set; }

        public string? GSTIN { get; set; }

        public string? CIN { get; set; }

        public string? MSMENumber { get; set; }

        // Foreign Keys & Classification
        public int? IndustryId { get; set; }

        public int? CompanyCategoryId { get; set; }

        public int? ClientTypeId { get; set; }

        public int? CompanyStatusId { get; set; }

        public int? CustomerSourceId { get; set; }

        public int? CustomerAreaId { get; set; }

        public int? PaymentTermsId { get; set; }

        // Sales Assignment
        public int? DirectorId { get; set; }

        public int? SalesCoordinatorId { get; set; }
        public string? SalesCoordinatorName { get; set; }

        public int? CustomerOwnerId { get; set; }

        public int? SalesManagerId { get; set; }

        public int? BDEUserId { get; set; }

        public string? Address { get; set; }

        public int? CountryId { get; set; }

        public int? StateId { get; set; }

        public int? CityId { get; set; }

        public string? Pincode { get; set; }

        public DateTime? RegistrationDate { get; set; }

        public DateTime? VisitedDate { get; set; }

        public string? Remarks { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        // Navigation Properties

        [ForeignKey(nameof(IndustryId))]
        public virtual Industry? Industry { get; set; }

        [ForeignKey(nameof(CompanyCategoryId))]
        public virtual CustomerCategory? CompanyCategory { get; set; }

        [ForeignKey(nameof(ClientTypeId))]
        public virtual ClientType? ClientType { get; set; }

        [ForeignKey(nameof(CompanyStatusId))]
        public virtual CustomerStatus? CompanyStatus { get; set; }

        [ForeignKey(nameof(CustomerSourceId))]
        public virtual CustomerSource.CustomerSource? CustomerSource { get; set; }

        [ForeignKey(nameof(CustomerAreaId))]
        public virtual CustomerArea.CustomerArea? CustomerArea { get; set; }

        [ForeignKey(nameof(PaymentTermsId))]
        public virtual PaymentTerm.PaymentTerm? PaymentTerm { get; set; }

        [ForeignKey(nameof(CountryId))]
        public virtual Country? Country { get; set; }

        [ForeignKey(nameof(StateId))]
        public virtual State? State { get; set; }

        [ForeignKey(nameof(CityId))]
        public virtual City? City { get; set; }

        [ForeignKey(nameof(DirectorId))]
        public virtual Employee? Director { get; set; }

        [ForeignKey(nameof(SalesCoordinatorId))]
        public virtual Employee? SalesCoordinator { get; set; }

        [ForeignKey(nameof(CustomerOwnerId))]
        public virtual Employee? CustomerOwner { get; set; }

        [ForeignKey(nameof(SalesManagerId))]
        public virtual Employee? SalesManager { get; set; }

        [ForeignKey(nameof(BDEUserId))]
        public virtual Employee? BDEUser { get; set; }

        [ForeignKey(nameof(CreatedBy))]
        public virtual Employee? CreatedByEmployee { get; set; }

        [ForeignKey(nameof(UpdatedBy))]
        public virtual Employee? UpdatedByEmployee { get; set; }

        public bool IsDeleted { get; set; } = false;

        // Customer Business Aliases (Not Mapped)
        [NotMapped]
        public int CustomerId { get => CompanyId; set => CompanyId = value; }

        [NotMapped]
        public string CustomerCode { get => CompanyCode; set => CompanyCode = value; }
    }

    [NotMapped]
    public class Customer : Company
    {
    }
}