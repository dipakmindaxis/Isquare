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

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("tbl_TaskAttachment")]
    public class TaskAttachment
    {
        [Key]
        public int AttachmentId { get; set; }

        [Required]
        public int TaskId { get; set; }
        [ForeignKey("TaskId")]
        public virtual Tasks Task { get; set; } = null!;

        [Required]
        public string DocumentName { get; set; } = string.Empty;

        [Required]
        public string FileName { get; set; } = string.Empty;

        [Required]
        public string FilePath { get; set; } = string.Empty;

        [Required]
        public string FileExtension { get; set; } = string.Empty;

        public long FileSize { get; set; }

        public int UploadedBy { get; set; }
        [ForeignKey("UploadedBy")]
        public virtual Employee.Employee UploadedByEmployee { get; set; } = null!;

        public DateTime UploadedDate { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        [DefaultValue(false)]
        public bool IsDeleted { get; set; } = false;
    }
}

