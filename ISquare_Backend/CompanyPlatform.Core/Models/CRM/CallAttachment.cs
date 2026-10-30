using CompanyPlatform.Core.Models.CRM.Company;
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

namespace CompanyPlatform.Core.Models.CRM.Call
{
    [Table("tbl_CallAttachment")]
    public class CallAttachment
    {
        [Key]
        public int AttachmentId { get; set; }

        [Required]
        public int CallId { get; set; }
        [ForeignKey("CallId")]
        public virtual Call Call { get; set; }

        [Required]
        public string DocumentName { get; set; }

        [Required]
        public string FileName { get; set; }

        [Required]
        public string FilePath { get; set; }

        [Required]
        public string FileExtension { get; set; }

        public long FileSize { get; set; }

        public int UploadedBy { get; set; }
        [ForeignKey("UploadedBy")]
        public virtual CompanyPlatform.Core.Models.CRM.Company.Employee UploadedByEmployee { get; set; }

        public DateTime UploadedDate { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}


