using CompanyPlatform.Core.Models.CRM.Employee;
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
    [Table("tbl_CompanyDocument")]
    public class CompanyDocument
    {
        // Primary Key
        [Key]
        public int DocumentId { get; set; }

        // Foreign Keys
        public int CompanyId { get; set; }

        public int DocumentTypeId { get; set; }

        public int UploadedBy { get; set; }

        // Document Details
        [Required]
        public string DocumentName { get; set; }

        [Required]
        public string FileName { get; set; }

        [Required]
       
        public string FilePath { get; set; }

      
        public string? FileExtension { get; set; }

        public long FileSize { get; set; }

        public DateTime UploadedDate { get; set; } = DateTime.Now;

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        // Navigation Properties

        [ForeignKey(nameof(CompanyId))]
        public virtual Company? Company { get; set; }

        [ForeignKey(nameof(DocumentTypeId))]
        public virtual DocumentType? DocumentType { get; set; }

        [ForeignKey(nameof(UploadedBy))]
        public virtual Employees? UploadedByEmployee { get; set; }
    }
}